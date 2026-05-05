<template>
  <label :class="wrapperClasses">
    <span v-if="label" class="mb-1.5 block text-sm font-semibold text-[var(--ui-text)]">
      {{ label }}
    </span>
    <textarea
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      :maxlength="maxlength"
      :disabled="disabled"
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
    modelValue?: string
    rows?: number | string
    label?: string
    placeholder?: string
    maxlength?: number
    disabled?: boolean
    class?: string
  }>(),
  {
    modelValue: '',
    rows: 4,
    label: '',
    placeholder: '',
    maxlength: undefined,
    disabled: false,
    class: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const classes = computed(() =>
  cn(
    'min-h-28 w-full rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-4 py-3 text-sm text-[var(--ui-text)] outline-none transition placeholder:text-[var(--ui-text-soft)] focus:border-[var(--ui-primary)] focus:ring-4 focus:ring-[var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:bg-[var(--ui-surface-soft)]',
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
  emit('update:modelValue', (event.target as HTMLTextAreaElement).value)
}
</script>
