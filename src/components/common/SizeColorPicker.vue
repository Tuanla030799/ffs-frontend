<template>
  <div>
    <div class="flex gap-2">
      <UiButton
        native-type="button"
        variant="secondary"
        class="min-w-0 flex-1 justify-between"
        @click="open = true"
      >
        <span class="truncate">{{ selectedLabel || placeholder }}</span>
      </UiButton>
      <UiButton
        v-if="selectedLabel && clearable"
        native-type="button"
        variant="secondary"
        aria-label="Xóa lựa chọn"
        @click="clear"
      >
        ×
      </UiButton>
    </div>

    <UiModal :open="open" :title="title" max-width="md" @close="open = false">
      <div :class="gridClass">
        <button
          v-for="option in options"
          :key="option.id || option.value"
          type="button"
          :class="buttonClass(option)"
          @click="select(option)"
        >
          <span
            v-if="variant === 'color'"
            class="mx-auto mb-1 block h-7 w-7 rounded-full border border-slate-200"
            :style="{ backgroundColor: optionColorCode(option) || '#f8fafc' }"
          />
          <span>{{ option.label || option.value }}</span>
        </button>
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiModal } from '@/components/ui'
import type { MasterDataColorOption, MasterDataOption } from '@/modules/shared/master-data/types'

const props = withDefaults(
  defineProps<{
    modelValue?: string
    options?: Array<MasterDataOption | MasterDataColorOption>
    title?: string
    placeholder?: string
    variant?: 'size' | 'color'
    valueField?: 'id' | 'value'
    clearable?: boolean
  }>(),
  {
    modelValue: '',
    options: () => [],
    title: 'Chọn',
    placeholder: 'Chọn',
    variant: 'size',
    valueField: 'id',
    clearable: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const open = ref(false)
const selected = computed(() =>
  props.options.find((item) => optionValue(item) === props.modelValue),
)
const selectedLabel = computed(() => selected.value?.label || selected.value?.value || '')
const gridClass = computed(() =>
  props.variant === 'color' ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-3 gap-2',
)

function buttonClass(option: MasterDataOption | MasterDataColorOption) {
  const active = optionValue(option) === props.modelValue
  return [
    'rounded-md border bg-white px-3 py-2 text-sm font-medium transition hover:border-slate-950',
    props.variant === 'color' ? 'min-h-[72px] text-center' : '',
    active ? 'border-slate-950 ring-2 ring-slate-950/10' : 'border-slate-200',
  ]
}

function select(option: MasterDataOption | MasterDataColorOption) {
  emit('update:modelValue', optionValue(option))
  open.value = false
}

function optionValue(option: MasterDataOption | MasterDataColorOption) {
  return props.valueField === 'value' ? option.value || '' : option.id || ''
}

function optionColorCode(option: MasterDataOption | MasterDataColorOption) {
  return 'colorCode' in option ? option.colorCode : null
}

function clear() {
  emit('update:modelValue', '')
}
</script>
