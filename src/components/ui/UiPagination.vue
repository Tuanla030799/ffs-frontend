<template>
  <nav
    v-if="pageCount > 0"
    class="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
    aria-label="Phân trang"
  >
    <p class="text-sm text-[var(--ui-text-muted)]">
      Trang <span class="font-semibold text-[var(--ui-text)]">{{ displayPage }}</span> /
      {{ pageCount }}
    </p>
    <div class="flex flex-wrap items-center gap-2">
      <button
        type="button"
        :disabled="displayPage <= 1"
        class="ui-page-btn"
        aria-label="Trang trước"
        @click="$emit('update:page', displayPage - 1)"
      >
        Trước
      </button>
      <template v-for="item in pageItems" :key="item">
        <span
          v-if="typeof item === 'string'"
          class="inline-flex min-h-10 min-w-6 items-center justify-center text-sm text-[var(--ui-text-soft)]"
          aria-hidden="true"
          >…</span
        >
        <button
          v-else
          type="button"
          :class="['ui-page-btn', item === displayPage && 'ui-page-btn-active']"
          :aria-label="`Trang ${item}`"
          :aria-current="item === displayPage ? 'page' : undefined"
          @click="item !== displayPage && $emit('update:page', item)"
        >
          {{ item }}
        </button>
      </template>
      <button
        type="button"
        :disabled="displayPage >= pageCount"
        class="ui-page-btn"
        aria-label="Trang sau"
        @click="$emit('update:page', displayPage + 1)"
      >
        Sau
      </button>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue'

type PageItem = number | 'start-gap' | 'end-gap'

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

// Trang đầu, trang cuối và các trang lân cận; khoảng trống lớn hiển thị "…" để không bị
// hiểu nhầm là các trang liền nhau.
const pageItems = computed<PageItem[]>(() => {
  if (!pageCount.value) return []

  const start = Math.max(1, displayPage.value - props.siblingCount)
  const end = Math.min(pageCount.value, displayPage.value + props.siblingCount)
  const pages = new Set<number>([1, pageCount.value])
  for (let index = start; index <= end; index += 1) pages.add(index)

  const sorted = Array.from(pages).sort((a, b) => a - b)
  const items: PageItem[] = []
  sorted.forEach((page, index) => {
    const previous = sorted[index - 1]
    if (previous !== undefined) {
      if (page - previous === 2) items.push(previous + 1)
      else if (page - previous > 2) items.push(index === 1 ? 'start-gap' : 'end-gap')
    }
    items.push(page)
  })
  return items
})
</script>
