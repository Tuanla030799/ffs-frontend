import { useAppStore } from '@/stores/app'

export default defineNuxtRouteMiddleware(() => {
  if (import.meta.server) return

  const appStore = useAppStore()
  appStore.hydrate()

  if (appStore.isAuthenticated) {
    return navigateTo({ name: 'admin-dashboard' })
  }
})
