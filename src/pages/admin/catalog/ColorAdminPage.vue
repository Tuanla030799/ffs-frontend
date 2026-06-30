<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý colors"
    description="Quản lý màu sắc cho sản phẩm"
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo color' : 'Cập nhật color'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa color ${deleting?.name || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-2" @submit.prevent="save">
        <UiInput v-model="form.name" required placeholder="black" label="Name" />
        <div class="grid grid-cols-[64px_minmax(0,1fr)] gap-2">
          <UiInput v-model="colorPickerValue" type="color" label="Màu" />
          <UiInput v-model="form.colorCode" placeholder="#000000" label="Color code" />
        </div>
        <UiSelect v-model="form.status" label="Trạng thái">
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </UiSelect>
        <UiInput v-model.number="form.sortOrder" placeholder="Sort" label="Sắp xếp" />
        <div class="flex justify-end gap-2 md:col-span-2">
          <UiButton native-type="button" variant="secondary" @click="editing = null">Hủy</UiButton>
          <UiButton native-type="submit">Lưu</UiButton>
        </div>
      </UiForm>
    </template>

    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      row-key="id"
      empty-text="Không có color."
    >
      <template #cell-swatch="{ row }">
        <span
          class="inline-block h-5 w-5 rounded-full border border-slate-200"
          :style="{ backgroundColor: row.colorCode || '#fff' }"
        />
      </template>
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
import { colorApi } from '@/modules/catalog/color/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { masterDataApi } from '@/modules/shared/master-data/api'
import type { ProductColor, ProductColorPayload } from '@/modules/catalog/color/types'

const rows = ref<ProductColor[]>([])
const pageQuery = usePageQuery()
const loading = ref(false)
const error = ref('')
const editing = ref<ProductColor | 'new' | null>(null)
const deleting = ref<ProductColor | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<ProductColorPayload>({
  name: '',
  colorCode: '#000000',
  status: 'ACTIVE',
  sortOrder: 0,
})
const colorPickerValue = computed({
  get: () =>
    /^#[0-9a-f]{6}$/i.test(form.colorCode || '') ? form.colorCode || '#000000' : '#000000',
  set: (value) => (form.colorCode = value),
})
const columns = [
  { key: 'swatch', label: 'Màu', cellAlign: 'center', width: '90px' },
  { key: 'value', label: 'Tên', cellAlign: 'left' },
  { key: 'colorCode', label: 'Mã màu', cellAlign: 'center', width: '140px' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'sortOrder', label: 'Sắp xếp', cellAlign: 'center', width: '120px' },
  { key: 'actions', label: 'Hành động', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

function fill(row?: ProductColor) {
  form.name = row?.name || row?.label || row?.value || ''
  form.colorCode = row?.colorCode || '#000000'
  form.status = row?.status || 'ACTIVE'
  form.sortOrder = row?.sortOrder || 0
}
function openCreate() {
  editing.value = 'new'
  fill()
}
function openEdit(row: ProductColor) {
  editing.value = row
  fill(row)
}
function handleRowAction(key: string, row: ProductColor) {
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
    const data = await colorApi.adminList(query)
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
  const msg = required(form.name, 'Name')
  if (msg) return (error.value = msg)
  try {
    const payload = { ...form, name: form.name.trim(), colorCode: form.colorCode?.trim() || null }
    if (editing.value === 'new') await colorApi.create(payload)
    else if (editing.value) await colorApi.update(editing.value.id, payload)
    editing.value = null
    await Promise.all([load(), refreshMasterData()])
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  await colorApi.remove(deleting.value.id)
  deleting.value = null
  await Promise.all([load(), refreshMasterData()])
}
onMounted(load)
</script>
