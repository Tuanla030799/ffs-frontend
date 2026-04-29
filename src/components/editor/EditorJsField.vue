<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-3">
    <div class="mb-3 flex flex-wrap items-center justify-between gap-2">
      <div>
        <p class="text-sm font-bold text-slate-800">Editor.js descriptionJson</p>
        <p class="text-xs text-slate-500">Header, paragraph, list và image upload qua admin file API.</p>
      </div>
      <button
        type="button"
        class="rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
        @click="syncNow"
      >
        Sync
      </button>
    </div>
    <div
      ref="holderRef"
      class="editorjs-holder min-h-72 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2"
    />
    <p
      v-if="error"
      class="mt-2 text-sm font-semibold text-red-600"
    >
      {{ error }}
    </p>
  </div>
</template>

<script setup lang="ts">
import type EditorJS from '@editorjs/editorjs'
import type { OutputData, ToolConstructable } from '@editorjs/editorjs'
import { nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { fileService } from '@/services/file.service'

type EditorValue = OutputData | null | undefined

const props = defineProps<{ modelValue?: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: OutputData] }>()

const holderRef = ref<HTMLElement | null>(null)
const error = ref('')
let editor: EditorJS | null = null
let externalUpdate = false

function normalizeData(value: unknown): OutputData {
  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as EditorValue
      return parsed?.blocks ? parsed : { time: Date.now(), blocks: [] }
    } catch {
      return { time: Date.now(), blocks: [] }
    }
  }

  const data = value as EditorValue
  return data?.blocks ? data : { time: Date.now(), blocks: [] }
}

async function saveEditor() {
  if (!editor || externalUpdate) return
  try {
    const data = await editor.save()
    error.value = ''
    emit('update:modelValue', data)
  } catch (err) {
    error.value = err instanceof Error ? err.message : 'Không thể lưu nội dung Editor.js.'
  }
}

async function syncNow() {
  await saveEditor()
}

async function resetEditor(value: unknown) {
  if (!editor) return
  externalUpdate = true
  try {
    await editor.isReady
    await editor.render(normalizeData(value))
  } finally {
    externalUpdate = false
  }
}

onMounted(async () => {
  await nextTick()
  if (!holderRef.value) return

  const [
    { default: EditorConstructor },
    { default: Header },
    { default: List },
    { default: ImageTool },
  ] = await Promise.all([
    import('@editorjs/editorjs'),
    import('@editorjs/header'),
    import('@editorjs/list'),
    import('@editorjs/image'),
  ])

  editor = new EditorConstructor({
    holder: holderRef.value,
    data: normalizeData(props.modelValue),
    placeholder: 'Nhập mô tả sản phẩm...',
    tools: {
      header: Header as unknown as ToolConstructable,
      list: List as unknown as ToolConstructable,
      image: {
        class: ImageTool as unknown as ToolConstructable,
        config: {
          uploader: {
            async uploadByFile(file: File) {
              const uploaded = await fileService.upload(file, { scope: 'admin' })
              return {
                success: 1,
                file: {
                  url: uploaded.url,
                },
              }
            },
          },
        },
      },
    },
    async onChange() {
      await saveEditor()
    },
  })
})

watch(
  () => props.modelValue,
  async (next) => {
    if (!editor || externalUpdate) return
    await resetEditor(next)
  },
)

onBeforeUnmount(() => {
  const instance = editor
  editor = null
  void instance?.destroy()
})
</script>

<style scoped>
.editorjs-holder :deep(.codex-editor__redactor) {
  padding-bottom: 80px !important;
}

.editorjs-holder :deep(.ce-block__content),
.editorjs-holder :deep(.ce-toolbar__content) {
  max-width: none;
}
</style>
