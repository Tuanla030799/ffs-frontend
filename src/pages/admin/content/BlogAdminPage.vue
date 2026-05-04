<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý blogs"
    description="Bài viết, hướng dẫn chọn giày và nội dung editorial."
    :loading="loading"
    :error="error"
    :status-options="['DRAFT', 'ACTIVE', 'INACTIVE']"
    :show-modal="false"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa blog ${deleting?.title || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="load"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <p
      v-if="notice"
      class="m-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700"
    >
      {{ notice }}
    </p>
    <UiTable :columns="columns" :rows="rows" :loading="loading" density="sm" sticky-header striped row-key="id" min-width="min-w-[920px]" empty-text="Không có blog.">
      <template #cell-title="{ row }">
        <span class="font-black text-slate-950">{{ row.title }}</span>
      </template>
      <template #cell-cover="{ row }">
            <img
              v-if="coverUrl(row)"
              :src="coverUrl(row)"
              class="h-12 w-20 rounded-lg object-cover"
              :alt="row.title"
            ><span v-else>-</span>
      </template>
      <template #cell-status="{ row }">
            <span :class="badgeClass(row.status)">{{ row.status }}</span>
      </template>
      <template #cell-publishedAt="{ row }">{{ formatDateTime(row.publishedAt) }}</template>
      <template #cell-createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      <template #cell-actions="{ row }">
        <div class="space-x-3">
            <UiButton
              variant="ghost"
              @click="openEdit(row.id)"
            >
              Edit
            </UiButton><UiButton
              variant="danger"
              @click="deleting = row"
            >
              Delete
            </UiButton>
        </div>
      </template>
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { UiButton, UiTable } from '@/components/ui'
import { blogApi } from '@/modules/content/blog/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatDateTime } from '@/modules/shared/types'
import type { Blog } from '@/modules/content/blog/types'

const router = useRouter()
const rows = ref<Blog[]>([])
const loading = ref(false)
const error = ref('')
const notice = ref('')
const deleting = ref<Blog | null>(null)
const query = reactive({ keyword: '', status: '', page: 1, limit: 50 })
const columns = [
  { key: 'title', label: 'Title' },
  { key: 'cover', label: 'Cover' },
  { key: 'slug', label: 'Slug' },
  { key: 'status', label: 'Status' },
  { key: 'publishedAt', label: 'Published' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

function badgeClass(status: string) {
  if (status === 'ACTIVE') return 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
  if (status === 'DRAFT') return 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700'
  return 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}
function coverUrl(row: Blog) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}
function openCreate() {
  void router.push({ name: 'admin-blog-create' })
}
function openEdit(id: string) {
  void router.push({ name: 'admin-blog-edit', params: { id } })
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (await blogApi.adminList(query)).items
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  try {
    await blogApi.remove(deleting.value.id)
    notice.value = 'Xóa blog thành công.'
    deleting.value = null
    await load()
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}

onMounted(load)
</script>
