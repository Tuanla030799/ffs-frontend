<template>
  <section :class="wrapperClasses">
    <header v-if="!hideHeader" class="mb-3 flex flex-wrap items-start justify-between gap-3">
      <div>
        <h3 class="text-sm font-black text-slate-900">{{ title }}</h3>
        <p v-if="description" class="mt-1 text-xs leading-5 text-slate-500">
          {{ description }}
        </p>
      </div>
      <UiButton v-if="showSync" native-type="button" variant="secondary" size="sm" @click="syncNow">
        {{ syncText }}
      </UiButton>
    </header>

    <div ref="holderRef" :class="holderClasses" />

    <p v-if="error" class="mt-2 text-sm font-semibold text-red-600">
      {{ error }}
    </p>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { UiButton } from '@/components/ui'
import { cn } from '@/utils/cn'
import { fileService, type FileUploadScope } from '@/services/file.service'
import type EditorJS from '@editorjs/editorjs'
import type { OutputData, ToolConstructable, ToolSettings } from '@editorjs/editorjs'

type EditorValue = OutputData | null | undefined

const props = withDefaults(
  defineProps<{
    modelValue?: unknown
    title?: string
    description?: string
    placeholder?: string
    minHeightClass?: string
    wrapperClass?: string
    holderClass?: string
    hideHeader?: boolean
    showSync?: boolean
    syncText?: string
    uploadScope?: FileUploadScope
    enableImage?: boolean
    readOnly?: boolean
  }>(),
  {
    modelValue: undefined,
    title: 'Editor.js content',
    description: 'Header, paragraph, list và image upload qua file API.',
    placeholder: 'Nhập nội dung...',
    minHeightClass: 'min-h-72',
    wrapperClass: '',
    holderClass: '',
    hideHeader: false,
    showSync: true,
    syncText: 'Sync',
    uploadScope: 'admin',
    enableImage: true,
    readOnly: false,
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: OutputData]
  change: [value: OutputData]
  ready: [editor: EditorJS]
  error: [message: string]
}>()

const holderRef = ref<HTMLElement | null>(null)
const error = ref('')
let editor: EditorJS | null = null
let externalUpdate = false
let renderedSnapshot = ''
let emittedSnapshot = ''

const wrapperClasses = computed(() =>
  cn('rounded-2xl border border-slate-200 bg-white p-3', props.wrapperClass),
)

const holderClasses = computed(() =>
  cn(
    'editorjs-holder rounded-xl border border-slate-200 bg-slate-50 px-4 py-2',
    props.minHeightClass,
    props.holderClass,
  ),
)

function emptyDocument(): OutputData {
  return { time: Date.now(), blocks: [] }
}

function snapshot(value: OutputData) {
  return JSON.stringify(value)
}

function cleanBlock(block: unknown) {
  if (!block || typeof block !== 'object') return null

  const raw = block as { type?: string; data?: Record<string, unknown> }
  const data = raw.data || {}

  if (raw.type === 'paragraph') {
    const text = typeof data.text === 'string' ? data.text : ''
    return text.trim() ? { type: 'paragraph', data: { text } } : null
  }

  if (raw.type === 'header') {
    const text = typeof data.text === 'string' ? data.text : ''
    const level = typeof data.level === 'number' ? data.level : 2
    return text.trim() ? { type: 'header', data: { text, level } } : null
  }

  if (raw.type === 'list') {
    const items = Array.isArray(data.items) ? data.items : []
    const style = data.style === 'ordered' ? 'ordered' : 'unordered'
    return items.length ? { type: 'list', data: { ...data, items, style } } : null
  }

  if (raw.type === 'quote') {
    const text = typeof data.text === 'string' ? data.text : ''
    const caption = typeof data.caption === 'string' ? data.caption : ''
    return text.trim() ? { type: 'quote', data: { text, caption } } : null
  }

  if (raw.type === 'delimiter') return { type: 'delimiter', data: {} }

  if (raw.type === 'image') {
    const file = data.file && typeof data.file === 'object' ? data.file : null
    const url = typeof data.url === 'string' ? data.url : ''
    if (!file && !url) return null
    return { type: 'image', data }
  }

  return raw.type ? raw : null
}

function normalizeData(value: unknown): OutputData {
  let result: OutputData

  if (typeof value === 'string') {
    try {
      const parsed = JSON.parse(value) as EditorValue
      result = parsed?.blocks ? parsed : emptyDocument()
    } catch {
      result = emptyDocument()
    }
  } else {
    const data = value as EditorValue
    result = data?.blocks ? data : emptyDocument()
  }

  const blocks = Array.isArray(result.blocks) ? result.blocks.map(cleanBlock).filter(Boolean) : []

  return { ...result, blocks } as OutputData
}

async function saveEditor() {
  if (!editor || externalUpdate) return
  try {
    const data = normalizeData(await editor.save())
    emittedSnapshot = snapshot(data)
    renderedSnapshot = emittedSnapshot
    error.value = ''
    emit('update:modelValue', data)
    emit('change', data)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Không thể lưu nội dung Editor.js.'
    error.value = message
    emit('error', message)
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
    const data = normalizeData(value)
    renderedSnapshot = snapshot(data)
    await editor.render(data)
  } finally {
    externalUpdate = false
  }
}

async function buildTools() {
  const [{ default: Header }, { default: List }] = await Promise.all([
    import('@editorjs/header'),
    import('@editorjs/list'),
  ])

  const tools: Record<string, ToolConstructable | ToolSettings> = {
    header: Header as unknown as ToolConstructable,
    list: List as unknown as ToolConstructable,
  }

  if (props.enableImage) {
    const { default: ImageTool } = await import('@editorjs/image')
    tools.image = {
      class: ImageTool as unknown as ToolConstructable,
      config: {
        uploader: {
          async uploadByFile(file: File) {
            const uploaded = await fileService.upload(file, { scope: props.uploadScope })
            return {
              success: 1,
              file: { url: uploaded.url },
            }
          },
        },
      },
    }
  }

  return tools
}

onMounted(async () => {
  await nextTick()
  if (!holderRef.value) return

  const [{ default: EditorConstructor }, tools] = await Promise.all([
    import('@editorjs/editorjs'),
    buildTools(),
  ])

  editor = new EditorConstructor({
    holder: holderRef.value,
    data: normalizeData(props.modelValue),
    placeholder: props.placeholder,
    readOnly: props.readOnly,
    tools,
    async onReady() {
      if (editor) emit('ready', editor)
    },
    async onChange() {
      await saveEditor()
    },
  })

  renderedSnapshot = snapshot(normalizeData(props.modelValue))
})

watch(
  () => props.modelValue,
  async (next) => {
    if (!editor || externalUpdate) return
    const nextData = normalizeData(next)
    const nextSnapshot = snapshot(nextData)
    if (nextSnapshot === emittedSnapshot || nextSnapshot === renderedSnapshot) return
    await resetEditor(next)
  },
)

onBeforeUnmount(() => {
  const instance = editor
  editor = null
  void instance?.destroy()
})

defineExpose({
  save: syncNow,
  render: resetEditor,
  getEditor: () => editor,
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
