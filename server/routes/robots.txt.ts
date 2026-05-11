export default defineEventHandler((event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = String(config.public.siteUrl || getRequestURL(event).origin).replace(/\/+$/, '')

  setHeader(event, 'content-type', 'text/plain; charset=utf-8')

  return [
    'User-agent: *',
    'Disallow: /admin',
    'Disallow: /checkout',
    'Disallow: /order-success',
    'Disallow: /login',
    'Disallow: /register',
    'Disallow: /account',
    'Disallow: /profile',
    `Sitemap: ${siteUrl}/sitemap.xml`,
    '',
  ].join('\n')
})
