import type { Ref } from 'vue'
import { setResponseStatus, useRequestEvent } from '#imports'

// BE trả 404 (kèm mã như PRODUCT_NOT_FOUND) khi slug/id trên đường dẫn không tồn tại.
export function isNotFoundError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const row = error as { statusCode?: number; status?: number }
  return (row.statusCode ?? row.status) === 404
}

// Trả mã HTTP 404 khi SSR không tìm thấy dữ liệu, tránh "soft 404" với công cụ tìm kiếm.
// Lỗi khác (BE lỗi, mất kết nối) giữ nguyên hành vi cũ.
export function useNotFoundStatus(data: Ref<unknown>, error: Ref<unknown>) {
  if (!import.meta.server) return
  if (error.value ? !isNotFoundError(error.value) : data.value) return

  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}
