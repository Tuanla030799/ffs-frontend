<template>
  <div
    ref="rootRef"
    class="relative inline-block text-left"
    @mouseenter="onMouseEnter"
    @mouseleave="onMouseLeave"
    @keydown.esc="onEscape"
  >
    <div ref="triggerRef" class="cursor-pointer" @click="toggle">
      <slot name="trigger" :open="open">
        <button
          type="button"
          class="inline-flex min-h-11 items-center justify-center gap-2 rounded-[var(--ui-radius-md)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-3 text-sm font-semibold text-[var(--ui-text)] transition hover:bg-[var(--ui-surface-soft)]"
          aria-haspopup="menu"
          :aria-expanded="open"
        >
          {{ triggerText }}
        </button>
      </slot>
    </div>

    <ClientOnly>
      <Teleport to="body">
        <Transition
          enter-active-class="transition duration-150 ease-out"
          enter-from-class="translate-y-1 opacity-0"
          enter-to-class="translate-y-0 opacity-100"
          leave-active-class="transition duration-100 ease-in"
          leave-from-class="translate-y-0 opacity-100"
          leave-to-class="translate-y-1 opacity-0"
        >
          <div
            v-if="open"
            ref="menuRef"
            :class="menuClasses"
            :style="menuStyle"
            role="menu"
            @mouseenter="onMouseEnter"
            @mouseleave="onMouseLeave"
            @keydown="onMenuKeydown"
            @keydown.esc="onEscape"
          >
            <button
              v-for="item in items"
              :key="item.key"
              type="button"
              role="menuitem"
              class="flex w-full cursor-pointer items-center justify-between gap-3 rounded-[calc(var(--ui-radius-md)-4px)] px-3 py-2.5 text-left text-sm transition hover:bg-[var(--ui-surface-soft)] focus-visible:bg-[var(--ui-surface-soft)] focus-visible:outline-none"
              @click="onPick(item.key)"
            >
              <span class="font-medium text-[var(--ui-text)]">{{ item.label }}</span>
              <span v-if="item.meta" class="text-xs text-[var(--ui-text-soft)]">{{
                item.meta
              }}</span>
            </button>
          </div>
        </Transition>
      </Teleport>
    </ClientOnly>
  </div>
</template>

<script setup lang="ts">
// <ClientOnly>: Teleport tới body không hydrate được khi SSR, nên chỉ render sau khi mount.
import { computed, nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import { cn } from '@/utils/cn'

type DropdownItem = { key: string; label: string; meta?: string }

const props = withDefaults(
  defineProps<{
    items?: DropdownItem[]
    triggerText?: string
    placement?: 'left' | 'right'
    openOnHover?: boolean
  }>(),
  {
    items: () => [],
    triggerText: 'Mở menu',
    placement: 'right',
    openOnHover: false,
  },
)

const emit = defineEmits<{
  select: [key: string]
}>()

const open = ref(false)
const rootRef = ref<HTMLElement | null>(null)
const triggerRef = ref<HTMLElement | null>(null)
const menuRef = ref<HTMLElement | null>(null)
const menuStyle = ref<Record<string, string>>({})
let closeTimer: number | undefined

const menuClasses = computed(() =>
  cn(
    'fixed z-[80] min-w-56 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] p-2 shadow-2xl',
  ),
)

function menuItems() {
  return Array.from(menuRef.value?.querySelectorAll<HTMLElement>('[role="menuitem"]') ?? [])
}

function focusTrigger() {
  triggerRef.value?.querySelector<HTMLElement>('button, a, [tabindex]')?.focus()
}

async function updateMenuPosition() {
  if (!open.value) return
  await nextTick()
  const rect = triggerRef.value?.getBoundingClientRect()
  if (!rect) return

  menuStyle.value = {
    top: `${rect.bottom + 8}px`,
    ...(props.placement === 'right'
      ? { right: `${Math.max(8, window.innerWidth - rect.right)}px` }
      : { left: `${Math.max(8, rect.left)}px` }),
  }
}

function setOpen(value: boolean, options: { focusFirstItem?: boolean } = {}) {
  open.value = value
  if (!value) return

  void updateMenuPosition().then(() => {
    if (options.focusFirstItem) menuItems()[0]?.focus()
  })
}

function toggle(event: MouseEvent) {
  if (props.openOnHover) return
  // event.detail === 0: click sinh ra từ bàn phím (Enter/Space) thì đưa focus vào menu.
  setOpen(!open.value, { focusFirstItem: event.detail === 0 })
}
function onPick(key: string) {
  emit('select', key)
  setOpen(false)
  focusTrigger()
}
function onMenuKeydown(event: KeyboardEvent) {
  const items = menuItems()
  if (!items.length) return

  const index = items.indexOf(document.activeElement as HTMLElement)
  if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
    event.preventDefault()
    const step = event.key === 'ArrowDown' ? 1 : -1
    items[(index + step + items.length) % items.length]?.focus()
  } else if (event.key === 'Home' || event.key === 'End') {
    event.preventDefault()
    items[event.key === 'Home' ? 0 : items.length - 1]?.focus()
  } else if (event.key === 'Tab') {
    setOpen(false)
  }
}
// Bắt Esc ngay trên trigger/menu (trước khi lên tới document) để không đóng luôn modal chứa nó.
function onEscape(event: KeyboardEvent) {
  if (!open.value) return
  event.stopPropagation()
  setOpen(false)
  focusTrigger()
}
function onDocClick(event: MouseEvent) {
  const target = event.target as Node
  if (rootRef.value?.contains(target) || menuRef.value?.contains(target)) return
  setOpen(false)
}
function onMouseEnter() {
  if (!props.openOnHover) return
  if (closeTimer) clearTimeout(closeTimer)
  setOpen(true)
}
function onMouseLeave() {
  if (!props.openOnHover) return
  closeTimer = window.setTimeout(() => setOpen(false), 120)
}

onMounted(() => {
  document.addEventListener('click', onDocClick)
  window.addEventListener('resize', updateMenuPosition)
  window.addEventListener('scroll', updateMenuPosition, true)
})

onBeforeUnmount(() => {
  document.removeEventListener('click', onDocClick)
  window.removeEventListener('resize', updateMenuPosition)
  window.removeEventListener('scroll', updateMenuPosition, true)
  if (closeTimer) clearTimeout(closeTimer)
})
</script>
