import { publicSiteUrl } from '../../src/lib/seo'

export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  // Cùng quy tắc với canonical (ép https trừ localhost) để robots, sitemap và canonical khớp nhau.
  const siteUrl = publicSiteUrl(String(config.public.siteUrl || getRequestURL(event).origin))

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /checkout',
    'Disallow: /order-success',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
