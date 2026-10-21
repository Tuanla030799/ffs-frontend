<template>
  <img
    v-if="displaySrc"
    ref="imageRef"
    v-bind="imageAttrs"
    :src="displaySrc"
    :alt="alt"
    :loading="loading"
    :decoding="decoding"
    :class="[fitClass, attrs.class]"
    @error="handleError"
  />
  <slot v-else name="fallback" />
</template>

<script setup lang="ts">
import { computed, onMounted, ref, useAttrs, watch } from 'vue'
import { resolveFileUrl } from '@/lib/fileUrl'
import { DEFAULT_OG_IMAGE_PATH } from '@/lib/seo'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt?: string
    fit?: 'cover' | 'contain' | 'fill' | 'none' | 'scale-down'
    fallbackSrc?: string | null
    loading?: 'eager' | 'lazy'
    decoding?: 'async' | 'auto' | 'sync'
  }>(),
  {
    src: '',
    alt: '',
    fit: 'cover',
    fallbackSrc: DEFAULT_OG_IMAGE_PATH,
    loading: 'lazy',
    decoding: 'async',
  },
)

const attrs = useAttrs()
const imageRef = ref<HTMLImageElement | null>(null)
const sourceFailed = ref(false)
const fallbackFailed = ref(false)

const imageAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})
// Ảnh mặc định là asset tĩnh của FE (thư mục public), không được ghép với domain file của BE.
function resolveImageUrl(url?: string | null) {
  if (!url) return ''
  return url === DEFAULT_OG_IMAGE_PATH ? url : resolveFileUrl(url)
}

const sourceSrc = computed(() => resolveImageUrl(props.src))
const fallbackSrc = computed(() => resolveImageUrl(props.fallbackSrc))
const displaySrc = computed(() => {
  if (sourceFailed.value) return fallbackFailed.value ? '' : fallbackSrc.value
  return sourceSrc.value || fallbackSrc.value
})
const fitClass = computed(
  () =>
    ({
      cover: 'object-cover',
      contain: 'object-contain',
      fill: 'object-fill',
      none: 'object-none',
      'scale-down': 'object-scale-down',
    })[props.fit],
)

watch([sourceSrc, fallbackSrc], () => {
  sourceFailed.value = false
  fallbackFailed.value = false
})

// Ảnh có thể đã lỗi khi trình duyệt tải HTML SSR, trước lúc Vue gắn @error: kiểm tra lại
// sau khi mount để vẫn chuyển sang ảnh dự phòng.
onMounted(() => {
  const image = imageRef.value
  if (image?.complete && image.naturalWidth === 0) handleError()
})

function handleError() {
  if (!sourceFailed.value && sourceSrc.value && fallbackSrc.value) {
    sourceFailed.value = true
    return
  }

  fallbackFailed.value = true
}
</script>
