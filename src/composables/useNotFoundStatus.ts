import type { Ref } from 'vue'
import { setResponseStatus, useRequestEvent } from '#imports'

const NOT_FOUND_MESSAGE_PATTERN = /not\s*found|không\s*tìm\s*thấy|không\s*tồn\s*tại/i

// BE trả 400 kèm message "... not found" cho slug không tồn tại (thay vì 404), nên ngoài
// mã 404 còn nhận diện theo nội dung message.
export function isNotFoundError(error: unknown) {
  if (!error || typeof error !== 'object') return false

  const row = error as { statusCode?: number; status?: number; message?: string; data?: unknown }
  const status = row.statusCode ?? row.status
  if (status === 404) return true
  if (status !== 400) return false

  const details = row.data as { message?: unknown } | undefined
  const message = [row.message, details?.message].filter((value) => typeof value === 'string')
  return message.some((value) => NOT_FOUND_MESSAGE_PATTERN.test(String(value)))
}

// Trả mã HTTP 404 khi SSR không tìm thấy dữ liệu, tránh "soft 404" với công cụ tìm kiếm.
// Lỗi khác (BE lỗi, mất kết nối) giữ nguyên hành vi cũ.
export function useNotFoundStatus(data: Ref<unknown>, error: Ref<unknown>) {
  if (!import.meta.server) return
  if (error.value ? !isNotFoundError(error.value) : data.value) return

  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}
