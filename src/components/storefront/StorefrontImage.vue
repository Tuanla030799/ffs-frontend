<template>
  <img
    v-if="displaySrc"
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
import { computed, ref, useAttrs, watch } from 'vue'
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
const sourceFailed = ref(false)
const fallbackFailed = ref(false)

const imageAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})
const sourceSrc = computed(() => resolveFileUrl(props.src || ''))
const fallbackSrc = computed(() => resolveFileUrl(props.fallbackSrc || ''))
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

function handleError() {
  if (!sourceFailed.value && sourceSrc.value && fallbackSrc.value) {
    sourceFailed.value = true
    return
  }

  fallbackFailed.value = true
}
</script>
