import { useAppStore } from '@/stores/app'

export default defineNuxtPlugin(() => {
  const appStore = useAppStore()
  appStore.hydrate()
})
