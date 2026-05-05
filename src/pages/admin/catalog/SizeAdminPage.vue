<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý sizes"
    description="Master data size cho SKU."
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo size' : 'Cập nhật size'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa size ${deleting?.value || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="load"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-2" @submit.prevent="save">
        <UiInput v-model="form.value" required placeholder="36" label="Value" />
        <UiInput v-model="form.label" placeholder="36" label="Label" />
        <UiSelect v-model="form.status" label="Trạng thái">
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </UiSelect>
        <UiInput v-model.number="form.sortOrder" placeholder="Sort" label="Sort" />
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
        <div class="space-x-3">
          <UiButton variant="ghost" @click="openEdit(row)">Edit</UiButton>
          <UiButton variant="danger" @click="deleting = row">Delete</UiButton>
        </div>
      </template>
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { UiButton, UiForm, UiInput, UiSelect, UiTable } from '@/components/ui'
import { sizeApi } from '@/modules/catalog/size/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { masterDataApi } from '@/modules/shared/master-data/api'
import type { ProductSize, ProductSizePayload } from '@/modules/catalog/size/types'

const rows = ref<ProductSize[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<ProductSize | 'new' | null>(null)
const deleting = ref<ProductSize | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<ProductSizePayload>({ value: '', label: '', status: 'ACTIVE', sortOrder: 0 })
const columns = [
  { key: 'value', label: 'Value' },
  { key: 'label', label: 'Label' },
  { key: 'status', label: 'Status' },
  { key: 'sortOrder', label: 'Sort' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

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
async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (await sizeApi.adminList(query)).items
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
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
