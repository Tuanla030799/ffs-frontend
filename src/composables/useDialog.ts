import { nextTick, onBeforeUnmount, watch, type Ref } from 'vue'

const FOCUSABLE_SELECTOR = [
  'a[href]',
  'button:not([disabled])',
  'input:not([disabled]):not([type="hidden"])',
  'select:not([disabled])',
  'textarea:not([disabled])',
  'iframe',
  '[contenteditable="true"]',
  '[tabindex]:not([tabindex="-1"])',
].join(',')

// Dialog mở sau cùng nằm cuối mảng: chỉ dialog trên cùng phản hồi phím Esc/Tab.
const openDialogs: symbol[] = []
let scrollLockCount = 0
let previousBodyOverflow = ''
let previousBodyPaddingRight = ''

function lockBodyScroll() {
  scrollLockCount += 1
  if (scrollLockCount > 1) return

  const body = document.body
  const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth
  previousBodyOverflow = body.style.overflow
  previousBodyPaddingRight = body.style.paddingRight
  body.style.overflow = 'hidden'
  if (scrollbarWidth > 0) body.style.paddingRight = `${scrollbarWidth}px`
}

function unlockBodyScroll() {
  if (scrollLockCount === 0) return
  scrollLockCount -= 1
  if (scrollLockCount > 0) return

  document.body.style.overflow = previousBodyOverflow
  document.body.style.paddingRight = previousBodyPaddingRight
}

type UseDialogOptions = {
  open: () => boolean
  panel: Ref<HTMLElement | null>
  onClose: () => void
}

// Hành vi chuẩn cho modal/drawer: Esc để đóng, giữ focus bên trong, khoá cuộn trang nền và
// trả focus về phần tử đã mở dialog khi đóng.
export function useDialog({ open, panel, onClose }: UseDialogOptions) {
  const id = Symbol('dialog')
  let active = false
  let returnFocusTo: HTMLElement | null = null

  function focusableElements() {
    return Array.from(panel.value?.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR) ?? []).filter(
      (element) => element.getClientRects().length > 0,
    )
  }

  function onKeydown(event: KeyboardEvent) {
    if (!active || openDialogs[openDialogs.length - 1] !== id) return

    if (event.key === 'Escape') {
      event.preventDefault()
      onClose()
      return
    }

    if (event.key !== 'Tab') return

    const elements = focusableElements()
    const first = elements[0]
    const last = elements[elements.length - 1]
    const current = document.activeElement
    const focusInside = Boolean(current && panel.value?.contains(current))

    if (!first || !last) {
      event.preventDefault()
      panel.value?.focus()
      return
    }

    if (event.shiftKey && (!focusInside || current === first || current === panel.value)) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && (!focusInside || current === last)) {
      event.preventDefault()
      first.focus()
    }
  }

  async function activate() {
    if (active || !import.meta.client) return
    active = true
    returnFocusTo = document.activeElement instanceof HTMLElement ? document.activeElement : null
    openDialogs.push(id)
    lockBodyScroll()
    document.addEventListener('keydown', onKeydown)

    await nextTick()
    if (!active) return
    const autofocusElement = panel.value?.querySelector<HTMLElement>('[autofocus]')
    ;(autofocusElement || panel.value)?.focus({ preventScroll: true })
  }

  function deactivate() {
    if (!active) return
    active = false

    const index = openDialogs.indexOf(id)
    if (index !== -1) openDialogs.splice(index, 1)
    unlockBodyScroll()
    document.removeEventListener('keydown', onKeydown)

    const target = returnFocusTo
    returnFocusTo = null
    if (target?.isConnected) target.focus({ preventScroll: true })
  }

  watch(open, (isOpen) => (isOpen ? void activate() : deactivate()), { immediate: true })
  onBeforeUnmount(deactivate)
}
