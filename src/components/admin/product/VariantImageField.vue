<template>
  <div class="flex items-start gap-3">
    <div
      class="grid h-20 w-20 shrink-0 place-items-center overflow-hidden rounded-lg border border-slate-200 bg-slate-50"
    >
      <img
        v-if="modelValue?.url"
        :src="resolveFileUrl(modelValue.url)"
        :alt="previewAlt"
        class="h-full w-full object-cover"
      />
      <span v-else-if="uploading" class="text-xs font-semibold text-slate-500">Đang tải...</span>
      <span v-else class="px-1 text-center text-xs text-slate-400">Chưa có ảnh</span>
    </div>

    <div class="min-w-0 flex-1 space-y-2">
      <div class="relative flex flex-wrap gap-2">
        <UiButton
          native-type="button"
          variant="secondary"
          size="sm"
          :disabled="disabled || !productImages.length"
          :title="productImages.length ? '' : 'Tải ảnh sản phẩm lên trước'"
          @click="pickerOpen = true"
        >
          Chọn từ ảnh sản phẩm
        </UiButton>
        <UiButton
          native-type="button"
          variant="secondary"
          size="sm"
          :loading="uploading"
          :disabled="disabled"
          @click="fileInput?.click()"
        >
          Tải ảnh khác
        </UiButton>
        <input
          ref="fileInput"
          type="file"
          accept="image/*"
          class="sr-only"
          tabindex="-1"
          aria-hidden="true"
          @change="onUpload"
        />
        <UiButton
          v-if="modelValue"
          native-type="button"
          variant="ghost"
          size="sm"
          :disabled="disabled"
          @click="emit('update:modelValue', null)"
        >
          Bỏ ảnh
        </UiButton>
      </div>
      <p v-if="error" class="text-xs text-red-600" role="alert">{{ error }}</p>
      <p v-else class="text-xs text-slate-500">
        Ảnh hiển thị ở ô chọn màu trên trang sản phẩm (không bắt buộc).
      </p>
    </div>

    <UiModal
      :open="pickerOpen"
      title="Chọn ảnh cho màu này"
      max-width="xl"
      @close="pickerOpen = false"
    >
      <ul class="grid grid-cols-3 gap-2 sm:grid-cols-4">
        <li v-for="(image, index) in productImages" :key="image.key">
          <button
            type="button"
            class="block aspect-square w-full overflow-hidden rounded-lg border-2 transition focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)] focus-visible:outline-none"
            :class="
              modelValue?.fileId === image.fileId
                ? 'border-slate-950'
                : 'border-transparent hover:border-slate-300'
            "
            :aria-label="`Chọn ảnh ${index + 1}`"
            :aria-pressed="modelValue?.fileId === image.fileId"
            @click="selectImage(image)"
          >
            <img
              :src="resolveFileUrl(image.url)"
              alt=""
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
        </li>
      </ul>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { UiButton, UiModal } from '@/components/ui'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { ProductImageDraft } from '@/modules/catalog/product/form'
import { getErrorMessage } from '@/modules/shared/hooks'
import { fileService } from '@/services/file.service'

type VariantImage = { fileId: string; url: string }

const props = withDefaults(
  defineProps<{
    modelValue?: VariantImage | null
    productImages?: ProductImageDraft[]
    previewAlt?: string
    disabled?: boolean
    maxSizeMb?: number
  }>(),
  {
    modelValue: null,
    productImages: () => [],
    previewAlt: 'Ảnh màu',
    disabled: false,
    maxSizeMb: 10,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: VariantImage | null]
}>()

const fileInput = ref<HTMLInputElement | null>(null)
const pickerOpen = ref(false)
const uploading = ref(false)
const error = ref('')

function selectImage(image: ProductImageDraft) {
  emit('update:modelValue', { fileId: image.fileId, url: image.url })
  pickerOpen.value = false
}

async function onUpload(event: Event) {
  const input = event.target as HTMLInputElement
  const file = input.files?.[0]
  input.value = ''
  if (!file) return

  error.value = ''
  if (!file.type.startsWith('image/')) {
    error.value = 'Vui lòng chọn file ảnh.'
    return
  }
  if (file.size > props.maxSizeMb * 1024 * 1024) {
    error.value = `Ảnh lớn hơn ${props.maxSizeMb}MB.`
    return
  }

  uploading.value = true
  try {
    const uploaded = await fileService.upload(file, { scope: 'admin' })
    if (!uploaded.fileId) throw new Error('API upload không trả về fileId.')
    emit('update:modelValue', {
      fileId: String(uploaded.fileId),
      url: uploaded.url || uploaded.path,
    })
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    uploading.value = false
  }
}
</script>
