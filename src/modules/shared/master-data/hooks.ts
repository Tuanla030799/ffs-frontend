import { ref } from 'vue'
import { getErrorMessage } from '@/modules/shared/hooks'
import { masterDataApi } from './api'
import type { MasterData } from './types'

export function useMasterData(scope: 'public' | 'admin' = 'public') {
  const data = ref<MasterData | null>(null)
  const loading = ref(false)
  const error = ref('')

  async function load(force = false) {
    loading.value = true
    error.value = ''
    try {
      data.value = scope === 'admin'
        ? await masterDataApi.admin(force)
        : await masterDataApi.public(force)
      return data.value
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }

  return { data, loading, error, load }
}
