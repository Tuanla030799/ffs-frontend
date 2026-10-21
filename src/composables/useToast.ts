import { readonly, ref } from 'vue'

export type ToastVariant = 'info' | 'success' | 'warning' | 'error'
export type ToastItem = {
  id: number
  title?: string
  message: string
  variant: ToastVariant
}

const toasts = ref<ToastItem[]>([])
let seed = 1

// Thông báo lỗi/cảnh báo giữ lâu hơn để kịp đọc.
const TOAST_DURATION_MS: Record<ToastVariant, number> = {
  info: 4000,
  success: 4000,
  warning: 6000,
  error: 6000,
}

export function useToast() {
  function remove(id: number) {
    toasts.value = toasts.value.filter((item) => item.id !== id)
  }

  function push(message: string, variant: ToastVariant = 'info', title = '') {
    const id = seed++
    // Thông báo trùng nội dung (ví dụ bấm "Thêm vào giỏ" nhiều lần) thay thế bản cũ thay vì
    // xếp chồng nhiều toast giống hệt nhau.
    const others = toasts.value.filter(
      (item) => !(item.message === message && item.title === title && item.variant === variant),
    )
    toasts.value = [...others, { id, title, message, variant }]

    if (typeof window !== 'undefined') {
      window.setTimeout(() => remove(id), TOAST_DURATION_MS[variant])
    }

    return id
  }

  return {
    toasts: readonly(toasts),
    push,
    remove,
  }
}
