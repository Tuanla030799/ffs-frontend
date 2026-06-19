<template>
  <div class="relative">
    <button
      type="button"
      :disabled="!resolvedSrc"
      class="group relative aspect-square w-full overflow-hidden rounded-xl border border-slate-200 bg-slate-50 text-left disabled:cursor-not-allowed"
      @click="open = true"
    >
      <img
        v-if="resolvedSrc"
        :src="resolvedSrc"
        :alt="alt"
        class="h-full w-full object-cover transition group-hover:scale-105"
      />
      <div v-else class="grid h-full place-items-center px-3 text-center text-sm text-slate-400">
        Chưa có ảnh
      </div>
      <div
        v-if="resolvedSrc"
        class="absolute inset-x-0 bottom-0 bg-slate-950/55 px-3 py-2 text-xs font-semibold text-white opacity-0 transition group-hover:opacity-100"
      >
        Xem ảnh
      </div>
    </button>
    <div v-if="showRemove && resolvedSrc" class="absolute top-2 right-2 z-20">
      <UiButton
        native-type="button"
        variant="danger"
        size="sm"
        square
        class="shadow-lg"
        :disabled="removeDisabled"
        @click="$emit('remove')"
      >
        ×
      </UiButton>
    </div>

    <UiModal :open="open" :title="title" max-width="xl" @close="open = false">
      <div class="overflow-hidden rounded-xl bg-slate-100">
        <img
          v-if="resolvedSrc"
          :src="resolvedSrc"
          :alt="alt"
          class="max-h-[72vh] w-full object-contain"
        />
      </div>
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from 'vue'
import { UiButton, UiModal } from '@/components/ui'
import { resolveFileUrl } from '@/lib/fileUrl'

const props = withDefaults(
  defineProps<{
    src?: string | null
    alt?: string
    title?: string
    showRemove?: boolean
    removeDisabled?: boolean
  }>(),
  {
    src: '',
    alt: 'preview image',
    title: 'Xem ảnh',
    showRemove: false,
    removeDisabled: false,
  },
)

defineEmits<{
  remove: []
}>()

const open = ref(false)
const resolvedSrc = computed(() => resolveFileUrl(props.src || ''))
</script>
