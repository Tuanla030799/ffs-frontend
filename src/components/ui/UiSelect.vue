<template>
  <label :class="wrapperClasses">
    <span v-if="label" class="mb-1.5 block text-sm font-semibold text-[var(--ui-text)]">
      {{ label }}
      <span v-if="required" class="text-[var(--ui-danger)]" aria-hidden="true"> * </span>
    </span>
    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
        :aria-required="required || undefined"
        :class="classes"
        v-bind="$attrs"
        @change="onChange"
      >
        <option v-if="placeholder" value="">
          {{ placeholder }}
        </option>
        <option v-for="option in options" :key="String(option.value)" :value="option.value">
          {{ option.label }}
        </option>
        <slot />
      </select>
      <svg
        viewBox="0 0 24 24"
        class="pointer-events-none absolute top-1/2 right-3 h-4 w-4 -translate-y-1/2 text-[var(--ui-text-soft)] transition-transform peer-open:rotate-180"
        fill="none"
        stroke="currentColor"
        aria-hidden="true"
      >
        <path d="m6 9 6 6 6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" />
      </svg>
    </div>
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

type SelectOption = { label: string; value: string | number | null }

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    options?: SelectOption[]
    label?: string
    placeholder?: string
    disabled?: boolean
    required?: boolean
    class?: string
  }>(),
  {
    modelValue: '',
    options: () => [],
    label: '',
    placeholder: '',
    disabled: false,
    required: false,
    class: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const classes = computed(() =>
  cn(
    'ui-select peer min-w-0 w-full appearance-none rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-4 py-3 pr-10 text-sm text-[var(--ui-text)] outline-none transition focus:border-[var(--ui-primary)] focus:ring-4 focus:ring-[var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:bg-[var(--ui-surface-soft)]',
  ),
)

const wrapperClasses = computed(() => cn('block min-w-0', wrapperOnlyClass(props.class)))

function wrapperOnlyClass(value?: string) {
  return (value || '')
    .split(/\s+/)
    .filter(
      (item) => item && !/^(border|rounded|p[trblxy]?-|bg-|text-|outline|focus:|ring)/.test(item),
    )
    .join(' ')
}

function onChange(event: Event) {
  emit('update:modelValue', (event.target as HTMLSelectElement).value)
}
</script>

<style>
/*
  Trình duyệt hỗ trợ select tuỳ biến (Chrome/Edge 135+): danh sách mở ngay dưới ô như dropdown,
  thay vì menu gốc của hệ điều hành (trên macOS menu gốc đè lên ô, căn theo mục đang chọn).
  Chỉ áp dụng với chuột/trackpad: màn hình cảm ứng giữ bộ chọn gốc cho dễ bấm, trình duyệt chưa hỗ
  trợ giữ nguyên select gốc. Không dùng scoped vì <option> truyền qua slot không mang scope id.
*/
@supports (appearance: base-select) {
  @media (hover: hover) and (pointer: fine) {
    .ui-select,
    .ui-select::picker(select) {
      appearance: base-select;
    }

    .ui-select::picker-icon {
      display: none;
    }

    .ui-select::picker(select) {
      max-height: min(20rem, 50vh);
      margin-block: 6px;
      padding: 6px;
      border: 1px solid var(--ui-border);
      border-radius: var(--ui-radius-md);
      background: var(--ui-surface);
      color: var(--ui-text);
      box-shadow: 0 18px 40px rgb(15 23 42 / 0.16);
    }

    .ui-select option {
      padding: 8px 10px;
      border-radius: calc(var(--ui-radius-md) - 4px);
      font-size: 14px;
    }

    .ui-select option:hover,
    .ui-select option:focus-visible {
      background: var(--ui-surface-soft);
      outline: none;
    }

    .ui-select option:checked {
      font-weight: 600;
    }
  }
}
</style>
