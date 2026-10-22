<template>
  <div class="space-y-3">
    <label
      class="relative flex cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed px-4 py-6 text-center transition focus-within:ring-4 focus-within:ring-[var(--ui-primary-ring)]"
      :class="
        dragging
          ? 'border-[var(--ui-primary)] bg-[var(--ui-primary-soft)]'
          : 'border-slate-300 bg-slate-50 hover:border-slate-400'
      "
      @dragenter.prevent="dragging = true"
      @dragover.prevent="dragging = true"
      @dragleave.prevent="onDragLeave"
      @drop.prevent="onDrop"
    >
      <input
        ref="fileInput"
        type="file"
        accept="image/*"
        multiple
        class="sr-only"
        :disabled="disabled"
        @change="onSelectFiles"
      />
      <svg
        viewBox="0 0 24 24"
        class="h-7 w-7 text-slate-400"
        fill="none"
        stroke="currentColor"
        stroke-width="1.6"
        aria-hidden="true"
      >
        <path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 15V4m0 0L8 8m4-4 4 4" />
      </svg>
      <span class="text-sm font-semibold text-slate-900">Kéo thả ảnh vào đây hoặc bấm để chọn</span>
      <span class="text-xs text-slate-500">
        Chọn được nhiều ảnh cùng lúc · JPG, PNG, WebP · tối đa {{ maxSizeMb }}MB/ảnh
      </span>
    </label>

    <p v-if="images.length" class="text-xs leading-5 text-slate-500">
      {{ images.length }} ảnh. Ảnh đầu tiên là <strong>ảnh chính</strong>: làm ảnh đại diện ở danh
      sách và hiện đầu tiên trên trang sản phẩm. Bấm vào ảnh để sửa mô tả ảnh (alt).
    </p>
    <p v-else-if="!uploads.length" class="text-xs leading-5 text-amber-700">
      Chưa có ảnh: trang sản phẩm sẽ hiển thị ảnh mặc định của cửa hàng.
    </p>

    <ul
      v-if="images.length || uploads.length"
      ref="list"
      class="grid grid-cols-3 gap-2"
      aria-label="Ảnh sản phẩm"
    >
      <li v-for="(image, index) in images" :key="image.key">
        <div
          class="relative aspect-square overflow-hidden rounded-lg border bg-slate-100"
          :class="
            image.isPrimary ? 'border-slate-900 ring-2 ring-slate-900/15' : 'border-slate-200'
          "
        >
          <button
            type="button"
            class="block h-full w-full cursor-pointer focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)] focus-visible:outline-none focus-visible:ring-inset"
            :aria-label="`Sửa mô tả ảnh ${index + 1}`"
            title="Sửa mô tả ảnh (alt)"
            :disabled="disabled"
            @click="openAltEditor(image)"
          >
            <img
              :src="resolveFileUrl(image.url)"
              :alt="image.altText || `${productName || 'Sản phẩm'} - ảnh ${index + 1}`"
              class="h-full w-full object-cover"
              loading="lazy"
            />
          </button>
          <span
            v-if="image.isPrimary"
            class="pointer-events-none absolute top-1 left-1 rounded bg-slate-900 px-1.5 py-0.5 text-[10px] font-bold text-white"
          >
            Ảnh chính
          </span>
        </div>
        <div class="mt-1 grid grid-cols-4 gap-0.5">
          <span
            v-if="image.isPrimary"
            class="grid h-7 place-items-center text-xs text-slate-950"
            title="Đang là ảnh chính"
            aria-hidden="true"
          >
            ★
          </span>
          <button
            v-else
            type="button"
            :class="iconButtonClass"
            :aria-label="`Đặt ảnh ${index + 1} làm ảnh chính`"
            title="Đặt làm ảnh chính (đưa lên đầu)"
            :disabled="disabled"
            @click="setPrimary(index)"
          >
            <span aria-hidden="true">☆</span>
          </button>
          <button
            type="button"
            data-action="move-prev"
            :class="iconButtonClass"
            :aria-label="`Đưa ảnh ${index + 1} lên trước`"
            title="Đưa lên trước"
            :disabled="disabled || index === 0"
            @click="move(index, -1)"
          >
            <span aria-hidden="true">←</span>
          </button>
          <button
            type="button"
            data-action="move-next"
            :class="iconButtonClass"
            :aria-label="`Đưa ảnh ${index + 1} ra sau`"
            title="Đưa ra sau"
            :disabled="disabled || index === images.length - 1"
            @click="move(index, 1)"
          >
            <span aria-hidden="true">→</span>
          </button>
          <button
            type="button"
            data-action="remove"
            :class="[iconButtonClass, 'hover:bg-red-50 hover:text-red-600']"
            :aria-label="`Xoá ảnh ${index + 1}`"
            title="Xoá ảnh"
            :disabled="disabled"
            @click="remove(index)"
          >
            <span aria-hidden="true">✕</span>
          </button>
        </div>
      </li>

      <li v-for="upload in uploads" :key="upload.key">
        <div
          class="relative aspect-square overflow-hidden rounded-lg border border-dashed bg-slate-50"
          :class="upload.error ? 'border-red-300' : 'border-slate-300'"
        >
          <img
            v-if="upload.previewUrl"
            :src="upload.previewUrl"
            alt=""
            class="h-full w-full object-cover opacity-50"
          />
          <div
            class="absolute inset-0 grid place-items-center p-2 text-center text-[11px] leading-4 font-semibold"
            :class="upload.error ? 'bg-red-50/90 text-red-700' : 'text-slate-700'"
            role="status"
          >
            <span v-if="upload.error">{{ upload.error }}</span>
            <span v-else class="flex items-center gap-1.5">
              <span
                class="h-3.5 w-3.5 animate-spin rounded-full border-2 border-current border-r-transparent"
                aria-hidden="true"
              />
              Đang tải...
            </span>
          </div>
        </div>
        <div v-if="upload.error" class="mt-1 grid grid-cols-2 gap-0.5">
          <button
            v-if="upload.retryable"
            type="button"
            :class="iconButtonClass"
            @click="retry(upload)"
          >
            Thử lại
          </button>
          <button type="button" :class="iconButtonClass" @click="dismiss(upload)">Bỏ</button>
        </div>
      </li>
    </ul>

    <UiModal
      :open="Boolean(altEditingImage)"
      title="Mô tả ảnh (alt)"
      max-width="md"
      @close="closeAltEditor"
    >
      <form v-if="altEditingImage" class="space-y-4" @submit.prevent="saveAlt">
        <img
          :src="resolveFileUrl(altEditingImage.url)"
          alt=""
          class="mx-auto max-h-56 rounded-lg object-contain"
        />
        <div>
          <UiInput
            v-model="altDraft"
            label="Mô tả ảnh"
            :placeholder="productName || 'VD: Giày chạy bộ màu xám nhìn từ bên hông'"
            :maxlength="160"
            autofocus
          />
          <p class="mt-1 text-xs text-slate-500">
            Mô tả ngắn nội dung ảnh cho Google và trình đọc màn hình. Để trống sẽ dùng tên sản phẩm.
          </p>
        </div>
        <div class="flex justify-end gap-2">
          <UiButton native-type="button" variant="secondary" @click="closeAltEditor">Huỷ</UiButton>
          <UiButton native-type="submit">Lưu mô tả</UiButton>
        </div>
      </form>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, ref, watch } from 'vue'
import { UiButton, UiInput, UiModal } from '@/components/ui'
import { resolveFileUrl } from '@/lib/fileUrl'
import {
  imageDraftFromUpload,
  normalizeImageDrafts,
  type ProductImageDraft,
} from '@/modules/catalog/product/form'
import { getErrorMessage } from '@/modules/shared/hooks'
import { fileService } from '@/services/file.service'

type UploadItem = {
  key: string
  file: File
  previewUrl: string
  error: string
  retryable: boolean
}

const MAX_PARALLEL_UPLOADS = 3

const props = withDefaults(
  defineProps<{
    images: ProductImageDraft[]
    productName?: string
    disabled?: boolean
    maxSizeMb?: number
  }>(),
  {
    productName: '',
    disabled: false,
    maxSizeMb: 10,
  },
)

const emit = defineEmits<{
  'update:images': [value: ProductImageDraft[]]
  'update:uploading': [value: boolean]
}>()

const iconButtonClass =
  'grid h-7 place-items-center rounded text-xs font-semibold text-slate-600 transition hover:bg-slate-100 hover:text-slate-950 focus-visible:ring-2 focus-visible:ring-[var(--ui-primary-ring)] focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent'

const fileInput = ref<HTMLInputElement | null>(null)
const list = ref<HTMLElement | null>(null)
const altEditingKey = ref('')
const altDraft = ref('')
const dragging = ref(false)
const uploads = ref<UploadItem[]>([])
const activeUploads = ref(0)
const queue: UploadItem[] = []
// Ảnh upload xong được ghép vào danh sách mới nhất (người dùng có thể vừa xoá/sắp xếp ảnh khác).
let latestImages = props.images

watch(
  () => props.images,
  (images) => {
    latestImages = images
  },
)

const uploading = computed(() => uploads.value.some((upload) => !upload.error))
watch(uploading, (value) => emit('update:uploading', value))

const altEditingImage = computed(() =>
  altEditingKey.value ? props.images.find((image) => image.key === altEditingKey.value) : undefined,
)

function emitImages(images: ProductImageDraft[]) {
  latestImages = normalizeImageDrafts(images)
  emit('update:images', latestImages)
}

// Đổi thứ tự/xoá làm Vue di chuyển hoặc gỡ nút đang được focus: đưa focus về nút tương ứng ở vị
// trí mới để người dùng bàn phím thao tác tiếp được, không bị nhảy về đầu trang.
async function restoreFocus(index: number, actions: string[]) {
  await nextTick()
  const item = list.value?.querySelectorAll('li')[index]
  for (const action of actions) {
    const button = item?.querySelector<HTMLButtonElement>(
      `[data-action="${action}"]:not(:disabled)`,
    )
    if (button) return button.focus()
  }
  fileInput.value?.focus()
}

// Ảnh chính luôn là ảnh đầu tiên nên đặt làm ảnh chính = đưa ảnh lên đầu.
function setPrimary(index: number) {
  const next = [...latestImages]
  const [image] = next.splice(index, 1)
  if (image) next.unshift(image)
  emitImages(next)
  void restoreFocus(0, ['move-next', 'remove'])
}

function move(index: number, direction: -1 | 1) {
  const target = index + direction
  if (target < 0 || target >= latestImages.length) return
  const next = [...latestImages]
  const [moved] = next.splice(index, 1)
  if (moved) next.splice(target, 0, moved)
  emitImages(next)
  const actions = direction < 0 ? ['move-prev', 'move-next'] : ['move-next', 'move-prev']
  void restoreFocus(target, actions)
}

function remove(index: number) {
  emitImages(latestImages.filter((_, i) => i !== index))
  void restoreFocus(Math.min(index, latestImages.length - 1), ['remove'])
}

function openAltEditor(image: ProductImageDraft) {
  altEditingKey.value = image.key
  altDraft.value = image.altText
}

function closeAltEditor() {
  altEditingKey.value = ''
}

function saveAlt() {
  const key = altEditingKey.value
  const altText = altDraft.value.trim()
  emitImages(latestImages.map((image) => (image.key === key ? { ...image, altText } : image)))
  closeAltEditor()
}

function addFiles(files: File[]) {
  for (const file of files) {
    const item: UploadItem = {
      key: crypto.randomUUID(),
      file,
      previewUrl: URL.createObjectURL(file),
      error: '',
      retryable: true,
    }

    if (!file.type.startsWith('image/')) {
      item.error = 'Không phải file ảnh.'
      item.retryable = false
    } else if (file.size > props.maxSizeMb * 1024 * 1024) {
      item.error = `Ảnh lớn hơn ${props.maxSizeMb}MB.`
      item.retryable = false
    }

    uploads.value.push(item)
    if (!item.error) queue.push(item)
  }
  pumpQueue()
}

function pumpQueue() {
  while (activeUploads.value < MAX_PARALLEL_UPLOADS && queue.length) {
    const item = queue.shift()
    if (item) void uploadItem(item)
  }
}

async function uploadItem(item: UploadItem) {
  activeUploads.value += 1
  try {
    const uploaded = await fileService.upload(item.file, { scope: 'admin' })
    if (!uploaded.fileId) throw new Error('API upload không trả về fileId.')
    emitImages([...latestImages, imageDraftFromUpload(uploaded)])
    dismiss(item)
  } catch (error) {
    const target = uploads.value.find((upload) => upload.key === item.key)
    if (target) target.error = getErrorMessage(error) || 'Tải ảnh thất bại.'
  } finally {
    activeUploads.value -= 1
    pumpQueue()
  }
}

function retry(item: UploadItem) {
  item.error = ''
  queue.push(item)
  pumpQueue()
}

function dismiss(item: UploadItem) {
  URL.revokeObjectURL(item.previewUrl)
  uploads.value = uploads.value.filter((upload) => upload.key !== item.key)
}

function onSelectFiles(event: Event) {
  const input = event.target as HTMLInputElement
  addFiles(Array.from(input.files || []))
  // Cho phép chọn lại đúng file vừa chọn (ví dụ sau khi xoá).
  input.value = ''
}

function onDrop(event: DragEvent) {
  dragging.value = false
  if (props.disabled) return
  addFiles(Array.from(event.dataTransfer?.files || []))
}

function onDragLeave(event: DragEvent) {
  const related = event.relatedTarget as Node | null
  if (!related || !(event.currentTarget as HTMLElement).contains(related)) dragging.value = false
}

onBeforeUnmount(() => {
  uploads.value.forEach((upload) => URL.revokeObjectURL(upload.previewUrl))
})
</script>
