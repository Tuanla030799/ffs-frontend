import { httpClient } from '@/lib/http/httpClient'
import type { AuthTokenPayload } from '@/types/admin'
import type { ApiEnvelope } from '@/types/http'

export interface LoginPayload {
  email: string
  password: string
}

// BE đặt refresh token trong cookie HttpOnly `Path=/api/admin/auth`: các request auth phải gửi
// kèm cookie (API khác origin với trang). Không có token trong body thì BE đọc từ cookie.
const withCookie = { withCredentials: true }

export const adminAuthService = {
  async login(payload: LoginPayload) {
    const response = await httpClient.post<ApiEnvelope<AuthTokenPayload>>(
      '/admin/auth/login',
      payload,
      withCookie,
    )
    return response.data.data
  },
  async refresh(refreshToken?: string) {
    const response = await httpClient.post<ApiEnvelope<AuthTokenPayload>>(
      '/admin/auth/refresh',
      { refreshToken: refreshToken || undefined },
      withCookie,
    )
    return response.data.data
  },
  async logout(refreshToken?: string) {
    const response = await httpClient.post<ApiEnvelope<null>>(
      '/admin/auth/logout',
      { refreshToken: refreshToken || undefined },
      withCookie,
    )
    return response.data.data
  },
}
