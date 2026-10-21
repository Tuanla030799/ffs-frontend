<template>
  <ClientOnly>
    <Teleport to="body">
      <div
        class="pointer-events-none fixed inset-x-0 top-[76px] z-[60] flex justify-center px-4 sm:justify-end sm:px-6"
        role="region"
        aria-label="Thông báo"
      >
        <div
          class="flex w-full max-w-sm flex-col gap-2"
          aria-live="polite"
          aria-relevant="additions"
        >
          <TransitionGroup name="toast">
            <div
              v-for="item in items"
              :key="item.id"
              :class="itemClasses(item.variant)"
              class="pointer-events-auto overflow-hidden rounded-[var(--ui-radius-lg)] border px-4 py-3 shadow-2xl"
              :role="item.variant === 'error' ? 'alert' : 'status'"
            >
              <div class="flex items-start gap-3">
                <div class="min-w-0 flex-1">
                  <div v-if="item.title" class="text-sm font-semibold text-[var(--ui-text)]">
                    {{ item.title }}
                  </div>
                  <div class="text-sm leading-6 text-[var(--ui-text-muted)]">
                    {{ item.message }}
                  </div>
                </div>
                <button
                  type="button"
                  class="-m-1 grid h-8 w-8 shrink-0 place-items-center rounded-full text-[var(--ui-text-soft)] transition hover:bg-black/5 hover:text-[var(--ui-text)]"
                  aria-label="Đóng thông báo"
                  @click="$emit('remove', item.id)"
                >
                  <span aria-hidden="true">✕</span>
                </button>
              </div>
            </div>
          </TransitionGroup>
        </div>
      </div>
    </Teleport>
  </ClientOnly>
</template>

<script setup lang="ts">
// <ClientOnly>: Teleport tới body không hydrate được khi SSR, nên chỉ render sau khi mount.
import { cn } from '@/utils/cn'
import type { ToastItem, ToastVariant } from '@/composables/useToast'

defineProps<{
  items: readonly ToastItem[]
}>()

defineEmits<{
  remove: [id: number]
}>()

function itemClasses(variant: ToastVariant) {
  const map = {
    info: 'border-sky-200 bg-sky-50',
    success: 'border-emerald-200 bg-emerald-50',
    warning: 'border-amber-200 bg-amber-50',
    error: 'border-red-200 bg-red-50',
  }
  return cn(map[variant])
}
</script>

<style scoped>
.toast-enter-active,
.toast-leave-active {
  transition: all 0.18s ease;
}
.toast-enter-from,
.toast-leave-to {
  opacity: 0;
  transform: translateY(-8px);
}
</style>
