<template>
  <div class="min-w-0 space-y-4">
    <div
      class="flex max-w-full items-end justify-start gap-1 overflow-x-auto overflow-y-hidden border-b border-[var(--ui-border)]"
      role="tablist"
      @keydown="onKeydown"
    >
      <button
        v-for="item in items"
        :id="tabId(item.key)"
        :key="item.key"
        type="button"
        role="tab"
        :aria-selected="item.key === modelValue"
        :aria-controls="panelId"
        :tabindex="item.key === activeKey ? 0 : -1"
        class="-mb-px w-auto shrink-0 rounded-t-[var(--ui-radius-md)] border border-transparent border-b-[var(--ui-border)] px-4 py-2.5 text-sm font-medium whitespace-nowrap transition focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)] focus-visible:outline-none"
        :class="
          item.key === modelValue
            ? 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-primary)]'
            : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-soft)] hover:text-[var(--ui-text)]'
        "
        @click="$emit('update:modelValue', item.key)"
      >
        {{ item.label }}
      </button>
    </div>
    <div :id="panelId" role="tabpanel" :aria-labelledby="tabId(activeKey)">
      <slot />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, useId } from 'vue'

const props = defineProps<{
  modelValue: string
  items: Array<{ key: string; label: string }>
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const baseId = useId()
const panelId = `${baseId}-panel`
const activeKey = computed(() =>
  props.items.some((item) => item.key === props.modelValue)
    ? props.modelValue
    : props.items[0]?.key || '',
)

function tabId(key: string) {
  return `${baseId}-tab-${key}`
}

// Điều hướng bằng phím mũi tên/Home/End theo mẫu tabs của WAI-ARIA.
function onKeydown(event: KeyboardEvent) {
  const keys = ['ArrowRight', 'ArrowLeft', 'Home', 'End']
  if (!keys.includes(event.key) || !props.items.length) return
  event.preventDefault()

  const currentIndex = Math.max(
    props.items.findIndex((item) => item.key === activeKey.value),
    0,
  )
  const lastIndex = props.items.length - 1
  const nextIndex =
    event.key === 'Home'
      ? 0
      : event.key === 'End'
        ? lastIndex
        : event.key === 'ArrowRight'
          ? (currentIndex + 1) % props.items.length
          : (currentIndex - 1 + props.items.length) % props.items.length

  const nextItem = props.items[nextIndex]
  if (!nextItem) return
  emit('update:modelValue', nextItem.key)
  void nextTick(() => document.getElementById(tabId(nextItem.key))?.focus())
}
</script>
