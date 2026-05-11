import { onBeforeUnmount, ref } from 'vue'

type NoticeState<T extends string = string> = {
  type: T
  text: string
} | null

export function useTimedNotice<T extends string = 'info' | 'success' | 'warning' | 'error'>(
  duration = 2400,
) {
  const notice = ref<NoticeState<T>>(null)
  let timer = 0

  function clearNotice() {
    if (timer) {
      clearTimeout(timer)
      timer = 0
    }
    notice.value = null
  }

  function setNotice(type: T, text: string) {
    notice.value = { type, text }
    if (timer) clearTimeout(timer)
    timer = window.setTimeout(() => {
      notice.value = null
      timer = 0
    }, duration)
  }

  onBeforeUnmount(() => {
    if (timer) clearTimeout(timer)
  })

  return {
    notice,
    setNotice,
    clearNotice,
  }
}
