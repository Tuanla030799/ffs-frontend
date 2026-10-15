import type { Ref } from 'vue'
import { setResponseStatus, useRequestEvent } from '#imports'

// Trả mã HTTP 404 khi SSR không tìm thấy dữ liệu (BE trả 404 hoặc không có dữ liệu), tránh
// "soft 404" với công cụ tìm kiếm. Lỗi khác (BE lỗi, mất kết nối) giữ nguyên hành vi cũ.
export function useNotFoundStatus(data: Ref<unknown>, error: Ref<unknown>) {
  if (!import.meta.server) return

  const statusCode = (error.value as { statusCode?: number } | null | undefined)?.statusCode
  if (statusCode !== 404 && (error.value || data.value)) return

  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}
