import type { H3Event } from 'h3'

// Cache HTML SSR của các trang public tại edge bằng Cache API của Cloudflare (caches.default),
// giảm số lần Worker phải render (CPU) trên gói Free. Chỉ hoạt động khi chạy trên Workers
// (có event.context.cloudflare); build Node/Docker không bị ảnh hưởng.
// Lưu ý: Cache API không hoạt động trên *.workers.dev, chỉ có tác dụng trên custom domain.
const EDGE_CACHE_TTL_SECONDS = 300
const CACHEABLE_PATHS = [
  /^\/$/,
  /^\/(products|collections|brands|blogs)\/?$/,
  /^\/(products|collections|brands|blogs)\/[^/]+\/?$/,
  /^\/about\/?$/,
]

type EdgeCache = {
  match(request: Request): Promise<Response | undefined>
  put(request: Request, response: Response): Promise<void>
}

type CloudflareContext = {
  request?: Request
  context?: { waitUntil(promise: Promise<unknown>): void }
}

function edgeCache(): EdgeCache | undefined {
  return (globalThis as { caches?: { default?: EdgeCache } }).caches?.default
}

function cacheKey(event: H3Event) {
  const cloudflare = event.context.cloudflare as CloudflareContext | undefined
  const request = cloudflare?.request
  if (!request || !edgeCache() || request.method !== 'GET') return undefined
  if (request.headers.has('authorization')) return undefined

  const url = new URL(request.url)
  // Bỏ qua URL có query (bộ lọc, phân trang...) để không phình cache.
  if (url.search || !CACHEABLE_PATHS.some((pattern) => pattern.test(url.pathname))) {
    return undefined
  }
  // Gắn build ID vào khoá: sau mỗi lần deploy, HTML cũ (trỏ tới chunk JS đã bị xoá) không còn
  // được trả về nữa, tránh trang không hydrate được trong vài phút đầu.
  const buildId = String(useRuntimeConfig(event).app?.buildId || '')
  if (buildId) url.searchParams.set('__build', buildId)
  return new Request(url.toString(), { method: 'GET' })
}

export default defineNitroPlugin((nitroApp) => {
  nitroApp.hooks.hook('render:before', async (ctx) => {
    const key = cacheKey(ctx.event)
    if (!key) return

    const cached = await edgeCache()!.match(key)
    if (!cached) {
      ctx.event.context.edgeCacheKey = key
      return
    }

    ctx.response = {
      body: await cached.text(),
      statusCode: 200,
      headers: {
        'content-type': cached.headers.get('content-type') || 'text/html;charset=utf-8',
        'x-edge-cache': 'HIT',
      },
    }
  })

  nitroApp.hooks.hook('render:response', (response, { event }) => {
    const key = event.context.edgeCacheKey as Request | undefined
    if (!key) return

    response.headers = { ...response.headers, 'x-edge-cache': 'MISS' }
    const statusCode = response.statusCode ?? getResponseStatus(event)
    const headers = new Headers(response.headers as Record<string, string>)
    if (
      statusCode !== 200 ||
      typeof response.body !== 'string' ||
      event.context.skipEdgeCache ||
      headers.has('set-cookie')
    ) {
      return
    }

    headers.set('cache-control', `public, max-age=${EDGE_CACHE_TTL_SECONDS}`)
    headers.delete('x-edge-cache')
    const cloudflare = event.context.cloudflare as CloudflareContext
    const put = edgeCache()!.put(key, new Response(response.body, { status: 200, headers }))
    cloudflare.context?.waitUntil(put.catch(() => undefined))
  })
})
