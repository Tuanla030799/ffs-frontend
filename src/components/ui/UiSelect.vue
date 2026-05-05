<template>
  <label :class="wrapperClasses">
    <span v-if="label" class="mb-1.5 block text-sm font-semibold text-[var(--ui-text)]">
      {{ label }}
    </span>
    <div class="relative">
      <select
        :value="modelValue"
        :disabled="disabled"
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
      <span
        class="pointer-events-none absolute inset-y-0 right-3 flex items-center text-[var(--ui-text-soft)]"
        >⌄</span
      >
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
    class?: string
  }>(),
  {
    modelValue: '',
    options: () => [],
    label: '',
    placeholder: '',
    disabled: false,
    class: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const classes = computed(() =>
  cn(
    'min-w-0 w-full appearance-none rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-4 py-3 pr-10 text-sm text-[var(--ui-text)] outline-none transition focus:border-[var(--ui-primary)] focus:ring-4 focus:ring-[var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:bg-[var(--ui-surface-soft)]',
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
