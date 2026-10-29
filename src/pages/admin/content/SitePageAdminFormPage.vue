<template>
  <section class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-bold text-slate-400 uppercase">Trang nội dung</p>
        <h2 class="text-2xl font-black text-slate-950">{{ heading }}</h2>
        <p v-if="meta" class="mt-1 text-sm text-slate-500">Hiển thị ở: {{ meta.placement }}</p>
      </div>
      <div class="flex gap-2">
        <UiButton variant="secondary" @click="goBack">Quay lại</UiButton>
        <UiButton :loading="saving" :disabled="loading || Boolean(loadError)" @click="save">
          Lưu trang
        </UiButton>
      </div>
    </div>

    <UiAlert v-if="loadError" variant="error">{{ loadError }}</UiAlert>
    <UiAlert v-else-if="error" variant="error">{{ error }}</UiAlert>

    <UiSkeleton v-if="loading" variant="card" :rows="6" />

    <UiForm v-else-if="!loadError" as="form" class="space-y-5" @submit.prevent="save">
      <UiCard title="Thông tin trang" padding="md">
        <div class="grid gap-3">
          <UiInput v-model="form.title" required label="Tiêu đề" placeholder="Tiêu đề trang" />
          <UiTextarea
            v-if="meta?.usesSummary"
            v-model="form.summary"
            label="Mô tả ngắn (hiển thị dưới tiêu đề và làm mô tả SEO, tối đa 500 ký tự)"
            placeholder="Một hai câu giới thiệu ngắn"
            :maxlength="500"
          />
        </div>
      </UiCard>

      <RichTextEditorField
        v-model="form.contentHtml"
        title="Nội dung"
        description="Nội dung trang, có thể gồm tiêu đề, đoạn văn, danh sách, hình ảnh..."
        placeholder="Viết nội dung..."
        :min-height="520"
      />
    </UiForm>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'
import { UiAlert, UiButton, UiCard, UiForm, UiInput, UiSkeleton, UiTextarea } from '@/components/ui'
import { useToast } from '@/composables/useToast'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { sitePageApi } from '@/modules/content/page/api'
import { sitePageMeta } from '@/modules/content/page/helpers'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import type { SitePage, SitePagePayload } from '@/modules/content/page/types'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const key = computed(() => String(route.params.key || ''))
const meta = computed(() => sitePageMeta(key.value))
const loading = ref(true)
const saving = ref(false)
const loadError = ref('')
const error = ref('')
const savedTitle = ref('')
const heading = computed(() => savedTitle.value || 'Trang nội dung')
const form = reactive<Required<SitePagePayload>>({ title: '', summary: '', contentHtml: '' })

function fill(page: SitePage) {
  Object.assign(form, {
    title: page.title || '',
    summary: page.summary || '',
    contentHtml: page.contentHtml || '',
  })
  savedTitle.value = page.title || ''
}

function goBack() {
  void router.push({ name: 'admin-pages' })
}

async function load() {
  loading.value = true
  loadError.value = ''
  try {
    fill(await sitePageApi.adminDetail(key.value))
  } catch (e) {
    loadError.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}

async function save() {
  const msg = required(form.title.trim(), 'Tiêu đề')
  if (msg) {
    error.value = msg
    return
  }
  saving.value = true
  error.value = ''
  try {
    await sitePageApi.update(key.value, {
      title: form.title.trim(),
      summary: meta.value?.usesSummary ? form.summary.trim() : undefined,
      contentHtml: sanitizeHtml(form.contentHtml || ''),
    })
    savedTitle.value = form.title.trim()
    toast.push('Đã lưu nội dung trang.', 'success', 'Thành công')
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    saving.value = false
  }
}

onMounted(load)
</script>
