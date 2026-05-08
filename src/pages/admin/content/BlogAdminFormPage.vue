<template>
  <section class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-bold text-slate-400 uppercase">Blogs</p>
        <h2 class="text-2xl font-black text-slate-950">
          {{ isEdit ? 'Cập nhật blog' : 'Tạo blog' }}
        </h2>
      </div>
      <div class="flex gap-2">
        <UiButton variant="secondary" @click="goBack">Quay lại</UiButton>
        <UiButton :loading="saving" @click="save">Lưu blog</UiButton>
      </div>
    </div>

    <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>

    <UiForm as="form" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" @submit.prevent="save">
      <div class="space-y-5">
        <UiCard title="Thông tin bài viết" padding="md">
          <div class="grid gap-3 md:grid-cols-3">
            <UiInput
              v-model="form.title"
              placeholder="Title *"
              required
              @update:model-value="syncSlug"
              label="Title"
            />
            <UiInput v-model="form.slug" placeholder="Slug" label="Slug" />
            <UiSelect v-model="form.status" label="Trạng thái">
              <option>DRAFT</option>
              <option>ACTIVE</option>
              <option>INACTIVE</option>
            </UiSelect>
            <UiInput
              v-model="form.publishedAt"
              type="datetime-local"
              placeholder="Published at"
              label="Published at"
            />
            <UiTextarea
              v-model="form.excerpt"
              class="md:col-span-2"
              placeholder="Excerpt"
              label="Excerpt"
            />
          </div>
        </UiCard>

        <RichTextEditorField
          v-model="form.contentHtml"
          title="Nội dung blog"
          description="Nội dung HTML sẽ được lưu vào field contentHtml."
          placeholder="Viết bài blog..."
          :min-height="520"
        />
        <p v-if="hasLegacyContent" class="text-sm font-semibold text-amber-700">
          Blog này còn dữ liệu Editor.js cũ. TinyMCE chỉ nạp contentHtml; cần convert legacy JSON
          sang HTML trước khi chỉnh tiếp nội dung cũ.
        </p>
      </div>

      <aside class="space-y-5">
        <UiCard title="Cover image" padding="md">
          <FileUpload
            v-model="uploaded"
            scope="admin"
            accept="image/*"
            title="Upload cover"
            @uploaded="(file) => (form.coverFileId = String(file.fileId))"
          />
        </UiCard>

        <UiCard title="Publish" padding="md">
          <p class="mt-1 text-sm text-slate-500">
            Nếu status ACTIVE mà publishedAt trống, backend sẽ tự set ngày publish.
          </p>
          <div class="mt-4 grid gap-2">
            <UiButton native-type="submit" :loading="saving">Lưu blog</UiButton>
            <UiButton native-type="button" variant="secondary" @click="goBack">Hủy</UiButton>
          </div>
        </UiCard>
      </aside>
    </UiForm>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FileUpload from '@/components/common/FileUpload.vue'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'
import { UiAlert, UiButton, UiCard, UiForm, UiInput, UiSelect, UiTextarea } from '@/components/ui'
import { blogApi } from '@/modules/content/blog/api'
import { isEditorJsContent, normalizeRichTextInput } from '@/lib/richText'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import type { Blog, BlogPayload } from '@/modules/content/blog/types'
import type { UploadedFile } from '@/services/file.service'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const error = ref('')
const uploaded = ref<UploadedFile | null>(null)
const hasLegacyContent = ref(false)
const form = reactive<BlogPayload>({
  title: '',
  slug: '',
  excerpt: '',
  contentHtml: '',
  contentJson: null,
  coverFileId: '',
  status: 'DRAFT',
  publishedAt: '',
})

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
function syncSlug() {
  if (!form.slug) form.slug = slugify(form.title)
}
function fill(row?: Blog) {
  Object.assign(form, {
    title: row?.title || '',
    slug: row?.slug || '',
    excerpt: row?.excerpt || '',
    contentHtml: normalizeRichTextInput(row?.contentHtml),
    contentJson: null,
    coverFileId: row?.coverFileId || '',
    status: row?.status || 'DRAFT',
    publishedAt: row?.publishedAt?.slice(0, 16) || '',
  })
  hasLegacyContent.value = !form.contentHtml && isEditorJsContent(row?.contentJson)
  uploaded.value = null
}
function goBack() {
  void router.push({ name: 'admin-blogs' })
}

async function save() {
  const msg = required(form.title, 'Title')
  if (msg) {
    error.value = msg
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = {
      ...form,
      slug: form.slug || slugify(form.title),
      contentHtml: sanitizeHtml(form.contentHtml || ''),
      contentJson: null,
      publishedAt: form.publishedAt || undefined,
    }
    if (isEdit.value) await blogApi.update(String(route.params.id), payload)
    else await blogApi.create(payload)
    goBack()
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  if (isEdit.value) fill(await blogApi.adminDetail(String(route.params.id)))
  else fill()
})
</script>
