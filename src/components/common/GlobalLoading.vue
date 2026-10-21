<template>
  <div
    v-show="showProgress"
    class="pointer-events-none fixed inset-x-0 top-0 z-[95] h-[3px] overflow-hidden"
    role="progressbar"
    aria-label="Đang tải dữ liệu"
  >
    <div
      class="global-loading-bar h-full w-2/5"
      :class="isAdminRoute ? 'bg-[var(--ui-primary)]' : 'bg-black'"
    />
  </div>

  <!-- Chỉ chặn thao tác khi admin đang ghi dữ liệu (tránh bấm lưu/xóa hai lần). -->
  <div v-if="blockInput" class="fixed inset-0 z-[90] cursor-progress" aria-hidden="true" />
  <Transition name="fade">
    <div
      v-if="showBlockingCard"
      class="fixed inset-0 z-[91] flex items-center justify-center bg-slate-950/25 px-4 backdrop-blur-[2px]"
      role="status"
      aria-live="polite"
    >
      <div
        class="flex w-full max-w-xs items-center gap-3 rounded-[var(--ui-radius-lg)] border border-[var(--ui-border)] bg-[var(--ui-surface)] px-4 py-4 shadow-2xl"
      >
        <span
          class="h-5 w-5 animate-spin rounded-full border-2 border-[var(--ui-primary)] border-r-transparent"
        />
        <div>
          <p class="text-sm font-semibold text-[var(--ui-text)]">Đang xử lý</p>
          <p class="text-xs text-[var(--ui-text-soft)]">Vui lòng đợi một chút...</p>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from '#imports'
import { useAppStore } from '@/stores/app'

const PROGRESS_DELAY_MS = 150
const BLOCKING_CARD_DELAY_MS = 400

const route = useRoute()
const appStore = useAppStore()
const { isLoading, isMutating } = storeToRefs(appStore)

const isAdminRoute = computed(() => route.path.startsWith('/admin'))
const blockInput = computed(() => isAdminRoute.value && isMutating.value)
const showProgress = ref(false)
const showBlockingCard = ref(false)

let progressTimer: ReturnType<typeof setTimeout> | undefined
let blockingTimer: ReturnType<typeof setTimeout> | undefined

// Request nhanh không làm nháy thanh tiến trình/thẻ "Đang xử lý".
watch(isLoading, (loading) => {
  clearTimeout(progressTimer)
  if (!loading) {
    showProgress.value = false
    return
  }
  progressTimer = setTimeout(() => {
    showProgress.value = true
  }, PROGRESS_DELAY_MS)
})

watch(blockInput, (blocking) => {
  clearTimeout(blockingTimer)
  if (!blocking) {
    showBlockingCard.value = false
    return
  }
  blockingTimer = setTimeout(() => {
    showBlockingCard.value = true
  }, BLOCKING_CARD_DELAY_MS)
})

onBeforeUnmount(() => {
  clearTimeout(progressTimer)
  clearTimeout(blockingTimer)
})
</script>

<style scoped>
.global-loading-bar {
  animation: global-loading 1.1s ease-in-out infinite;
}

@keyframes global-loading {
  from {
    transform: translateX(-100%);
  }

  to {
    transform: translateX(250%);
  }
}

@media (prefers-reduced-motion: reduce) {
  .global-loading-bar {
    width: 100%;
    animation: none;
    opacity: 0.6;
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
