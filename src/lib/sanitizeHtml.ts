import DOMPurify from 'dompurify'

const ALLOWED_STYLE_PROPS = new Set(['color', 'background-color', 'text-align'])
const UNSAFE_STYLE_VALUE_PATTERN =
  /(?:url\s*\(|expression\s*\(|javascript:|data:|vbscript:|@import|behavior\s*:)/i

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

  isDomPurifyConfigured = true
}

function escapeHtml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

function sanitizeServerHtml(html: string) {
  return html
    .replace(/<\s*(script|style|iframe|object|embed)\b[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '')
    .replace(/<\s*\/?\s*([a-z0-9-]+)([^>]*)>/gi, (match, rawTag: string, rawAttrs: string) => {
      const isClosingTag = /^<\s*\//.test(match)
      const tag = rawTag.toLowerCase()

      if (!ALLOWED_TAGS.includes(tag)) return ''
      if (isClosingTag) return `</${tag}>`
      if (tag === 'br' || tag === 'hr') return `<${tag}>`

      const attrs = Array.from(
        rawAttrs.matchAll(/([:@a-zA-Z0-9_-]+)(?:\s*=\s*("([^"]*)"|'([^']*)'|([^\s"'>/=`]+)))?/g),
      )
        .map(([, rawName, , doubleQuotedValue, singleQuotedValue, unquotedValue]) => {
          const name = String(rawName).toLowerCase()
          const value = String(doubleQuotedValue ?? singleQuotedValue ?? unquotedValue ?? '')

          if (name.startsWith('on') || !ALLOWED_ATTR.includes(name)) return ''
          if (
            (name === 'href' || name === 'src') &&
            /^(?:javascript|data|vbscript):/i.test(value)
          ) {
            return ''
          }
          if (name === 'style') {
            const sanitizedStyle = sanitizeStyleAttribute(value)
            return sanitizedStyle ? ` style="${escapeHtml(sanitizedStyle)}"` : ''
          }

          return ` ${name}="${escapeHtml(value)}"`
        })
        .filter(Boolean)
        .join('')

      return `<${tag}${attrs}>`
    })
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
