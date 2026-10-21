<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition
        enter-active-class="transition duration-150 ease-out"
        enter-from-class="opacity-0"
        leave-active-class="transition duration-100 ease-in"
        leave-to-class="opacity-0"
      >
        <div
          v-if="open"
          class="fixed inset-0 z-50 flex bg-slate-950/45"
          :class="
            fullscreen
              ? 'items-stretch justify-center p-0'
              : mobileSheet
                ? 'items-end sm:items-center sm:justify-center sm:p-4'
                : 'items-center justify-center p-4'
          "
          @mousedown.self="emit('close')"
        >
          <div
            ref="panelRef"
            :class="panelClasses"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            :aria-describedby="description ? descriptionId : undefined"
            :aria-label="title ? undefined : ariaLabel"
            tabindex="-1"
          >
            <div class="mb-4 flex shrink-0 items-start justify-between gap-3">
              <div class="min-w-0">
                <h3
                  v-if="title"
                  :id="titleId"
                  class="text-base font-semibold text-[var(--ui-text)]"
                >
                  {{ title }}
                </h3>
                <p
                  v-if="description"
                  :id="descriptionId"
                  class="mt-1 text-sm text-[var(--ui-text-soft)]"
                >
                  {{ description }}
                </p>
              </div>
              <button
                type="button"
                class="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-[var(--ui-border)] text-[var(--ui-text-soft)] transition hover:bg-[var(--ui-surface-soft)] focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)] focus-visible:outline-none"
                aria-label="Đóng"
                @click="emit('close')"
              >
                <span aria-hidden="true">✕</span>
              </button>
            </div>
            <div :class="bodyClasses">
              <slot />
            </div>
          </div>
        </div>
      </Transition>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
// <ClientOnly>: Teleport tới body không hydrate được khi SSR, nên chỉ render sau khi mount.
import { computed, ref, useId } from 'vue'
import { useDialog } from '@/composables/useDialog'
import { cn } from '@/utils/cn'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
    ariaLabel?: string
    mobileSheet?: boolean
    fullscreen?: boolean
    maxWidth?: 'sm' | 'md' | 'lg' | 'xl'
  }>(),
  {
    title: '',
    description: '',
    ariaLabel: 'Hộp thoại',
    mobileSheet: true,
    fullscreen: false,
    maxWidth: 'lg',
  },
)

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const titleId = useId()
const descriptionId = useId()

useDialog({ open: () => props.open, panel: panelRef, onClose: () => emit('close') })

const panelClasses = computed(() => {
  if (props.fullscreen) {
    return cn(
      'flex h-dvh w-screen flex-col overflow-hidden bg-[var(--ui-surface)] p-4 outline-none sm:p-5',
    )
  }

  const widths = {
    sm: 'sm:max-w-sm',
    md: 'sm:max-w-md',
    lg: 'sm:max-w-xl',
    xl: 'sm:max-w-2xl',
  }
  return cn(
    'flex w-full flex-col bg-[var(--ui-surface)] p-4 shadow-2xl outline-none sm:p-5',
    props.mobileSheet
      ? 'max-h-[90dvh] rounded-t-[var(--ui-radius-lg)] sm:max-h-[calc(100dvh-2rem)] sm:rounded-[var(--ui-radius-lg)]'
      : 'max-h-[calc(100dvh-2rem)] rounded-[var(--ui-radius-lg)]',
    widths[props.maxWidth],
  )
})

// Nội dung dài cuộn bên trong modal thay vì bị cắt mất; -m-1/p-1 chừa chỗ cho focus ring.
const bodyClasses = computed(() =>
  props.fullscreen
    ? 'flex min-h-0 flex-1 flex-col'
    : '-m-1 min-h-0 flex-1 overflow-y-auto overscroll-contain p-1',
)
</script>
