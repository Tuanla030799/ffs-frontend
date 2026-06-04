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
            <UiInput v-model="form.title" placeholder="Title *" required label="Tiêu đề bài viết" />
            <UiInput v-model="form.slug" placeholder="Slug" label="Slug" />
            <UiSelect v-model="form.status" label="Trạng thái">
              <option>ACTIVE</option>
              <option>INACTIVE</option>
              <option>DRAFT</option>
            </UiSelect>
            <UiInput
              v-model="form.publishedAt"
              type="datetime-local"
              placeholder="Published at"
              label="Ngày hiển thị"
            />
            <UiTextarea
              v-model="form.excerpt"
              class="md:col-span-2"
              placeholder="Excerpt"
              label="Đoạn trích ngắn (hiển thị ở danh sách blog và trang chi tiết)"
            />
          </div>
        </UiCard>

        <RichTextEditorField
          v-model="form.contentHtml"
          title="Nội dung blog"
          description="Nội dung bài viết, có thể bao gồm text, hình ảnh, video,..."
          placeholder="Viết bài blog..."
          :min-height="520"
        />
      </div>

      <aside class="space-y-5">
        <UiCard title="Ảnh bìa" padding="md">
          <FileUpload
            v-if="!form.coverFileId && !coverPreviewUrl"
            v-model="uploaded"
            scope="admin"
            accept="image/*"
            title="Thêm ảnh bìa"
            description="Kích thước đề xuất: 1200x630 (tỷ lệ 1.91:1) để hiển thị tốt trên mạng xã hội."
            trigger-text="Thêm ảnh"
            @uploaded="assignCoverImage"
          />
          <div
            v-if="form.coverFileId || coverPreviewUrl"
            class="mt-3 grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[104px_minmax(0,1fr)]"
          >
            <ImagePreview
              :src="coverPreviewUrl"
              :alt="form.title || 'Blog cover'"
              :title="form.title || 'Blog cover'"
            />
            <div class="space-y-2">
              <UiInput :model-value="form.coverFileId" label="File ID" readonly />
              <div class="flex justify-end">
                <UiButton native-type="button" variant="danger" size="sm" @click="clearCoverImage">
                  Xóa ảnh
                </UiButton>
              </div>
            </div>
          </div>
        </UiCard>
      </aside>
    </UiForm>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import FileUpload from '@/components/common/FileUpload.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'
import { UiAlert, UiButton, UiCard, UiForm, UiInput, UiSelect, UiTextarea } from '@/components/ui'
import { blogApi } from '@/modules/content/blog/api'
import { isEditorJsContent, normalizeRichTextInput } from '@/lib/richText'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { toBackendDateTime, toDateTimeLocalInput } from '@/lib/dateTime'
import { slugify, syncAutoSlug } from '@/lib/slug'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import type { Blog, BlogPayload } from '@/modules/content/blog/types'
import type { UploadedFile } from '@/services/file.service'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const error = ref('')
const uploaded = ref<UploadedFile | null>(null)
const coverPreviewUrl = ref('')
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

function fill(row?: Blog) {
  Object.assign(form, {
    title: row?.title || '',
    slug: row?.slug || '',
    excerpt: row?.excerpt || '',
    contentHtml: normalizeRichTextInput(row?.contentHtml),
    contentJson: null,
    coverFileId: row?.coverFileId || '',
    status: row?.status || 'DRAFT',
    publishedAt: toDateTimeLocalInput(row?.publishedAt),
  })
  coverPreviewUrl.value = row?.coverUrl || row?.coverImageUrl || ''
  hasLegacyContent.value = !form.contentHtml && isEditorJsContent(row?.contentJson)
  uploaded.value = null
}
watch(
  () => form.title,
  (title, previousTitle) => {
    form.slug = syncAutoSlug(form.slug, previousTitle, title)
  },
)
function assignCoverImage(file: UploadedFile) {
  form.coverFileId = String(file.fileId)
  coverPreviewUrl.value = file.url || file.path || ''
  uploaded.value = null
}
function clearCoverImage() {
  form.coverFileId = ''
  coverPreviewUrl.value = ''
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
      publishedAt: toBackendDateTime(form.publishedAt || null) || undefined,
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
