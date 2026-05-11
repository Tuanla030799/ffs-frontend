<template>
  <label ref="rootRef" class="relative block min-w-0" @click.stop>
    <span v-if="label" class="mb-1.5 block text-sm font-semibold text-[var(--ui-text)]">
      {{ label }}
    </span>
    <button
      type="button"
      class="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-4 py-3 text-left text-sm text-[var(--ui-text)] outline-none transition hover:bg-[var(--ui-surface-soft)] focus:border-[var(--ui-primary)] focus:ring-4 focus:ring-[var(--ui-primary-ring)]"
      @click="toggle"
    >
      <span class="truncate">{{ selectedLabel || placeholder }}</span>
      <span class="text-[var(--ui-text-soft)]">⌄</span>
    </button>

    <div
      v-if="open"
      class="absolute z-[90] mt-2 w-full overflow-hidden rounded-xl border border-slate-200 bg-white shadow-2xl"
    >
      <div class="border-b border-slate-100 p-2">
        <input
          v-model="keyword"
          type="text"
          :placeholder="searchPlaceholder"
          class="min-h-10 w-full rounded-lg border border-slate-200 px-3 text-sm outline-none transition focus:border-[var(--ui-primary)] focus:ring-4 focus:ring-[var(--ui-primary-ring)]"
          @keydown.stop
        />
      </div>
      <div class="max-h-72 overflow-y-auto p-2" @scroll="onScroll">
        <button
          v-for="option in mergedOptions"
          :key="option.value"
          type="button"
          class="flex w-full items-center justify-between gap-3 rounded-lg px-3 py-2.5 text-left text-sm hover:bg-slate-50"
          @click="select(option)"
        >
          <span class="truncate font-semibold text-slate-800">{{ option.label }}</span>
          <span v-if="option.value === modelValue" class="text-xs font-bold text-emerald-600">
            Đã chọn
          </span>
        </button>
        <div v-if="loading" class="px-3 py-2 text-sm font-semibold text-slate-500">
          Đang tải...
        </div>
        <div
          v-else-if="!mergedOptions.length"
          class="px-3 py-2 text-sm font-semibold text-slate-500"
        >
          Không có dữ liệu.
        </div>
      </div>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, ref, watch } from 'vue'

export interface AsyncSelectOption {
  value: string
  label: string
  raw?: unknown
}

type FetchResult = {
  items: AsyncSelectOption[]
  total: number
  page?: number
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    label?: string
    placeholder?: string
    searchPlaceholder?: string
    pageSize?: number
    selectedOptions?: AsyncSelectOption[]
    fetchOptions: (params: { keyword: string; page: number; limit: number }) => Promise<FetchResult>
  }>(),
  {
    modelValue: '',
    label: '',
    placeholder: 'Chọn',
    searchPlaceholder: 'Tìm kiếm...',
    pageSize: 20,
    selectedOptions: () => [],
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  selected: [option: AsyncSelectOption]
}>()

const rootRef = ref<HTMLElement | null>(null)
const open = ref(false)
const loading = ref(false)
const keyword = ref('')
const page = ref(1)
const total = ref(0)
const options = ref<AsyncSelectOption[]>([])
let searchTimer: number | undefined

const mergedOptions = computed(() => {
  const merged = new Map<string, AsyncSelectOption>()
  options.value.forEach((option) => merged.set(option.value, option))
  props.selectedOptions.forEach((option) => merged.set(option.value, option))
  return Array.from(merged.values())
})
const selectedLabel = computed(
  () => mergedOptions.value.find((option) => option.value === props.modelValue)?.label || '',
)
const hasMore = computed(() => options.value.length < total.value)

async function load(nextPage = page.value) {
  if (loading.value) return
  loading.value = true
  try {
    const safePage = Math.max(1, nextPage)
    const result = await props.fetchOptions({
      keyword: keyword.value,
      page: safePage,
      limit: props.pageSize,
    })
    if (safePage === 1) {
      options.value = result.items
    } else {
      const merged = new Map(options.value.map((option) => [option.value, option]))
      result.items.forEach((option) => merged.set(option.value, option))
      options.value = Array.from(merged.values())
    }
    page.value = result.page || safePage
    total.value = result.total || result.items.length
  } finally {
    loading.value = false
  }
}

function toggle() {
  open.value = !open.value
  if (open.value && !options.value.length) void load(1)
}
function select(option: AsyncSelectOption) {
  emit('update:modelValue', option.value)
  emit('selected', option)
  open.value = false
}
function onScroll(event: Event) {
  const target = event.target as HTMLElement
  const remaining = target.scrollHeight - target.scrollTop - target.clientHeight
  if (remaining < 48 && hasMore.value) void load(page.value + 1)
}
function close(event: MouseEvent) {
  if (!rootRef.value?.contains(event.target as Node)) open.value = false
}

watch(keyword, () => {
  if (!open.value) return
  if (searchTimer) window.clearTimeout(searchTimer)
  searchTimer = window.setTimeout(() => void load(1), 250)
})

document.addEventListener('click', close)
onBeforeUnmount(() => {
  document.removeEventListener('click', close)
  if (searchTimer) window.clearTimeout(searchTimer)
})
</script>
