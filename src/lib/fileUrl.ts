import { env } from '@/config/env'

const ABSOLUTE_URL_PATTERN = /^(?:[a-z][a-z\d+\-.]*:)?\/\//i
const HTTP_URL_PATTERN = /^https?:\/\//i

// Khi FE và BE khác domain (ví dụ Cloudflare Workers không proxy /files), đường dẫn tương đối
// `/files/...` phải trỏ về BE. Ưu tiên NUXT_PUBLIC_FILE_BASE_URL, nếu trống thì dùng origin
// của NUXT_PUBLIC_API_BASE_URL khi đó là URL tuyệt đối; còn lại giữ đường dẫn tương đối như cũ.
function fileBaseUrl() {
  const configured = env.fileBaseUrl.replace(/\/+$/, '')
  if (configured) return configured

  const apiBaseUrl = env.apiBaseUrl
  if (!HTTP_URL_PATTERN.test(apiBaseUrl)) return ''

  try {
    return new URL(apiBaseUrl).origin
  } catch {
    return ''
  }
}

export function resolveFileUrl(url?: string | null) {
  const rawUrl = url?.trim()

  if (!rawUrl) return ''
  if (
    ABSOLUTE_URL_PATTERN.test(rawUrl) ||
    rawUrl.startsWith('data:') ||
    rawUrl.startsWith('blob:')
  ) {
    return rawUrl
  }

  const baseUrl = fileBaseUrl()
  if (!baseUrl) return rawUrl

  let path = rawUrl.replace(/^\/+/, '')
  // Tránh `/files/files/...` khi base đã kết thúc bằng /files và BE trả về `/files/...`.
  if (/\/files$/i.test(baseUrl) && /^files\//i.test(path)) path = path.slice('files/'.length)

  return `${baseUrl}/${path}`
}
