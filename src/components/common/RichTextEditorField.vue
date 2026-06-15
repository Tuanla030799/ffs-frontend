<template>
  <UiCard :class="wrapperClass" padding="none">
    <template v-if="heading" #header>
      <div class="min-w-0">
        <h3 class="text-base font-black text-[var(--ui-text)]">{{ heading }}</h3>
        <p v-if="description" class="mt-1 text-sm leading-6 text-[var(--ui-text-soft)]">
          {{ description }}
        </p>
      </div>
    </template>

    <div class="space-y-2 p-3 sm:p-4">
      <Editor
        :id="editorId"
        :model-value="localValue"
        :disabled="isDisabled"
        :init="editorInit"
        @init="onInit"
        @update:model-value="onUpdate"
      />
      <p v-if="error || localError" class="text-sm font-semibold text-red-600">
        {{ error || localError }}
      </p>
    </div>
  </UiCard>
</template>

<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import Editor from '@tinymce/tinymce-vue'
import 'tinymce/tinymce'
import 'tinymce/icons/default'
import 'tinymce/themes/silver'
import 'tinymce/models/dom'
import 'tinymce/plugins/advlist'
import 'tinymce/plugins/autolink'
import 'tinymce/plugins/autoresize'
import 'tinymce/plugins/code'
import 'tinymce/plugins/fullscreen'
import 'tinymce/plugins/image'
import 'tinymce/plugins/link'
import 'tinymce/plugins/lists'
import 'tinymce/plugins/preview'
import 'tinymce/plugins/table'
import 'tinymce/plugins/wordcount'
import 'tinymce/skins/ui/oxide/skin.css'
import 'tinymce/skins/ui/oxide/content.css'
import 'tinymce/skins/content/default/content.css'
import { UiCard } from '@/components/ui'
import { fileService } from '@/services/file.service'
import { normalizeRichTextInput } from '@/lib/richText'
import { resolveFileUrl } from '@/lib/fileUrl'

type BlobInfo = {
  blob: () => Blob
  filename: () => string
}

type TinyEditorInstance = {
  getContent: () => string
}

const props = withDefaults(
  defineProps<{
    modelValue?: unknown
    label?: string
    title?: string
    description?: string
    placeholder?: string
    minHeight?: number
    disabled?: boolean
    readonly?: boolean
    error?: string
    wrapperClass?: string
  }>(),
  {
    modelValue: undefined,
    label: '',
    title: '',
    description: '',
    placeholder: 'Nhập nội dung...',
    minHeight: 420,
    disabled: false,
    readonly: false,
    error: '',
    wrapperClass: '',
  },
)

const emit = defineEmits<{
  'update:modelValue': [value: string]
  change: [value: string]
}>()

const editorId = `rich-text-editor-${Math.random().toString(36).slice(2)}`
const localError = ref('')
const localValue = ref(normalizeRichTextInput(props.modelValue))
let editorInstance: TinyEditorInstance | null = null
const heading = computed(() => props.title || props.label)
const isDisabled = computed(() => props.disabled || props.readonly)

const editorInit = computed(() => ({
  license_key: 'gpl',
  promotion: false,
  branding: false,
  skin: false,
  content_css: false,
  menubar: false,

  readonly: isDisabled.value,

  min_height: props.minHeight,
  max_height: 900,
  autoresize_bottom_margin: 24,
  placeholder: props.placeholder,

  plugins: 'advlist autolink autoresize code fullscreen image link lists preview table wordcount',

  toolbar:
    'undo redo | blocks | bold italic underline strikethrough | forecolor backcolor | ' +
    'alignleft aligncenter alignright alignjustify | bullist numlist outdent indent | ' +
    'link image table blockquote | code preview fullscreen',

  block_formats: 'Paragraph=p; Heading 1=h1; Heading 2=h2; Heading 3=h3; Heading 4=h4',
  valid_styles: {
    '*': 'color,background-color,text-align',
  },

  paste_data_images: false,
  automatic_uploads: true,
  images_upload_credentials: true,
  file_picker_types: 'image',
  invalid_elements: 'script,style,iframe,object,embed',

  image_title: true,
  image_caption: true,
  image_advtab: true,

  content_style: `
    body {
      font-family: "IBM Plex Sans", system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
      font-size: 15px;
      line-height: 1.75;
      color: #111827;
    }

    img {
      max-width: 100%;
      height: auto;
      border-radius: 14px;
    }

    figure {
      margin: 1rem 0;
    }

    figcaption {
      color: #64748b;
      font-size: 13px;
      text-align: center;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th,
    td {
      border: 1px solid #e2e8f0;
      padding: 10px;
    }

    blockquote {
      border-left: 4px solid #111827;
      margin-left: 0;
      padding-left: 16px;
      font-weight: 700;
    }
  `,

  images_upload_handler: async (blobInfo: BlobInfo) => {
    localError.value = ''

    try {
      const blob = blobInfo.blob()

      const file = new File([blob], blobInfo.filename(), {
        type: blob.type || 'image/*',
      })

      const uploaded = await fileService.upload(file, {
        scope: 'admin',
        fieldName: 'file',
      })

      if (!uploaded.url) {
        throw new Error('Upload image failed')
      }

      return resolveFileUrl(uploaded.rawUrl || uploaded.path || uploaded.url)
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Upload image failed'
      localError.value = message
      throw new Error(message)
    }
  },
}))

watch(
  () => props.modelValue,
  (next) => {
    const normalized = normalizeRichTextInput(next)
    if (normalized !== localValue.value) localValue.value = normalized
  },
)

function isTinyEditorInstance(value: unknown): value is TinyEditorInstance {
  return Boolean(value && typeof (value as TinyEditorInstance).getContent === 'function')
}

function onInit(...args: unknown[]) {
  const directEditor = args.find(isTinyEditorInstance)
  const nestedEditor = args
    .map((arg) => (arg && typeof arg === 'object' ? (arg as { editor?: unknown }).editor : null))
    .find(isTinyEditorInstance)

  editorInstance = directEditor || nestedEditor || null
}

function onUpdate(value: string) {
  const content = editorInstance?.getContent() ?? value
  if (content === localValue.value) return
  localValue.value = content
  emit('update:modelValue', content)
  emit('change', content)
}
</script>

<style scoped>
:deep(.tox.tox-tinymce) {
  border: 1px solid var(--ui-border);
  border-radius: 16px;
  overflow: hidden;
}

:deep(.tox .tox-toolbar__primary),
:deep(.tox .tox-toolbar-overlord),
:deep(.tox .tox-editor-header) {
  background: var(--ui-surface-soft);
}

:deep(.tox .tox-tbtn) {
  border-radius: 10px;
}

:deep(.tox .tox-edit-area__iframe) {
  background: white;
}
</style>
