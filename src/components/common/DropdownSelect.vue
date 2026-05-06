<template>
  <UiDropdown :items="dropdownItems" :placement="placement" @select="select">
    <template #trigger>
      <slot :selected="selected" :selected-label="selectedLabel" :placeholder="placeholder">
        <button
          type="button"
          class="flex min-h-11 w-full min-w-0 items-center justify-between gap-3 rounded-[var(--ui-radius-md)] border border-[var(--ui-border-strong)] bg-[var(--ui-surface)] px-4 py-3 text-left text-sm font-semibold text-[var(--ui-text)] transition hover:bg-[var(--ui-surface-muted)]"
        >
          <span class="truncate">{{ selectedLabel || placeholder }}</span>
          <span class="text-[var(--ui-text-soft)]">⌄</span>
        </button>
      </slot>
    </template>
  </UiDropdown>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { UiDropdown } from '@/components/ui'

type DropdownOption = {
  label: string
  value: string
}

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: DropdownOption[]
    placeholder?: string
    placement?: 'left' | 'right'
  }>(),
  {
    modelValue: '',
    options: () => [],
    placeholder: 'Chọn',
    placement: 'right',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selected = computed(() => props.options.find((option) => option.value === props.modelValue))
const selectedLabel = computed(() => selected.value?.label || '')
const dropdownItems = computed(() =>
  props.options.map((option) => ({
    key: option.value,
    label: option.label,
    meta: option.value === props.modelValue ? '✓' : '',
  })),
)

function select(value: string) {
  emit('update:modelValue', value)
}
</script>
