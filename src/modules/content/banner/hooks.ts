import { ref } from 'vue'
import { bannerApi } from './api'
import type { LandingBanner } from './types'
export function useLandingBanners() {
  const banners = ref<LandingBanner[]>([])
  async function load() {
    banners.value = await bannerApi.publicList()
    return banners.value
  }
  return { banners, load }
}
