<template>
  <CrudShell v-model:keyword="query.keyword" v-model:status="query.status" title="Quản lý coupon" description="Mã giảm giá percent/fixed, giới hạn thời gian và usage." :loading="loading" :error="error" :show-modal="Boolean(editing)" :modal-title="editing === 'new' ? 'Tạo coupon' : 'Cập nhật coupon'" :confirm-open="Boolean(deleting)" :confirm-text="`Xóa coupon ${deleting?.code || ''}?`" @create="openCreate" @reload="load" @search="load" @close="editing = null" @cancel-delete="deleting = null" @confirm-delete="confirmRemove">
    <template #form>
      <form class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <input v-model="form.code" class="rounded-xl border border-slate-200 p-3" placeholder="Code" required>
        <input v-model="form.name" class="rounded-xl border border-slate-200 p-3" placeholder="Name" required>
        <select v-model="form.discountType" class="rounded-xl border border-slate-200 p-3"><option>PERCENT</option><option>FIXED</option></select>
        <input v-model.number="form.discountValue" class="rounded-xl border border-slate-200 p-3" placeholder="Discount value">
        <input v-model.number="form.maxDiscount" class="rounded-xl border border-slate-200 p-3" placeholder="Max discount">
        <input v-model.number="form.minOrderAmount" class="rounded-xl border border-slate-200 p-3" placeholder="Min order">
        <input v-model.number="form.usageLimit" class="rounded-xl border border-slate-200 p-3" placeholder="Usage limit">
        <input v-model="form.startsAt" type="datetime-local" class="rounded-xl border border-slate-200 p-3">
        <input v-model="form.endsAt" type="datetime-local" class="rounded-xl border border-slate-200 p-3">
        <select v-model="form.status" class="rounded-xl border border-slate-200 p-3"><option>ACTIVE</option><option>INACTIVE</option></select>
        <div class="flex justify-end gap-2 md:col-span-3"><button type="button" class="rounded-xl border border-slate-200 px-4 py-2 font-bold" @click="editing = null">Cancel</button><button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Save</button></div>
      </form>
    </template>
    <table class="w-full min-w-[880px] text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="p-3">Code</th><th>Name</th><th>Type</th><th>Value</th><th>Min order</th><th>Status</th><th class="text-right">Actions</th></tr></thead>
      <tbody>
        <tr v-if="!rows.length" class="border-t"><td colspan="7" class="p-8 text-center text-slate-500">Không có coupon.</td></tr>
        <tr v-for="row in rows" :key="row.id" class="border-t"><td class="p-3 font-black">{{ row.code }}</td><td>{{ row.name }}</td><td>{{ row.discountType }}</td><td>{{ row.discountValue }}</td><td>{{ money(row.minOrderAmount) }}</td><td><span :class="badgeClass(row.status)">{{ row.status }}</span></td><td class="space-x-3 text-right"><button class="font-bold text-slate-700" @click="openEdit(row)">Edit</button><button class="font-bold text-red-600" @click="deleting = row">Delete</button></td></tr>
      </tbody>
    </table>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { couponApi } from '@/modules/promotion/coupon/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { money } from '@/modules/shared/types'
import type { Coupon, CouponPayload } from '@/modules/promotion/coupon/types'

const rows = ref<Coupon[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<Coupon | 'new' | null>(null)
const deleting = ref<Coupon | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<CouponPayload>({ code: '', name: '', discountType: 'PERCENT', discountValue: 0, maxDiscount: 0, minOrderAmount: 0, usageLimit: 0, startsAt: '', endsAt: '', status: 'ACTIVE' })

function badgeClass(status: string) { return status === 'ACTIVE' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700' : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600' }
function fill(r?: Coupon) { Object.assign(form, { code: r?.code || '', name: r?.name || '', discountType: r?.discountType || 'PERCENT', discountValue: r?.discountValue || 0, maxDiscount: r?.maxDiscount || 0, minOrderAmount: r?.minOrderAmount || 0, usageLimit: r?.usageLimit || 0, startsAt: r?.startsAt || '', endsAt: r?.endsAt || '', status: r?.status || 'ACTIVE' }) }
function openCreate() { editing.value = 'new'; fill() }
function openEdit(r: Coupon) { editing.value = r; fill(r) }
async function load() { loading.value = true; error.value = ''; try { rows.value = (await couponApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })).items } catch (e) { error.value = getErrorMessage(e) } finally { loading.value = false } }
async function save() { try { if (editing.value === 'new') await couponApi.create(form); else if (editing.value) await couponApi.update(editing.value.id, form); editing.value = null; await load() } catch (e) { error.value = getErrorMessage(e) } }
async function confirmRemove() { if (!deleting.value) return; await couponApi.remove(deleting.value.id); deleting.value = null; await load() }
onMounted(load)
</script>
