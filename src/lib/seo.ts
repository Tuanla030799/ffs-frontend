export const DEFAULT_SITE_URL = 'https://thepocketshoes.store'
export const DEFAULT_OG_IMAGE_PATH = '/thepocketshoes-og.jpg'

export function publicSiteUrl(value?: string | null) {
  const siteUrl = String(value || DEFAULT_SITE_URL).replace(/\/+$/, '')
  return siteUrl.includes('localhost') ? siteUrl : siteUrl.replace(/^http:\/\//, 'https://')
}

export function absoluteUrl(value: string, siteUrl = DEFAULT_SITE_URL) {
  if (/^https?:\/\//i.test(value)) return value
  if (value.startsWith('//')) return `https:${value}`
  return new URL(value || DEFAULT_OG_IMAGE_PATH, `${publicSiteUrl(siteUrl)}/`).href
}

export function defaultOgImage(siteUrl?: string | null) {
  return absoluteUrl(DEFAULT_OG_IMAGE_PATH, publicSiteUrl(siteUrl))
}

export function ogImageOrDefault(value?: string | null, siteUrl?: string | null) {
  return absoluteUrl(value?.trim() || DEFAULT_OG_IMAGE_PATH, publicSiteUrl(siteUrl))
}

export const SITE_NAME = 'The Pocket Shoes'
const META_DESCRIPTION_MAX_LENGTH = 160
const TEXT_ENTITIES: Record<string, string> = {
  nbsp: ' ',
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
}

function decodeTextEntities(value: string) {
  return value.replace(/&(#\d{1,7}|#x[\da-f]{1,6}|[a-z]+);/gi, (match, entity: string) => {
    if (entity[0] !== '#') return TEXT_ENTITIES[entity.toLowerCase()] ?? match
    const codePoint =
      entity[1] === 'x' || entity[1] === 'X'
        ? Number.parseInt(entity.slice(2), 16)
        : Number.parseInt(entity.slice(1), 10)
    return codePoint > 0 && codePoint <= 0x10ffff ? String.fromCodePoint(codePoint) : match
  })
}

// Văn bản thuần từ HTML rich text (mô tả sản phẩm, blog) để làm meta description. Ưu tiên nội
// dung đoạn văn/danh sách vì tiêu đề trong nội dung thường lặp lại tên sản phẩm.
export function htmlToPlainText(html?: string | null) {
  if (!html) return ''
  const blocks = Array.from(html.matchAll(/<(p|li)\b[^>]*>([\s\S]*?)<\/\1>/gi), (match) => match[2])
  const source = blocks.length ? blocks.join(' ') : html
  return decodeTextEntities(source.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim()
}

export function truncateText(text: string, maxLength = META_DESCRIPTION_MAX_LENGTH) {
  const normalized = text.replace(/\s+/g, ' ').trim()
  if (normalized.length <= maxLength) return normalized
  const cut = normalized.slice(0, maxLength - 1)
  const lastSpace = cut.lastIndexOf(' ')
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).replace(/[\s,.;:–-]+$/, '')}…`
}

// Lấy ứng viên đầu tiên có nội dung rồi cắt về độ dài phù hợp cho thẻ meta description.
export function metaDescription(...candidates: Array<string | null | undefined>) {
  const text = candidates.map((candidate) => candidate?.replace(/\s+/g, ' ').trim()).find(Boolean)
  return text ? truncateText(text) : ''
}

// Canonical cho trang danh sách: bỏ tham số lọc/sắp xếp (tránh nội dung trùng), chỉ giữ số trang.
export function listingCanonicalUrl(siteUrl: string, path: string, page = 1) {
  const url = `${publicSiteUrl(siteUrl)}${path}`
  return page > 1 ? `${url}?page=${page}` : url
}

// Script JSON-LD: escape `<` để nội dung từ BE (tên sản phẩm...) không thể đóng thẻ <script>.
export function jsonLdScript(data: Record<string, unknown>) {
  return {
    type: 'application/ld+json' as const,
    innerHTML: JSON.stringify(data).replace(/</g, '\\u003c'),
  }
}

export function breadcrumbJsonLd(siteUrl: string, items: Array<{ name: string; path: string }>) {
  const baseUrl = publicSiteUrl(siteUrl)
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Trang chủ', path: '/' }, ...items].map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${baseUrl}${item.path}`,
    })),
  }
}
