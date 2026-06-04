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
