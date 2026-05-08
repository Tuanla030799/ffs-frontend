import DOMPurify from 'dompurify'

DOMPurify.addHook('uponSanitizeAttribute', (_node, data) => {
  if (data.attrName.toLowerCase().startsWith('on')) data.keepAttr = false
  if (data.attrName.toLowerCase() === 'style') {
    data.attrValue = sanitizeStyleAttribute(data.attrValue)
    data.keepAttr = Boolean(data.attrValue)
  }
})

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

export function sanitizeHtml(html?: string | null) {
  return DOMPurify.sanitize(html || '', {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    FORBID_TAGS: ['script', 'style', 'iframe', 'object', 'embed'],
    ALLOWED_URI_REGEXP: /^(?:(?:https?|mailto|tel):|[^a-z]|[a-z+.-]+(?:[^a-z+.-:]|$))/i,
  })
}
