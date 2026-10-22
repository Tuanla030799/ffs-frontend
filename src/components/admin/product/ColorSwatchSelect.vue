<template>
  <div role="group" :aria-label="label" :aria-invalid="invalid || undefined">
    <div class="flex flex-wrap gap-1.5">
      <button
        v-for="option in options"
        :key="option.id || option.value"
        type="button"
        class="inline-flex min-h-9 items-center gap-2 rounded-full border py-1 pr-3 pl-1 text-sm font-medium transition focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)] focus-visible:outline-none"
        :class="
          isSelected(option)
            ? 'border-slate-950 bg-slate-950 text-white'
            : invalid
              ? 'border-red-300 bg-white text-slate-700 hover:border-slate-400'
              : 'border-slate-200 bg-white text-slate-700 hover:border-slate-400'
        "
        :aria-pressed="isSelected(option)"
        @click="emit('update:modelValue', option.id || option.value)"
      >
        <span
          class="h-6 w-6 shrink-0 rounded-full border border-black/10"
          :style="{ background: swatchBackground(option) }"
          aria-hidden="true"
        />
        {{ option.label || option.value }}
      </button>
    </div>
    <p v-if="!options.length" class="text-sm text-slate-500">
      Chưa có màu nào. Thêm màu ở trang <NuxtLink to="/admin/colors">Colors</NuxtLink>.
    </p>
  </div>
</template>

<script setup lang="ts">
import type { MasterDataColorOption } from '@/modules/shared/master-data/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: MasterDataColorOption[]
    label?: string
    invalid?: boolean
  }>(),
  {
    modelValue: '',
    options: () => [],
    label: 'Chọn màu',
    invalid: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

function isSelected(option: MasterDataColorOption) {
  return (option.id || option.value) === props.modelValue
}

// Màu "nhiều màu" (không có mã màu) hiển thị dải cầu vồng thay vì ô trống.
function swatchBackground(option: MasterDataColorOption) {
  return option.colorCode || 'conic-gradient(#ef4444, #f59e0b, #22c55e, #3b82f6, #a855f7, #ef4444)'
}
</script>
