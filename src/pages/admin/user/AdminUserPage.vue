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
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
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
      </UiForm>
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
        ><UiDropdown
          :items="actionItems"
          placement="right"
          @select="(key) => handleRowAction(key, row)"
        >
          <template #trigger>
            <UiButton variant="ghost">Thao tác</UiButton>
          </template>
        </UiDropdown></template
      >
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
import { UiButton, UiDropdown, UiForm, UiInput, UiPagination, UiSelect, UiTable } from '@/components/ui'
import { computed, onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { usePageQuery } from '@/composables/usePageQuery'
import { adminUserApi } from '@/modules/customer/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { AdminUser, AdminUserPayload } from '@/modules/customer/types'

const rows = ref<AdminUser[]>([])
const pageQuery = usePageQuery()
const loading = ref(false)
const error = ref('')
const editing = ref<AdminUser | 'new' | null>(null)
const deleting = ref<AdminUser | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<AdminUserPayload>({
  name: '',
  email: '',
  password: '',
  role: 'ADMIN',
  status: 'ACTIVE',
})
const columns = [
  { key: 'name', label: 'Name', cellAlign: 'left', width: '200px' },
  { key: 'email', label: 'Email', cellAlign: 'left', width: '240px' },
  { key: 'role', label: 'Role', cellAlign: 'center', width: '120px' },
  { key: 'status', label: 'Status', cellAlign: 'center', width: '130px' },
  { key: 'actions', label: 'Actions', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

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
function handleRowAction(key: string, row: AdminUser) {
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
    const data = await adminUserApi.list(query)
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
