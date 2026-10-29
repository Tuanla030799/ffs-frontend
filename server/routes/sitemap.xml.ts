import type { H3Event } from 'h3'
import { publicSiteUrl } from '../../src/lib/seo'

type SitemapEntry = { path: string; lastmod?: string; images?: string[] }
type ApiList<T> = { data?: { items?: T[]; totalPages?: number } }
type SlugRow = {
  slug?: string
  createdAt?: string
  updatedAt?: string
  publishedAt?: string
  primaryImageUrl?: string
}

// BE giới hạn limit tối đa 100.
const PAGE_SIZE = 100
const MAX_PAGES = 50
const STATIC_PATHS = ['/', '/products', '/collections', '/brands', '/blogs', '/about', '/faq']

function apiBaseUrl(event: H3Event) {
  const configured = String(useRuntimeConfig(event).public.apiBaseUrl || '/api').replace(/\/+$/, '')
  if (/^https?:\/\//i.test(configured)) return configured
  return `${getRequestURL(event).origin}${configured.startsWith('/') ? '' : '/'}${configured}`
}

async function fetchAll(baseUrl: string, path: string) {
  const rows: SlugRow[] = []
  for (let page = 1; page <= MAX_PAGES; page += 1) {
    const response = await $fetch<ApiList<SlugRow>>(`${baseUrl}${path}`, {
      query: { page, limit: PAGE_SIZE },
      timeout: 15000,
    })
    rows.push(...(response.data?.items || []))
    if (page >= Number(response.data?.totalPages || 1)) break
  }
  return rows.filter((row) => row.slug)
}

// Mốc muộn nhất trong các giá trị hợp lệ. `updatedAt` của sản phẩm đã gồm cả thay đổi biến thể,
// SKU và tồn kho; bài blog hẹn giờ có thể có `publishedAt` muộn hơn lần sửa cuối.
function lastmod(...values: (string | undefined)[]) {
  const times = values
    .map((value) => (value ? new Date(value).getTime() : Number.NaN))
    .filter((time) => !Number.isNaN(time))
  return times.length ? new Date(Math.max(...times)).toISOString() : undefined
}

// Kết quả lỗi (throw) không bị cache, nên lần sau sẽ thử lại API.
const loadDynamicEntries = defineCachedFunction(
  async (event: H3Event): Promise<SitemapEntry[]> => {
    const baseUrl = apiBaseUrl(event)
    const [products, collections, blogs] = await Promise.all([
      fetchAll(baseUrl, '/products'),
      fetchAll(baseUrl, '/collections'),
      fetchAll(baseUrl, '/blogs'),
    ])

    return [
      ...products.map((row) => ({
        path: `/products/${encodeURIComponent(row.slug!)}`,
        lastmod: lastmod(row.updatedAt, row.createdAt),
        images: row.primaryImageUrl ? [row.primaryImageUrl] : [],
      })),
      ...collections.map((row) => ({
        path: `/collections/${encodeURIComponent(row.slug!)}`,
        lastmod: lastmod(row.updatedAt, row.createdAt),
      })),
      ...blogs.map((row) => ({
        path: `/blogs/${encodeURIComponent(row.slug!)}`,
        lastmod: lastmod(row.updatedAt, row.publishedAt, row.createdAt),
      })),
    ]
  },
  { name: 'sitemap-entries', maxAge: 60 * 60, swr: true, getKey: () => 'all' },
)

function escapeXml(value: string) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

function absoluteImageUrl(siteUrl: string, url: string) {
  return /^https?:\/\//i.test(url) ? url : `${siteUrl}${url.startsWith('/') ? '' : '/'}${url}`
}

export default defineEventHandler(async (event) => {
  const config = useRuntimeConfig(event)
  const siteUrl = publicSiteUrl(String(config.public.siteUrl || getRequestURL(event).origin))

  let dynamicEntries: SitemapEntry[] = []
  try {
    dynamicEntries = await loadDynamicEntries(event)
    setHeader(event, 'cache-control', 'public, max-age=3600')
  } catch (error) {
    // API lỗi: vẫn trả sitemap gồm các trang tĩnh, không để trình duyệt/CDN cache bản thiếu này.
    console.error('[sitemap] Không tải được dữ liệu từ API', error)
    setHeader(event, 'cache-control', 'no-store')
  }

  const entries: SitemapEntry[] = [...STATIC_PATHS.map((path) => ({ path })), ...dynamicEntries]
  const urls = entries
    .map((entry) =>
      [
        '  <url>',
        `    <loc>${escapeXml(`${siteUrl}${entry.path}`)}</loc>`,
        entry.lastmod ? `    <lastmod>${entry.lastmod}</lastmod>` : '',
        ...(entry.images || []).map(
          (image) =>
            `    <image:image><image:loc>${escapeXml(absoluteImageUrl(siteUrl, image))}</image:loc></image:image>`,
        ),
        '  </url>',
      ]
        .filter(Boolean)
        .join('\n'),
    )
    .join('\n')

  setHeader(event, 'content-type', 'application/xml; charset=utf-8')

  return [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    urls,
    '</urlset>',
    '',
  ].join('\n')
})
