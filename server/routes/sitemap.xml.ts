const STATIC_ROUTES = ['/', '/products', '/collections', '/brands', '/blogs']

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || getRequestURL(event).origin).replace(/\/+$/, '')
  const now = new Date().toISOString()

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  const urls = STATIC_ROUTES.map((path) => {
    return [
      '  <url>',
      `    <loc>${escapeXml(`${siteUrl}${path}`)}</loc>`,
      `    <lastmod>${now}</lastmod>`,
      '  </url>',
    ].join('\n')
  }).join('\n')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
})

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}
