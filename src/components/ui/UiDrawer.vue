<template>
  <ClientOnly>
    <Teleport to="body">
      <Transition name="ui-drawer">
        <div v-if="open" class="fixed inset-0 z-50 bg-slate-950/45" @mousedown.self="emit('close')">
          <div
            ref="panelRef"
            class="ui-drawer-panel absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-[var(--ui-surface)] shadow-2xl outline-none"
            role="dialog"
            aria-modal="true"
            :aria-labelledby="title ? titleId : undefined"
            :aria-label="title ? undefined : 'Bảng điều hướng'"
            tabindex="-1"
          >
            <div
              class="flex items-center justify-between gap-3 border-b border-[var(--ui-border)] px-4 py-4 sm:px-5"
            >
              <div class="min-w-0">
                <h3
                  v-if="title"
                  :id="titleId"
                  class="text-base font-semibold text-[var(--ui-text)]"
                >
                  {{ title }}
                </h3>
                <p v-if="description" class="mt-1 text-sm text-[var(--ui-text-soft)]">
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
            <div class="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5">
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
import { ref, useId } from 'vue'
import { useDialog } from '@/composables/useDialog'

const props = withDefaults(
  defineProps<{
    open: boolean
    title?: string
    description?: string
  }>(),
  {
    title: '',
    description: '',
  },
)

const emit = defineEmits<{
  close: []
}>()

const panelRef = ref<HTMLElement | null>(null)
const titleId = useId()

useDialog({ open: () => props.open, panel: panelRef, onClose: () => emit('close') })
</script>

<style scoped>
.ui-drawer-enter-active,
.ui-drawer-leave-active,
.ui-drawer-enter-active .ui-drawer-panel,
.ui-drawer-leave-active .ui-drawer-panel {
  transition:
    opacity 200ms ease,
    transform 200ms ease;
}

.ui-drawer-enter-from,
.ui-drawer-leave-to {
  opacity: 0;
}

.ui-drawer-enter-from .ui-drawer-panel,
.ui-drawer-leave-to .ui-drawer-panel {
  transform: translateX(100%);
}

@media (prefers-reduced-motion: reduce) {
  .ui-drawer-enter-from .ui-drawer-panel,
  .ui-drawer-leave-to .ui-drawer-panel {
    transform: none;
  }
}
</style>
