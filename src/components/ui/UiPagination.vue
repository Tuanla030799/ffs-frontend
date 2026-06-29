<template>
  <nav class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
    <p class="text-sm text-[var(--ui-text-muted)]">
      Trang <span class="font-semibold text-[var(--ui-text)]">{{ displayPage }}</span> /
      {{ pageCount }}
    </p>
    <div class="flex items-center gap-2">
      <button
        type="button"
        :disabled="displayPage <= 1"
        class="ui-page-btn"
        @click="$emit('update:page', displayPage - 1)"
      >
        Trước
      </button>
      <button
        v-for="item in visiblePages"
        :key="item"
        type="button"
        :class="['ui-page-btn', item === page && 'ui-page-btn-active']"
        @click="$emit('update:page', item)"
      >
        {{ item }}
      </button>
      <button
        type="button"
        :disabled="displayPage >= pageCount"
        class="ui-page-btn"
        @click="$emit('update:page', displayPage + 1)"
      >
        Sau
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

const props = withDefaults(
  defineProps<{
    page: number
    total?: number
    totalPages?: number
    pageSize?: number
    siblingCount?: number
  }>(),
  {
    total: 0,
    totalPages: undefined,
    pageSize: 5,
    siblingCount: 1,
  },
)

defineEmits<{
  'update:page': [page: number]
}>()

const pageCount = computed(() => {
  if (typeof props.totalPages === 'number') return Math.max(0, props.totalPages)
  return props.total ? Math.ceil(props.total / Math.max(props.pageSize, 1)) : 0
})
const displayPage = computed(() => {
  if (!pageCount.value) return 0
  return Math.min(Math.max(props.page, 1), pageCount.value)
})
const visiblePages = computed(() => {
  if (!pageCount.value) return []

  const start = Math.max(1, displayPage.value - props.siblingCount)
  const end = Math.min(pageCount.value, displayPage.value + props.siblingCount)
  const set = new Set<number>([1, pageCount.value])
  for (let i = start; i <= end; i += 1) set.add(i)
  return Array.from(set).sort((a, b) => a - b)
})
</script>
