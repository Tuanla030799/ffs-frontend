import axios, {
  AxiosError,
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from 'axios'
import { buildSearchParams } from '@/lib/http/queryParams'
import { env } from '@/config/env'
import { useAppStore } from '@/stores/app'
import { ApiError } from '@/types/http'
import { adminAuthService } from '@/services/admin/auth.service'
import { navigateTo, useRequestURL } from '#imports'

type RequestKind = 'query' | 'mutation'
type RetryableConfig = InternalAxiosRequestConfig & { _retry?: boolean; _requestKind?: RequestKind }

function normalizeAxiosError(error: unknown) {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as Record<string, unknown> | undefined
    const message =
      (typeof responseData?.message === 'string' && responseData.message) ||
      error.message ||
      'Đã có lỗi xảy ra khi gọi API.'

    return new ApiError({
      message,
      status: error.response?.status,
      code: typeof responseData?.code === 'string' ? responseData.code : error.code,
      details: responseData,
    })
  }

  if (error instanceof Error) {
    return new ApiError({ message: error.message })
  }

  return new ApiError({ message: 'Đã có lỗi không xác định.' })
}

let refreshPromise: Promise<string> | null = null

function resolveBaseURL(baseURL?: string) {
  const value = (baseURL || env.apiBaseUrl || '/api').trim()
  if (/^[a-z][a-z\d+\-.]*:\/\//i.test(value)) return value

  const relativeBaseURL = value.startsWith('/') ? value : `/${value}`
  if (!import.meta.server) return relativeBaseURL

  try {
    return `${useRequestURL().origin}${relativeBaseURL}`
  } catch {
    return relativeBaseURL
  }
}

async function refreshAccessToken() {
  const appStore = useAppStore()
  if (!appStore.refreshToken) {
    appStore.clearAuthSession()
    throw new ApiError({
      message: 'Phiên đăng nhập đã hết hạn.',
      status: 401,
      code: 'AUTH_EXPIRED',
    })
  }

  if (!refreshPromise) {
    appStore.startRefreshToken()
    refreshPromise = adminAuthService
      .refresh(appStore.refreshToken)
      .then((payload) => {
        appStore.setAuthSession(payload)
        return payload.accessToken
      })
      .catch((error) => {
        appStore.clearAuthSession()
        throw error
      })
      .finally(() => {
        appStore.finishRefreshToken()
        refreshPromise = null
      })
  }

  return refreshPromise
}

function shouldSkipRefresh(config?: RetryableConfig) {
  const url = config?.url || ''
  return (
    url.includes('/admin/auth/login') ||
    url.includes('/admin/auth/refresh') ||
    url.includes('/admin/auth/logout')
  )
}

function redirectToAdminLogin() {
  if (!import.meta.client) return
  if (window.location.pathname === '/admin/login') return

  const redirect =
    window.location.pathname.startsWith('/admin') && window.location.pathname !== '/admin/login'
      ? `${window.location.pathname}${window.location.search}`
      : undefined

  void navigateTo({
    name: 'admin-login',
    query: redirect ? { redirect } : undefined,
  })
}

function handleUnauthorized() {
  const appStore = useAppStore()
  appStore.clearAuthSession()
  redirectToAdminLogin()
}

function requestKind(method?: string): RequestKind {
  const normalized = (method || 'get').toLowerCase()
  return normalized === 'get' || normalized === 'head' ? 'query' : 'mutation'
}

function finishTrackedRequest(config?: RetryableConfig) {
  if (!import.meta.client || !config?._requestKind) return
  useAppStore().finishRequest(config._requestKind)
  config._requestKind = undefined
}

function createHttpClient(config?: AxiosRequestConfig): AxiosInstance {
  // baseURL/timeout không chốt lúc import module: runtime config (Workers vars) được đọc
  // ở từng request trong interceptor bên dưới.
  const client = axios.create({
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
    },
    ...config,
  })

  client.interceptors.request.use(
    (requestConfig: any) => {
      if (requestConfig.params && !(requestConfig.params instanceof URLSearchParams)) {
        requestConfig.paramsSerializer = (params: any) =>
          buildSearchParams(params as any).toString()
      }

      const nextConfig: RetryableConfig = {
        ...requestConfig,
        baseURL: resolveBaseURL(requestConfig.baseURL),
        timeout: requestConfig.timeout || env.apiTimeout,
        headers: {
          ...(requestConfig.headers || {}),
          'X-Requested-With': 'XMLHttpRequest',
        },
      }

      // Store (token, bộ đếm loading) chỉ dùng ở client: trên server, interceptor response chạy
      // ngoài setup nên `useAppStore()` sẽ lấy activePinia toàn cục, có thể thuộc request khác.
      if (import.meta.client) {
        const appStore = useAppStore()
        if (appStore.accessToken) {
          nextConfig.headers.Authorization = `Bearer ${appStore.accessToken}`
        }
        nextConfig._requestKind = requestKind(nextConfig.method)
        appStore.startRequest(nextConfig._requestKind)
      }

      return nextConfig
    },
    (error: AxiosError) => Promise.reject(normalizeAxiosError(error)),
    // Chạy đồng bộ ngay trong lời gọi API: khi SSR, lời gọi nằm trong setup/useAsyncData nên
    // `useRequestURL()`/`useRuntimeConfig()` còn Nuxt context (interceptor bất đồng bộ thì mất).
    { synchronous: true },
  )

  client.interceptors.response.use(
    (response) => {
      finishTrackedRequest(response.config as RetryableConfig)
      return response
    },
    async (error: AxiosError) => {
      finishTrackedRequest(error.config as RetryableConfig | undefined)
      if (!import.meta.client) return Promise.reject(normalizeAxiosError(error))

      const appStore = useAppStore()
      const originalRequest = error.config as RetryableConfig | undefined
      if (
        error.response?.status === 401 &&
        originalRequest &&
        !originalRequest._retry &&
        !shouldSkipRefresh(originalRequest) &&
        appStore.refreshToken
      ) {
        try {
          originalRequest._retry = true
          const nextAccessToken = await refreshAccessToken()
          originalRequest.headers = {
            ...(originalRequest.headers || {}),
            Authorization: `Bearer ${nextAccessToken}`,
          } as any
          return client(originalRequest)
        } catch (refreshError) {
          handleUnauthorized()
          return Promise.reject(normalizeAxiosError(refreshError))
        }
      }

      if (error.response?.status === 401) {
        handleUnauthorized()
      }

      return Promise.reject(normalizeAxiosError(error))
    },
  )

  return client
}

export const httpClient = createHttpClient()
export { createHttpClient, normalizeAxiosError, refreshAccessToken }
