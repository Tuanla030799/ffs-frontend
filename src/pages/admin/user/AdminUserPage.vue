<template>
  <CrudShell v-model:keyword="query.keyword" v-model:status="query.status" title="Quản lý admin users" description="Tài khoản quản trị, role và trạng thái truy cập." :loading="loading" :error="error" :show-modal="Boolean(editing)" :modal-title="editing === 'new' ? 'Tạo admin user' : 'Cập nhật admin user'" :confirm-open="Boolean(deleting)" :confirm-text="`Xóa admin user ${deleting?.email || ''}?`" @create="openCreate" @reload="load" @search="load" @close="editing = null" @cancel-delete="deleting = null" @confirm-delete="confirmRemove">
    <template #form>
      <form class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <input v-model="form.name" class="rounded-xl border border-slate-200 p-3" placeholder="Name" required>
        <input v-model="form.email" type="email" class="rounded-xl border border-slate-200 p-3" placeholder="Email" required>
        <input v-model="form.password" type="password" class="rounded-xl border border-slate-200 p-3" placeholder="Password optional">
        <select v-model="form.role" class="rounded-xl border border-slate-200 p-3"><option>ADMIN</option><option>STAFF</option></select>
        <select v-model="form.status" class="rounded-xl border border-slate-200 p-3"><option>ACTIVE</option><option>INACTIVE</option></select>
        <div class="flex justify-end gap-2 md:col-span-3"><button type="button" class="rounded-xl border border-slate-200 px-4 py-2 font-bold" @click="editing = null">Cancel</button><button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Save</button></div>
      </form>
    </template>
    <table class="w-full min-w-[760px] text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="p-3">Name</th><th>Email</th><th>Role</th><th>Status</th><th class="text-right">Actions</th></tr></thead>
      <tbody>
        <tr v-if="!rows.length" class="border-t"><td colspan="5" class="p-8 text-center text-slate-500">Không có admin user.</td></tr>
        <tr v-for="row in rows" :key="row.id" class="border-t"><td class="p-3 font-black">{{ row.name }}</td><td>{{ row.email }}</td><td>{{ row.role }}</td><td><span :class="badgeClass(row.status)">{{ row.status }}</span></td><td class="space-x-3 text-right"><button class="font-bold text-slate-700" @click="openEdit(row)">Edit</button><button class="font-bold text-red-600" @click="deleting = row">Delete</button></td></tr>
      </tbody>
    </table>
  </CrudShell>
</template>

<script setup lang="ts">
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
const form = reactive<AdminUserPayload>({ name: '', email: '', password: '', role: 'ADMIN', status: 'ACTIVE' })

function badgeClass(status: string) { return status === 'ACTIVE' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700' : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600' }
function fill(r?: AdminUser) { Object.assign(form, { name: r?.name || '', email: r?.email || '', password: '', role: r?.role || 'ADMIN', status: r?.status || 'ACTIVE' }) }
function openCreate() { editing.value = 'new'; fill() }
function openEdit(r: AdminUser) { editing.value = r; fill(r) }
async function load() { loading.value = true; error.value = ''; try { rows.value = (await adminUserApi.list({ keyword: query.keyword, status: query.status, limit: 50 })).items } catch (e) { error.value = getErrorMessage(e) } finally { loading.value = false } }
async function save() { const payload: AdminUserPayload = { ...form }; if (!payload.password) delete payload.password; try { if (editing.value === 'new') await adminUserApi.create(payload); else if (editing.value) await adminUserApi.update(editing.value.id, payload); editing.value = null; await load() } catch (e) { error.value = getErrorMessage(e) } }
async function confirmRemove() { if (!deleting.value) return; await adminUserApi.remove(deleting.value.id); deleting.value = null; await load() }
onMounted(load)
</script>
