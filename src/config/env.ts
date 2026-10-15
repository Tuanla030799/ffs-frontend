import { useRuntimeConfig } from '#imports'

type PublicRuntimeEnv = {
  apiBaseUrl?: string
  apiTimeout?: string | number
  fileBaseUrl?: string
}

// Giá trị NUXT_PUBLIC_* lúc build (nuxt.config.ts → vite.define). Dùng khi SSR không đọc được
// runtime config (ngoài ngữ cảnh Nuxt, ví dụ trong interceptor Axios) và môi trường chạy cũng
// không có biến, để không rơi về mặc định `/api` (Worker không proxy /api).
declare const __BUILD_PUBLIC_ENV__: PublicRuntimeEnv | undefined
const buildPublicEnv: PublicRuntimeEnv =
  typeof __BUILD_PUBLIC_ENV__ === 'undefined' ? {} : __BUILD_PUBLIC_ENV__

function processEnv(name: string) {
  if (typeof process === 'undefined') return undefined
  return process.env[name]
}

function runtimePublicEnv(): PublicRuntimeEnv {
  try {
    return useRuntimeConfig().public as PublicRuntimeEnv
  } catch {
    return {}
  }
}

function readString(runtimeKey: keyof PublicRuntimeEnv, nuxtKey: string, fallback = '') {
  const publicEnv = runtimePublicEnv()
  const value =
    publicEnv[runtimeKey] ?? processEnv(nuxtKey) ?? buildPublicEnv[runtimeKey] ?? fallback
  return String(value).trim()
}

export const env = {
  get apiBaseUrl() {
    return readString('apiBaseUrl', 'NUXT_PUBLIC_API_BASE_URL', '/api') || '/api'
  },
  get apiTimeout() {
    const value = readString('apiTimeout', 'NUXT_PUBLIC_API_TIMEOUT', '15000')
    return Number(value || 15000)
  },
  get fileBaseUrl() {
    return readString('fileBaseUrl', 'NUXT_PUBLIC_FILE_BASE_URL')
  },
}
