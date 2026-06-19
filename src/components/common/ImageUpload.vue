<template>
  <div class="space-y-3">
    <div v-if="previewSrc" class="w-36 max-w-full">
      <ImagePreview
        :src="previewSrc"
        :alt="previewAlt"
        :title="previewTitle"
        show-remove
        :remove-disabled="disabled"
        @remove="$emit('update:modelValue', null)"
      />
    </div>
    <FileUpload
      :model-value="modelValue"
      :scope="scope"
      :title="title"
      :description="description"
      :accept="accept"
      :max-size-mb="maxSizeMb"
      :disabled="disabled"
      :trigger-text="triggerText"
      :show-preview="false"
      :show-clear="false"
      @update:model-value="$emit('update:modelValue', $event)"
      @uploaded="$emit('uploaded', $event)"
      @error="$emit('error', $event)"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import FileUpload from '@/components/common/FileUpload.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'
import type { FileUploadScope, UploadedFile } from '@/services/file.service'

const props = withDefaults(
  defineProps<{
    modelValue?: UploadedFile | null
    scope?: FileUploadScope
    title?: string
    description?: string
    accept?: string
    maxSizeMb?: number
    disabled?: boolean
    triggerText?: string
    previewAlt?: string
    previewTitle?: string
  }>(),
  {
    modelValue: null,
    scope: 'client',
    title: 'Upload image',
    description: '',
    accept: 'image/*',
    maxSizeMb: 10,
    disabled: false,
    triggerText: 'Chọn ảnh',
    previewAlt: 'uploaded image',
    previewTitle: 'Xem ảnh',
  },
)

defineEmits<{
  'update:modelValue': [value: UploadedFile | null]
  uploaded: [value: UploadedFile]
  error: [message: string]
}>()

const previewSrc = computed(() => props.modelValue?.url || props.modelValue?.path || '')
</script>
