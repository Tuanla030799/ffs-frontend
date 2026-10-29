<template>
  <CrudShell
    title="Trang nội dung"
    description="Nội dung trang Giới thiệu và phần Cách mua hàng & vận chuyển trên trang sản phẩm."
    create-label=""
    :searchable="false"
    :status-filter="false"
    :loading="loading"
    :error="error"
    @reload="load"
  >
    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      density="sm"
      striped
      row-key="key"
      min-width="min-w-[760px]"
      empty-text="Không có trang nội dung."
    >
      <template #cell-title="{ row }">
        <span class="font-black text-slate-950">{{ row.title }}</span>
        <div class="text-xs font-normal text-slate-500">{{ row.key }}</div>
      </template>
      <template #cell-placement="{ row }">
        <span class="text-sm text-slate-600">{{ sitePageMeta(row.key)?.placement || '-' }}</span>
      </template>
      <template #cell-updatedAt="{ row }">
        <span v-if="row.updatedAt">{{ formatLocalDateTime(row.updatedAt) }}</span>
        <span v-else class="text-xs font-bold text-amber-700">Chưa có nội dung</span>
      </template>
      <template #cell-actions="{ row }">
        <UiButton
          variant="ghost"
          :aria-label="`Sửa ${row.title}`"
          @click="router.push({ name: 'admin-page-edit', params: { key: row.key } })"
        >
          Sửa
        </UiButton>
      </template>
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRouter } from 'vue-router'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { UiButton, UiTable } from '@/components/ui'
import { formatLocalDateTime } from '@/lib/dateTime'
import { sitePageApi } from '@/modules/content/page/api'
import { sitePageMeta } from '@/modules/content/page/helpers'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { SitePage } from '@/modules/content/page/types'

const router = useRouter()
const rows = ref<SitePage[]>([])
const loading = ref(false)
const error = ref('')
const columns = [
  { key: 'title', label: 'Trang', cellAlign: 'left', width: '260px' },
  { key: 'placement', label: 'Hiển thị ở', cellAlign: 'left' },
  { key: 'updatedAt', label: 'Cập nhật', cellAlign: 'center', width: '180px' },
  { key: 'actions', label: 'Hành động', cellAlign: 'center', width: '120px' },
] as const

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = await sitePageApi.adminList()
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}

onMounted(load)
</script>
