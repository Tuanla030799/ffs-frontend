import DOMPurify from 'dompurify'

const ALLOWED_STYLE_PROPS = new Set(['color', 'background-color', 'text-align'])
const UNSAFE_STYLE_VALUE_PATTERN =
  /(?:url\s*\(|expression\s*\(|javascript:|data:|vbscript:|@import|behavior\s*:|[\\<>])/i

function sanitizeStyleAttribute(value: string) {
  return value
    .split(';')
    .map((declaration) => declaration.trim())
    .filter(Boolean)
    .map((declaration) => {
      const separatorIndex = declaration.indexOf(':')
      if (separatorIndex < 1) return ''

      const property = declaration.slice(0, separatorIndex).trim().toLowerCase()
      const propertyValue = declaration.slice(separatorIndex + 1).trim()

      if (!ALLOWED_STYLE_PROPS.has(property)) return ''
      if (!propertyValue || UNSAFE_STYLE_VALUE_PATTERN.test(propertyValue)) return ''

      return `${property}: ${propertyValue}`
    })
    .filter(Boolean)
    .join('; ')
}

const ALLOWED_TAGS = [
  'p',
  'br',
  'span',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'li',
  'blockquote',
  'cite',
  'a',
  'img',
  'table',
  'thead',
  'tbody',
  'tr',
  'th',
  'td',
  'code',
  'pre',
  'figure',
  'figcaption',
  'hr',
]

const ALLOWED_ATTR = [
  'href',
  'target',
  'rel',
  'src',
  'alt',
  'title',
  'width',
  'height',
  'class',
  'style',
  'data-file-id',
  'data-path',
]

const SAFE_LINK_REL = 'noopener noreferrer'

let isDomPurifyConfigured = false

function configureDomPurify() {
  if (isDomPurifyConfigured || typeof DOMPurify.addHook !== 'function') return

  DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
    if (data.attrName.toLowerCase().startsWith('on')) data.keepAttr = false
    if (data.attrName.toLowerCase() === 'style') {
      data.attrValue = sanitizeStyleAttribute(data.attrValue)
      data.keepAttr = Boolean(data.attrValue)
    }
  })
  DOMPurify.addHook('afterSanitizeAttributes', (node) => {
    if (node.tagName === 'A' && node.getAttribute('target') === '_blank') {
      node.setAttribute('rel', SAFE_LINK_REL)
    }
  })

  isDomPurifyConfigured = true
}

// ---------------------------------------------------------------------------
// Bộ lọc dùng khi SSR (Node/Workers không có DOM nên DOMPurify không chạy được).
// Nguyên tắc an toàn: đọc input thành token rồi tự dựng lại toàn bộ output. Mọi ký tự `<`/`>`
// không thuộc một thẻ được cho phép đều bị escape, mọi thẻ/thuộc tính trong output do chính
// hàm này tạo ra, nên trình duyệt không thể đọc ra thẻ hay thuộc tính nào ngoài allowlist.
// ---------------------------------------------------------------------------

const ALLOWED_TAG_SET = new Set(ALLOWED_TAGS)
const ALLOWED_ATTR_SET = new Set(ALLOWED_ATTR)
const VOID_TAGS = new Set(['br', 'hr', 'img'])
// Bỏ cả phần nội dung bên trong (tương tự FORBID_CONTENTS của DOMPurify).
const DROP_CONTENT_TAGS = new Set([
  'script',
  'style',
  'iframe',
  'object',
  'template',
  'noscript',
  'noembed',
  'noframes',
  'textarea',
  'title',
  'xmp',
  'svg',
  'math',
])
// Thẻ mở các phần tử này sẽ tự đóng thẻ <p> đang mở (theo quy tắc phân tích HTML).
const CLOSES_PARAGRAPH = new Set([
  'p',
  'h1',
  'h2',
  'h3',
  'h4',
  'ul',
  'ol',
  'blockquote',
  'pre',
  'figure',
  'figcaption',
  'hr',
  'table',
])
const SCOPE_BOUNDARY_TAGS = new Set(['table', 'td', 'th'])
const URL_ATTRS = new Set(['href', 'src'])
const HTML_WHITESPACE = /[\t\n\f\r ]/
const TAG_NAME_PATTERN = /[a-zA-Z][^\t\n\f\r />]*/y
const URL_SCHEME_PATTERN = /^[a-z][a-z\d+.-]*:/i
const SAFE_URL_SCHEME_PATTERN = /^(?:https?|mailto|tel):/i
const SAFE_DATA_IMAGE_PATTERN = /^data:image\/(?:png|gif|jpe?g|webp|avif);base64,/i
const BASIC_ENTITIES: Record<string, string> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
}

type ParsedTag = {
  name: string
  closing: boolean
  attrs: Array<[name: string, value: string | null]>
  end: number
}

function escapeText(value: string) {
  return value.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

function escapeAttribute(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
}

// Giải mã một phần entity để kiểm tra giá trị thuộc tính. Output luôn escape mọi `&`, nên giá trị
// trình duyệt nhận được đúng bằng chuỗi đã kiểm tra ở đây (entity lạ chỉ hiển thị nguyên văn).
function decodeEntities(value: string) {
  return value.replace(
    /&(?:#(\d{1,7})|#x([\da-f]{1,6})|([a-z][a-z\d]{1,31}));/gi,
    (match, decimal?: string, hex?: string, named?: string) => {
      if (named) return BASIC_ENTITIES[named.toLowerCase()] ?? match

      const codePoint = decimal ? Number.parseInt(decimal, 10) : Number.parseInt(hex || '', 16)
      if (!codePoint || codePoint > 0x10ffff || (codePoint >= 0xd800 && codePoint <= 0xdfff)) {
        return '�'
      }
      return String.fromCodePoint(codePoint)
    },
  )
}

function sanitizeUrl(value: string, tagName: string, attrName: string) {
  // Chuẩn hoá giống trình duyệt khi phân tích URL: bỏ tab/xuống dòng ở mọi vị trí và ký tự
  // điều khiển/khoảng trắng ở hai đầu (chặn ` javascript:` hay `java\tscript:`).
  const url = value
    .replace(/[\t\n\r]/g, '')
    // eslint-disable-next-line no-control-regex
    .replace(/^[\u0000- ]+|[\u0000- ]+$/g, '')

  if (!url) return ''
  if (!URL_SCHEME_PATTERN.test(url) || SAFE_URL_SCHEME_PATTERN.test(url)) return url
  if (tagName === 'img' && attrName === 'src' && SAFE_DATA_IMAGE_PATTERN.test(url)) return url
  return ''
}

function parseTag(html: string, start: number): ParsedTag | null {
  let index = start + 1
  const closing = html[index] === '/'
  if (closing) index += 1

  TAG_NAME_PATTERN.lastIndex = index
  const nameMatch = TAG_NAME_PATTERN.exec(html)
  if (!nameMatch) return null

  const name = nameMatch[0].toLowerCase()
  const attrs: ParsedTag['attrs'] = []
  index += nameMatch[0].length

  while (index < html.length) {
    while (index < html.length && (HTML_WHITESPACE.test(html[index]!) || html[index] === '/')) {
      index += 1
    }
    if (index >= html.length) return null
    if (html[index] === '>') return { name, closing, attrs, end: index + 1 }

    const attrNameStart = index
    if (html[index] === '=') index += 1
    while (index < html.length && !/[\t\n\f\r />=]/.test(html[index]!)) index += 1
    const attrName = html.slice(attrNameStart, index).toLowerCase()

    while (index < html.length && HTML_WHITESPACE.test(html[index]!)) index += 1

    let value: string | null = null
    if (html[index] === '=') {
      index += 1
      while (index < html.length && HTML_WHITESPACE.test(html[index]!)) index += 1

      const quote = html[index]
      if (quote === '"' || quote === "'") {
        const closeIndex = html.indexOf(quote, index + 1)
        if (closeIndex === -1) return null
        value = html.slice(index + 1, closeIndex)
        index = closeIndex + 1
      } else {
        const valueStart = index
        while (index < html.length && !/[\t\n\f\r >]/.test(html[index]!)) index += 1
        value = html.slice(valueStart, index)
      }
    }

    attrs.push([attrName, value])
  }

  return null
}

function skipDroppedContent(html: string, tagName: string, from: number) {
  const closingTag = new RegExp(`</${tagName}(?=[\\t\\n\\f\\r />]|$)`, 'gi')
  closingTag.lastIndex = from
  const match = closingTag.exec(html)
  if (!match) return html.length

  const end = html.indexOf('>', match.index)
  return end === -1 ? html.length : end + 1
}

function serializeAttributes(tagName: string, attrs: ParsedTag['attrs']) {
  const seen = new Set<string>()
  const result = new Map<string, string>()

  for (const [name, rawValue] of attrs) {
    if (seen.has(name)) continue
    seen.add(name)

    if (rawValue === null || name.startsWith('on') || !ALLOWED_ATTR_SET.has(name)) continue

    let value = decodeEntities(rawValue)
    if (URL_ATTRS.has(name)) value = sanitizeUrl(value, tagName, name)
    else if (name === 'style') value = sanitizeStyleAttribute(value)

    if (value || (!URL_ATTRS.has(name) && name !== 'style')) result.set(name, value)
  }

  if (tagName === 'a' && result.get('target') === '_blank') result.set('rel', SAFE_LINK_REL)

  return Array.from(result, ([name, value]) => ` ${name}="${escapeAttribute(value)}"`).join('')
}

// Giữ HTML luôn cân bằng thẻ để nội dung lỗi (ví dụ <table> không đóng) không kéo phần còn lại
// của trang vào bên trong nó khi SSR.
class OpenElementStack {
  private stack: string[] = []

  private findOpen(tagName: string, boundaries: Set<string>) {
    for (let index = this.stack.length - 1; index >= 0; index -= 1) {
      const current = this.stack[index]!
      if (current === tagName) return index
      if (boundaries.has(current)) return -1
    }
    return -1
  }

  private closeFrom(index: number) {
    let output = ''
    while (this.stack.length > index) output += `</${this.stack.pop()}>`
    return output
  }

  open(tagName: string) {
    let output = ''
    if (CLOSES_PARAGRAPH.has(tagName)) {
      const paragraph = this.findOpen('p', SCOPE_BOUNDARY_TAGS)
      if (paragraph !== -1) output += this.closeFrom(paragraph)
    }
    if (tagName === 'li') {
      const item = this.findOpen('li', new Set(['ul', 'ol', ...SCOPE_BOUNDARY_TAGS]))
      if (item !== -1) output += this.closeFrom(item)
    }
    if (tagName === 'td' || tagName === 'th') {
      const cell = Math.max(
        this.findOpen('td', new Set(['tr', 'table'])),
        this.findOpen('th', new Set(['tr', 'table'])),
      )
      if (cell !== -1) output += this.closeFrom(cell)
    }
    if (tagName === 'tr') {
      const row = this.findOpen('tr', new Set(['table', 'thead', 'tbody']))
      if (row !== -1) output += this.closeFrom(row)
    }
    if (tagName === 'thead' || tagName === 'tbody') {
      const section = Math.max(
        this.findOpen('thead', new Set(['table'])),
        this.findOpen('tbody', new Set(['table'])),
      )
      if (section !== -1) output += this.closeFrom(section)
    }

    if (!VOID_TAGS.has(tagName)) this.stack.push(tagName)
    return output
  }

  close(tagName: string) {
    const index = this.stack.lastIndexOf(tagName)
    return index === -1 ? '' : this.closeFrom(index)
  }

  closeAll() {
    return this.closeFrom(0)
  }
}

function sanitizeServerHtml(input: string) {
  const html = input.replace(/\0/g, '')
  const openElements = new OpenElementStack()
  let output = ''
  let index = 0

  while (index < html.length) {
    const tagStart = html.indexOf('<', index)
    if (tagStart === -1) {
      output += escapeText(html.slice(index))
      break
    }

    output += escapeText(html.slice(index, tagStart))

    if (html.startsWith('<!--', tagStart)) {
      const commentEnd = html.indexOf('-->', tagStart + 4)
      index = commentEnd === -1 ? html.length : commentEnd + 3
      continue
    }

    const nextChar = html[tagStart + 1]
    if (nextChar === '!' || nextChar === '?') {
      const end = html.indexOf('>', tagStart + 2)
      index = end === -1 ? html.length : end + 1
      continue
    }

    const tag = parseTag(html, tagStart)
    if (!tag) {
      output += '&lt;'
      index = tagStart + 1
      continue
    }

    index = tag.end
    if (!tag.closing && DROP_CONTENT_TAGS.has(tag.name)) {
      index = skipDroppedContent(html, tag.name, index)
      continue
    }
    if (!ALLOWED_TAG_SET.has(tag.name)) continue

    if (tag.closing) {
      output += openElements.close(tag.name)
      continue
    }

    output += openElements.open(tag.name)
    output += `<${tag.name}${serializeAttributes(tag.name, tag.attrs)}>`
  }

  return output + openElements.closeAll()
}

export function sanitizeHtml(html?: string | null) {
  const dirtyHtml = html || ''

  if (typeof DOMPurify.sanitize !== 'function') {
    return sanitizeServerHtml(dirtyHtml)
  }

  configureDomPurify()

  return DOMPurify.sanitize(dirtyHtml, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  })
}
