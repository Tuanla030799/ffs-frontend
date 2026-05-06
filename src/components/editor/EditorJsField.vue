<template>
  <RichTextEditorField
    :model-value="modelValue"
    :title="title"
    :description="description"
    :placeholder="placeholder"
    :min-height="resolvedMinHeight"
    :disabled="disabled"
    :readonly="readOnly || readonly"
    @update:model-value="$emit('update:modelValue', $event)"
    @change="$emit('change', $event)"
  />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'

const props = withDefaults(
  defineProps<{
    modelValue?: unknown
    title?: string
    description?: string
    placeholder?: string
    minHeight?: number
    minHeightClass?: string
    disabled?: boolean
    readOnly?: boolean
    readonly?: boolean
  }>(),
  {
    modelValue: undefined,
    title: '',
    description: '',
    placeholder: '',
    minHeight: 420,
    minHeightClass: '',
    disabled: false,
    readOnly: false,
    readonly: false,
  },
)

defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const resolvedMinHeight = computed(() => {
  const match = props.minHeightClass.match(/min-h-\[(\d+)px\]/)
  return match ? Number(match[1]) : props.minHeight
})
</script>
