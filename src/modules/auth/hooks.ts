import { useAppStore } from '@/stores/app'
import { authApi } from './api'
import type { LoginPayload } from './types'
export function useAdminAuth() {
  const appStore = useAppStore()
  async function login(payload: LoginPayload) {
    const session = await authApi.login(payload)
    appStore.setAuthSession(session)
    return session
  }
  async function logout() {
    try {
      if (appStore.refreshToken) await authApi.logout(appStore.refreshToken)
    } finally {
      appStore.clearAuthSession()
    }
  }
  return { login, logout, appStore }
}
