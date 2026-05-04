<template>
  <div class="overflow-hidden rounded-[var(--ui-radius-md)] border border-slate-200 bg-white shadow-sm">
    <div class="overflow-x-auto">
      <table
        class="min-w-full border-separate border-spacing-0 bg-white"
        :class="minWidth"
        :aria-label="ariaLabel || undefined"
      >
        <caption
          v-if="caption"
          class="sr-only"
        >
          {{ caption }}
        </caption>
        <thead
          class="bg-slate-50"
          :class="stickyHeader && 'sticky top-0 z-10'"
        >
          <tr>
            <th
              v-for="column in columns"
              :key="column.key"
              :class="headerCellClass(column)"
            >
              {{ column.label }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-if="loading">
            <td
              :colspan="columns.length"
              :class="emptyCellClass"
            >
              <slot name="loading">
                <div class="flex items-center justify-center gap-2 text-sm font-semibold text-slate-500">
                  <span class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent" />
                  {{ loadingText }}
                </div>
              </slot>
            </td>
          </tr>
          <tr v-else-if="!rows.length">
            <td
              :colspan="columns.length"
              :class="emptyCellClass"
            >
              <slot name="empty">
                <div class="text-sm text-slate-500">
                  {{ emptyText }}
                </div>
              </slot>
            </td>
          </tr>
          <tr
            v-for="(row, rowIndex) in rows"
            :key="rowKey ? String(row[rowKey]) : rowIndex"
            :class="bodyRowClass(row, rowIndex)"
          >
            <td
              v-for="column in columns"
              :key="column.key"
              :class="bodyCellClass(column, row, rowIndex)"
            >
              <slot
                :name="`cell-${column.key}`"
                :row="row"
                :value="row[column.key]"
                :index="rowIndex"
              >
                <span class="text-[var(--ui-text)]">{{ row[column.key] }}</span>
              </slot>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <div
      v-if="$slots.footer"
      class="border-t border-slate-200 bg-white px-4 py-3"
    >
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts" generic="T extends Record<string, unknown>">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

type TableColumn<Row extends Record<string, unknown>> = {
  key: keyof Row & string | string
  label: string
  align?: 'left' | 'center' | 'right'
  class?: string | ((row: Row, index: number) => string)
  headerClass?: string
  cellClass?: string | ((row: Row, index: number) => string)
  widthClass?: string
}

const props = withDefaults(defineProps<{
  columns: readonly TableColumn<T>[]
  rows: T[]
  rowKey?: keyof T & string
  emptyText?: string
  loadingText?: string
  minWidth?: string
  loading?: boolean
  stickyHeader?: boolean
  striped?: boolean
  density?: 'sm' | 'md' | 'lg'
  rowClass?: string | ((row: T, index: number) => string)
  ariaLabel?: string
  caption?: string
}>(), {
  emptyText: 'Không có dữ liệu.',
  loadingText: 'Đang tải...',
  minWidth: '',
  loading: false,
  stickyHeader: false,
  striped: false,
  density: 'md',
  rowClass: '',
  ariaLabel: '',
  caption: '',
})

const cellPaddingClass = computed(() => {
  if (props.density === 'sm') return 'px-4 py-2.5'
  if (props.density === 'lg') return 'px-6 py-4'
  return 'px-5 py-3.5'
})

const emptyCellClass = computed(() => cn(cellPaddingClass.value, props.density === 'lg' ? 'py-8' : 'py-6'))

function alignClass(align?: 'left' | 'center' | 'right') {
  if (align === 'center') return 'text-center'
  if (align === 'right') return 'text-right'
  return 'text-left'
}

function resolveDynamicClass(value: string | ((row: T, index: number) => string) | undefined, row: T, index: number) {
  return typeof value === 'function' ? value(row, index) : value
}

function headerCellClass(column: TableColumn<T>) {
  return cn(
    cellPaddingClass.value,
    'border-b border-slate-200 text-xs font-semibold uppercase tracking-wide text-slate-500',
    alignClass(column.align),
    column.widthClass,
    column.headerClass,
  )
}

function bodyRowClass(row: T, index: number) {
  return cn(
    'align-top hover:bg-[var(--ui-surface-muted)]/70',
    'transition-colors hover:bg-slate-50',
    props.striped && index % 2 === 1 && 'bg-slate-50/50',
    resolveDynamicClass(props.rowClass, row, index),
  )
}

function bodyCellClass(column: TableColumn<T>, row: T, index: number) {
  return cn(
    cellPaddingClass.value,
    'border-b border-slate-100 text-sm text-slate-600 last:border-b-0',
    alignClass(column.align),
    column.widthClass,
    resolveDynamicClass(column.class, row, index),
    resolveDynamicClass(column.cellClass, row, index),
  )
}
</script>
