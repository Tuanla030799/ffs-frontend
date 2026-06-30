<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý sizes"
    description="Quản lý kích cỡ cho sản phẩm"
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo size' : 'Cập nhật size'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa size ${deleting?.value || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-2" @submit.prevent="save">
        <UiInput v-model="form.value" required placeholder="36" label="Size" />
        <UiInput v-model="form.label" placeholder="36" label="Label" />
        <UiSelect v-model="form.status" label="Trạng thái">
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </UiSelect>
        <UiInput v-model.number="form.sortOrder" placeholder="Sort" label="Thứ tự sắp xếp" />
        <div class="flex justify-end gap-2 md:col-span-2">
          <UiButton native-type="button" variant="secondary" @click="editing = null"
            >Cancel</UiButton
          >
          <UiButton native-type="submit">Save</UiButton>
        </div>
      </UiForm>
    </template>

    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      row-key="id"
      empty-text="Không có size."
    >
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
import CrudShell from '@/pages/admin/CrudShell.vue'
import { UiButton, UiDropdown, UiForm, UiInput, UiPagination, UiSelect, UiTable } from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { sizeApi } from '@/modules/catalog/size/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { masterDataApi } from '@/modules/shared/master-data/api'
import type { ProductSize, ProductSizePayload } from '@/modules/catalog/size/types'

const rows = ref<ProductSize[]>([])
const pageQuery = usePageQuery()
const loading = ref(false)
const error = ref('')
const editing = ref<ProductSize | 'new' | null>(null)
const deleting = ref<ProductSize | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<ProductSizePayload>({ value: '', label: '', status: 'ACTIVE', sortOrder: 0 })
const columns = [
  { key: 'value', label: 'Size', cellAlign: 'left', width: '140px' },
  { key: 'label', label: 'Label', cellAlign: 'left' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'sortOrder', label: 'Thứ tự sắp xếp', cellAlign: 'center', width: '150px' },
  { key: 'actions', label: 'Actions', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

function fill(row?: ProductSize) {
  form.value = row?.value || ''
  form.label = row?.label || row?.value || ''
  form.status = row?.status || 'ACTIVE'
  form.sortOrder = row?.sortOrder || 0
}
function openCreate() {
  editing.value = 'new'
  fill()
}
function openEdit(row: ProductSize) {
  editing.value = row
  fill(row)
}
function handleRowAction(key: string, row: ProductSize) {
  if (key === 'edit') {
    openEdit(row)
    return
  }
  if (key === 'delete') deleting.value = row
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await sizeApi.adminList(query)
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
async function refreshMasterData() {
  await masterDataApi.admin(true).catch(() => null)
}
async function save() {
  const msg = required(form.value, 'Value')
  if (msg) return (error.value = msg)
  try {
    const payload = { ...form, value: form.value.trim(), label: (form.label || form.value).trim() }
    if (editing.value === 'new') await sizeApi.create(payload)
    else if (editing.value) await sizeApi.update(editing.value.id, payload)
    editing.value = null
    await Promise.all([load(), refreshMasterData()])
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  await sizeApi.remove(deleting.value.id)
  deleting.value = null
  await Promise.all([load(), refreshMasterData()])
}
onMounted(load)
</script>
