<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý admin users"
    description="Tài khoản quản trị, role và trạng thái truy cập."
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo admin user' : 'Cập nhật admin user'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa admin user ${deleting?.email || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="load"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <form class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <UiInput v-model="form.name" placeholder="Name" required label="Name" />
        <UiInput v-model="form.email" type="email" placeholder="Email" required label="Email" />
        <UiInput
          v-model="form.password"
          type="password"
          placeholder="Password optional"
          label="Password optional"
        />
        <UiSelect v-model="form.role" label="Vai trò"
          ><option>ADMIN</option>
          <option>STAFF</option></UiSelect
        >
        <UiSelect v-model="form.status" label="Trạng thái"
          ><option>ACTIVE</option>
          <option>INACTIVE</option></UiSelect
        >
        <div class="flex justify-end gap-2 md:col-span-3">
          <UiButton native-type="button" variant="secondary" @click="editing = null"
            >Cancel</UiButton
          ><UiButton native-type="submit" variant="dark">Save</UiButton>
        </div>
      </form>
    </template>
    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      density="sm"
      sticky-header
      striped
      row-key="id"
      min-width="min-w-[760px]"
      empty-text="Không có admin user."
    >
      <template #cell-name="{ row }"
        ><span class="font-black text-slate-950">{{ row.name }}</span></template
      >
      <template #cell-status="{ row }"
        ><span :class="badgeClass(row.status)">{{ row.status }}</span></template
      >
      <template #cell-actions="{ row }"
        ><div class="space-x-3">
          <UiButton variant="ghost" @click="openEdit(row)">Edit</UiButton
          ><UiButton variant="danger" @click="deleting = row">Delete</UiButton>
        </div></template
      >
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { UiButton, UiInput, UiSelect, UiTable } from '@/components/ui'
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { adminUserApi } from '@/modules/customer/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { AdminUser, AdminUserPayload } from '@/modules/customer/types'

const rows = ref<AdminUser[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<AdminUser | 'new' | null>(null)
const deleting = ref<AdminUser | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<AdminUserPayload>({
  name: '',
  email: '',
  password: '',
  role: 'ADMIN',
  status: 'ACTIVE',
})
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

function badgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
    : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}
function fill(r?: AdminUser) {
  Object.assign(form, {
    name: r?.name || '',
    email: r?.email || '',
    password: '',
    role: r?.role || 'ADMIN',
    status: r?.status || 'ACTIVE',
  })
}
function openCreate() {
  editing.value = 'new'
  fill()
}
function openEdit(r: AdminUser) {
  editing.value = r
  fill(r)
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (
      await adminUserApi.list({ keyword: query.keyword, status: query.status, limit: 50 })
    ).items
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}
async function save() {
  const payload: AdminUserPayload = { ...form }
  if (!payload.password) delete payload.password
  try {
    if (editing.value === 'new') await adminUserApi.create(payload)
    else if (editing.value) await adminUserApi.update(editing.value.id, payload)
    editing.value = null
    await load()
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  await adminUserApi.remove(deleting.value.id)
  deleting.value = null
  await load()
}
onMounted(load)
</script>
