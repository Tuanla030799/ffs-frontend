<template>
  <label :class="wrapperClasses">
    <span v-if="label" class="mb-1.5 block text-sm font-semibold text-[var(--ui-text)]">
      {{ label }}
      <span v-if="required" class="text-[var(--text-error,var(--ui-danger))]"> * </span>
    </span>
    <input
      :value="displayValue"
      :type="inputType"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :min="min"
      :max="max"
      :disabled="disabled"
      :inputmode="type === 'currency' ? 'numeric' : undefined"
      :class="classes"
      v-bind="$attrs"
      @input="onInput"
    />
  </label>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    modelValue?: string | number | null
    modelModifiers?: {
      number?: boolean
    }
    type?: string
    label?: string
    placeholder?: string
    maxlength?: number
    min?: string | number
    max?: string | number
    disabled?: boolean
    required?: boolean
    class?: string
  }>(),
  {
    modelValue: '',
    modelModifiers: () => ({}),
    type: 'text',
    label: '',
    placeholder: '',
    maxlength: undefined,
    min: undefined,
    max: undefined,
    disabled: false,
    required: false,
    class: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null]
}>()

const currencyFormatter = new Intl.NumberFormat('vi-VN', {
  maximumFractionDigits: 0,
})

const inputType = computed(() => (props.type === 'currency' ? 'text' : props.type))

const displayValue = computed(() => {
  if (props.type !== 'currency') return props.modelValue
  if (props.modelValue === null || props.modelValue === undefined || props.modelValue === '') {
    return ''
  }

  const numericValue = Number(props.modelValue)
  return Number.isFinite(numericValue) ? currencyFormatter.format(numericValue) : ''
})

const classes = computed(() =>
  cn(
    'min-w-0 w-full rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] outline-none transition placeholder:text-[var(--ui-text-soft)] focus:border-[var(--ui-primary)] focus:ring-4 focus:ring-[var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:bg-[var(--ui-surface-soft)]',
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

function onInput(event: Event) {
  const value = (event.target as HTMLInputElement).value
  if (props.type === 'currency') {
    const numericText = value.replace(/\D/g, '')
    emit('update:modelValue', numericText ? Number(numericText) : null)
    return
  }

  if (!props.modelModifiers.number) {
    emit('update:modelValue', value)
    return
  }

  const numericValue = Number.parseFloat(value)
  emit('update:modelValue', Number.isNaN(numericValue) ? value : numericValue)
}
</script>
