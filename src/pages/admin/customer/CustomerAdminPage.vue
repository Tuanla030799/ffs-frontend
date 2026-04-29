<template>
  <CrudShell v-model:keyword="query.keyword" v-model:status="query.status" title="Quản lý customer" description="Hồ sơ khách hàng dùng cho order và chăm sóc sau bán." :loading="loading" :error="error" :show-modal="Boolean(editing)" :modal-title="editing === 'new' ? 'Tạo customer' : 'Cập nhật customer'" :confirm-open="Boolean(deleting)" :confirm-text="`Xóa customer ${deleting?.fullName || ''}?`" @create="openCreate" @reload="load" @search="load" @close="editing = null" @cancel-delete="deleting = null" @confirm-delete="confirmRemove">
    <template #form>
      <form class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <input v-model="form.fullName" class="rounded-xl border border-slate-200 p-3" placeholder="Full name" required>
        <input v-model="form.email" type="email" class="rounded-xl border border-slate-200 p-3" placeholder="Email">
        <input v-model="form.phone" class="rounded-xl border border-slate-200 p-3" placeholder="Phone">
        <select v-model="form.status" class="rounded-xl border border-slate-200 p-3"><option>ACTIVE</option><option>INACTIVE</option></select>
        <div class="flex justify-end gap-2 md:col-span-3"><button type="button" class="rounded-xl border border-slate-200 px-4 py-2 font-bold" @click="editing = null">Cancel</button><button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Save</button></div>
      </form>
    </template>
    <table class="w-full min-w-[760px] text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="p-3">Name</th><th>Email</th><th>Phone</th><th>Status</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
      <tbody>
        <tr v-if="!rows.length" class="border-t"><td colspan="6" class="p-8 text-center text-slate-500">Không có customer.</td></tr>
        <tr v-for="row in rows" :key="row.id" class="border-t"><td class="p-3 font-black">{{ row.fullName }}</td><td>{{ row.email || '-' }}</td><td>{{ row.phone || '-' }}</td><td><span :class="badgeClass(row.status)">{{ row.status }}</span></td><td>{{ row.createdAt || '-' }}</td><td class="space-x-3 text-right"><button class="font-bold text-slate-700" @click="openEdit(row)">Edit</button><button class="font-bold text-red-600" @click="deleting = row">Delete</button></td></tr>
      </tbody>
    </table>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { customerApi } from '@/modules/customer/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { Customer, CustomerPayload } from '@/modules/customer/types'

const rows = ref<Customer[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<Customer | 'new' | null>(null)
const deleting = ref<Customer | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<CustomerPayload>({ fullName: '', email: '', phone: '', status: 'ACTIVE' })

function badgeClass(status: string) { return status === 'ACTIVE' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700' : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600' }
function fill(r?: Customer) { Object.assign(form, { fullName: r?.fullName || '', email: r?.email || '', phone: r?.phone || '', status: r?.status || 'ACTIVE' }) }
function openCreate() { editing.value = 'new'; fill() }
function openEdit(r: Customer) { editing.value = r; fill(r) }
async function load() { loading.value = true; error.value = ''; try { rows.value = (await customerApi.list({ keyword: query.keyword, status: query.status, limit: 50 })).items } catch (e) { error.value = getErrorMessage(e) } finally { loading.value = false } }
async function save() { try { if (editing.value === 'new') await customerApi.create(form); else if (editing.value) await customerApi.update(editing.value.id, form); editing.value = null; await load() } catch (e) { error.value = getErrorMessage(e) } }
async function confirmRemove() { if (!deleting.value) return; await customerApi.remove(deleting.value.id); deleting.value = null; await load() }
onMounted(load)
</script>
