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
    @search="search"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <p v-if="notice" class="m-3 rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
      {{ notice }}
    </p>
    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      density="sm"
      sticky-header
      striped
      row-key="id"
      min-width="min-w-[920px]"
      empty-text="Không có blog."
    >
      <template #cell-title="{ row }">
        <span class="font-black text-slate-950">{{ row.title }}</span>
      </template>
      <template #cell-cover="{ row }">
        <img
          v-if="coverUrl(row)"
          :src="coverUrl(row)"
          class="h-12 w-20 rounded-lg object-cover"
          :alt="row.title"
        /><span v-else>-</span>
      </template>
      <template #cell-status="{ row }">
        <span :class="badgeClass(row.status)">{{ row.status }}</span>
      </template>
      <template #cell-publishedAt="{ row }">{{ formatLocalDateTime(row.publishedAt) }}</template>
      <template #cell-createdAt="{ row }">{{ formatLocalDateTime(row.createdAt) }}</template>
      <template #cell-actions="{ row }">
        <UiDropdown
          :items="actionItems"
          placement="right"
          @select="(key) => handleRowAction(key, row)"
        >
          <template #trigger>
            <UiButton variant="ghost">Thao tác</UiButton>
          </template>
        </UiDropdown>
      </template>
    </UiTable>

    <UiPagination
      v-if="total > 0"
      :page="page"
      :total="total"
      :total-pages="totalPages"
      :page-size="Number(query.limit || 20)"
      @update:page="changePage"
    />
  </CrudShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { UiButton, UiDropdown, UiPagination, UiTable } from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { blogApi } from '@/modules/content/blog/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatLocalDateTime } from '@/lib/dateTime'
import type { Blog } from '@/modules/content/blog/types'

const router = useRouter()
const pageQuery = usePageQuery()
const rows = ref<Blog[]>([])
const loading = ref(false)
const error = ref('')
const notice = ref('')
const deleting = ref<Blog | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const columns = [
  { key: 'title', label: 'Tiêu đề', cellAlign: 'left', width: '240px' },
  { key: 'cover', label: 'Ảnh bìa', cellAlign: 'center', width: '130px' },
  { key: 'slug', label: 'Slug', cellAlign: 'left', width: '180px' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'publishedAt', label: 'Đã xuất bản', cellAlign: 'center', width: '180px' },
  { key: 'createdAt', label: 'Ngày tạo', cellAlign: 'center', width: '180px' },
  { key: 'actions', label: 'Actions', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

function badgeClass(status: string) {
  if (status === 'ACTIVE')
    return 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
  if (status === 'DRAFT')
    return 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700'
  return 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}
function coverUrl(row: Blog) {
  return resolveFileUrl(row.coverImageUrl || '')
}
function openCreate() {
  void router.push({ name: 'admin-blog-create' })
}
function openEdit(id: string) {
  void router.push({ name: 'admin-blog-edit', params: { id } })
}
function handleRowAction(key: string, row: Blog) {
  if (key === 'edit') {
    openEdit(row.id)
    return
  }
  if (key === 'delete') deleting.value = row
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await blogApi.adminList(query)
    rows.value = data.items
    total.value = data.total
    totalPages.value = data.totalPages
    query.page = data.page || query.page
    query.limit = data.limit || query.limit
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}
function search() {
  query.page = 1
  void pageQuery.replace(query.page)
  void load()
}
function changePage(nextPage: number) {
  if (loading.value || nextPage === page.value) return
  query.page = nextPage
  void pageQuery.replace(query.page)
  void load()
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
