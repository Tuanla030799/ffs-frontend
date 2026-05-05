import { ref } from 'vue'
import { ApiError } from '@/types/http'
export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return error.message
  if (error instanceof Error) return error.message
  return 'Đã có lỗi xảy ra.'
}
export function useAsyncState() {
  const loading = ref(false)
  const error = ref('')
  async function run<T>(task: () => Promise<T>) {
    loading.value = true
    error.value = ''
    try {
      return await task()
    } catch (err) {
      error.value = getErrorMessage(err)
      throw err
    } finally {
      loading.value = false
    }
  }
  return { loading, error, run }
}
export function required(value: unknown, label: string) {
  return value === undefined || value === null || String(value).trim() === ''
    ? `${label} là bắt buộc.`
    : ''
}
export function isPhone(value: string) {
  return /^[0-9+\-\s]{8,20}$/.test(value.trim()) ? '' : 'Số điện thoại không hợp lệ.'
}
