import { useRuntimeConfig } from '#imports'

type PublicRuntimeEnv = {
  apiBaseUrl?: string
  apiTimeout?: string | number
  fileBaseUrl?: string
}

const viteEnv = ((import.meta as unknown as { env?: Record<string, string> }).env || {}) as Record<
  string,
  string | undefined
>

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

function readString(
  runtimeKey: keyof PublicRuntimeEnv,
  nuxtKey: string,
  viteKey: string,
  fallback = '',
) {
  const publicEnv = runtimePublicEnv()
  const value = publicEnv[runtimeKey] ?? processEnv(nuxtKey) ?? viteEnv[viteKey] ?? fallback
  return String(value).trim()
}

export const env = {
  get apiBaseUrl() {
    return readString('apiBaseUrl', 'NUXT_PUBLIC_API_BASE_URL', 'VITE_API_BASE_URL', '/api')
  },
  get apiTimeout() {
    const value = readString('apiTimeout', 'NUXT_PUBLIC_API_TIMEOUT', 'VITE_API_TIMEOUT', '15000')
    return Number(value || 15000)
  },
  get fileBaseUrl() {
    return readString('fileBaseUrl', 'NUXT_PUBLIC_FILE_BASE_URL', 'VITE_FILE_BASE_URL')
  },
}
