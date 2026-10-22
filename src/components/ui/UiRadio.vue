<template>
  <div class="space-y-2">
    <div v-if="label" :id="labelId" class="text-sm font-medium text-[var(--ui-text-muted)]">
      {{ label }}
    </div>
    <div
      :class="stacked ? 'space-y-2' : 'flex flex-wrap gap-2'"
      role="radiogroup"
      :aria-labelledby="label ? labelId : undefined"
    >
      <label
        v-for="option in options"
        :key="String(option.value)"
        :class="itemClasses(option.value)"
      >
        <input
          :checked="modelValue === option.value"
          :disabled="disabled"
          type="radio"
          class="peer sr-only"
          :name="name || generatedName"
          @change="emit('update:modelValue', option.value)"
        />
        <span :class="dotClasses(option.value)">
          <span class="h-2 w-2 rounded-full bg-current" />
        </span>
        <span class="min-w-0 flex-1 text-sm font-medium text-[var(--ui-text)]">{{
          option.label
        }}</span>
      </label>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useId } from 'vue'
import { cn } from '@/utils/cn'

type Option = { label: string; value: string | number }

const props = withDefaults(
  defineProps<{
    modelValue?: string | number
    options?: Option[]
    disabled?: boolean
    label?: string
    name?: string
    stacked?: boolean
  }>(),
  {
    modelValue: '',
    options: () => [],
    disabled: false,
    label: '',
    name: '',
    stacked: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string | number]
}>()

// Mỗi nhóm radio cần name riêng, nếu dùng chung name thì các nhóm trên cùng trang sẽ "tranh" nhau.
const generatedName = useId()
const labelId = useId()

function itemClasses(value: string | number) {
  return cn(
    // relative: input sr-only (position absolute) bám theo label; nếu không nó tính theo <body> và
    // làm cả trang cuộn được khi radio nằm trong vùng cuộn riêng (layout admin).
    'relative flex cursor-pointer items-center gap-3 rounded-[var(--ui-radius-md)] border px-3 py-3 transition',
    props.disabled && 'cursor-not-allowed opacity-60',
    props.modelValue === value
      ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)]'
      : 'border-[var(--ui-border)] bg-[var(--ui-surface)] hover:border-[var(--ui-border-strong)]',
  )
}

function dotClasses(value: string | number) {
  return cn(
    'inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition peer-focus-visible:ring-4 peer-focus-visible:ring-[var(--ui-primary-ring)]',
    props.modelValue === value
      ? 'border-[var(--ui-primary)] text-[var(--ui-primary)]'
      : 'border-[var(--ui-border-strong)] text-transparent',
  )
}
</script>
