import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || ''
const apiTimeout = process.env.NUXT_PUBLIC_API_TIMEOUT || '15000'
const fileBaseUrl = process.env.NUXT_PUBLIC_FILE_BASE_URL || ''
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'
const publicSiteUrl = siteUrl.includes('localhost')
  ? siteUrl.replace(/\/+$/, '')
  : siteUrl.replace(/^http:\/\//, 'https://').replace(/\/+$/, '')
const defaultOgImage = `${publicSiteUrl}/thepocketshoes-og.jpg`
const publicDetailCache = {
  swr: 300,
  headers: {
    'cache-control': 'public, max-age=60, s-maxage=300, stale-while-revalidate=86400',
  },
}

export default defineNuxtConfig({
  compatibilityDate: '2026-05-11',
  srcDir: 'src/',
  dir: {
    app: '.',
    layouts: 'nuxt-layouts',
    middleware: 'nuxt-middleware',
    pages: 'nuxt-pages',
    plugins: 'nuxt-plugins',
  },
  modules: ['@pinia/nuxt'],
  css: ['~/style.css'],
  alias: {
    '@': fileURLToPath(new URL('./src', import.meta.url)),
  },
  runtimeConfig: {
    public: {
      apiBaseUrl,
      apiTimeout,
      fileBaseUrl,
      siteUrl,
    },
  },
  app: {
    head: {
      htmlAttrs: { lang: 'vi' },
      meta: [
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'theme-color', content: '#ffffff' },
        { property: 'og:image', content: defaultOgImage },
        { property: 'og:image:alt', content: 'The Pocket Shoes' },
        { property: 'og:image:width', content: '1000' },
        { property: 'og:image:height', content: '1000' },
        { name: 'twitter:card', content: 'summary_large_image' },
        { name: 'twitter:image', content: defaultOgImage },
      ],
      link: [
        { rel: 'icon', type: 'image/svg+xml', href: '/logo.svg?v=1' },
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:ital,wght@0,100..700;1,100..700&display=swap',
        },
      ],
    },
  },
  routeRules: {
    '/products/**': publicDetailCache,
    '/blogs/**': publicDetailCache,
    '/collections/**': publicDetailCache,
    '/brands/**': publicDetailCache,
    '/admin/**': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow' },
    },
    '/checkout': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow' },
    },
    '/order-success': {
      ssr: false,
      headers: { 'x-robots-tag': 'noindex, nofollow' },
    },
  },
  vite: {
    plugins: [tailwindcss()],
  },
  typescript: {
    typeCheck: true,
  },
})
