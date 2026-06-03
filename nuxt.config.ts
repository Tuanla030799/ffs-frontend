import tailwindcss from '@tailwindcss/vite'
import { fileURLToPath, URL } from 'node:url'

const apiBaseUrl = process.env.NUXT_PUBLIC_API_BASE_URL || process.env.VITE_API_BASE_URL || '/api'
const apiTimeout = process.env.NUXT_PUBLIC_API_TIMEOUT || process.env.VITE_API_TIMEOUT || '15000'
const fileBaseUrl = process.env.NUXT_PUBLIC_FILE_BASE_URL || process.env.VITE_FILE_BASE_URL || ''
const siteUrl = process.env.NUXT_PUBLIC_SITE_URL || 'http://localhost:3000'

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
      ],
      link: [
        { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
        { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossorigin: '' },
        {
          rel: 'stylesheet',
          href: 'https://fonts.googleapis.com/css2?family=Montserrat:ital,wght@0,100..900;1,100..900&display=swap',
        },
      ],
    },
  },
  routeRules: {
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
