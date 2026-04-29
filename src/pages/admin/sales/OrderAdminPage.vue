<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý order"
    description="Theo dõi đơn hàng, cập nhật trạng thái, thanh toán và vận chuyển."
    :loading="loading"
    :error="error"
    :create-label="''"
    :status-options="['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED']"
    :show-modal="Boolean(detail)"
    :modal-title="detail ? `Order ${detail.code || detail.id}` : ''"
    modal-description="Chi tiết order, status history và thao tác fulfillment."
    @reload="load"
    @search="load"
    @close="detail = null"
  >
    <template #form>
      <div v-if="detail" class="space-y-5">
        <div class="grid gap-4 rounded-2xl border border-slate-200 p-4 md:grid-cols-3">
          <div><p class="text-xs font-bold uppercase text-slate-400">Customer</p><p class="font-black">{{ detail.customerName }}</p><p class="text-sm text-slate-500">{{ detail.customerPhone }}</p></div>
          <div><p class="text-xs font-bold uppercase text-slate-400">Address</p><p class="text-sm text-slate-700">{{ detail.shippingAddress }}</p></div>
          <div><p class="text-xs font-bold uppercase text-slate-400">Total</p><p class="font-black text-rose-600">{{ money(detail.totalAmount) }}</p></div>
        </div>
        <div class="grid gap-3 md:grid-cols-3">
          <select v-model="statusForm.status" class="rounded-xl border border-slate-200 p-3"><option>PENDING</option><option>CONFIRMED</option><option>SHIPPING</option><option>COMPLETED</option><option>CANCELLED</option></select>
          <input v-model="statusForm.note" class="rounded-xl border border-slate-200 p-3" placeholder="Status note">
          <button class="rounded-xl bg-slate-950 px-4 py-3 font-bold text-white" @click="saveStatus(detail.id)">Update status</button>
          <input v-model="payment.paymentMethod" class="rounded-xl border border-slate-200 p-3" placeholder="paymentMethod">
          <input v-model="payment.paymentStatus" class="rounded-xl border border-slate-200 p-3" placeholder="paymentStatus">
          <button class="rounded-xl bg-slate-950 px-4 py-3 font-bold text-white" @click="savePayment(detail.id)">Update payment</button>
          <input v-model="shipping.shippingMethod" class="rounded-xl border border-slate-200 p-3" placeholder="shippingMethod">
          <input v-model="shipping.shippingStatus" class="rounded-xl border border-slate-200 p-3" placeholder="shippingStatus">
          <input v-model="shipping.trackingCode" class="rounded-xl border border-slate-200 p-3" placeholder="trackingCode">
          <button class="rounded-xl bg-slate-950 py-3 font-bold text-white md:col-span-3" @click="saveShipping(detail.id)">Update shipping</button>
        </div>
        <div class="rounded-2xl border border-slate-200">
          <h4 class="border-b border-slate-200 p-3 font-black">Items</h4>
          <div v-for="item in detail.items || []" :key="item.id || item.skuCode" class="grid grid-cols-[1fr_auto] gap-3 border-b border-slate-100 p-3 text-sm last:border-b-0">
            <div><b>{{ item.productName || item.skuCode }}</b><p class="text-slate-500">Size {{ item.size || '-' }} / {{ item.color || '-' }}</p></div>
            <div class="text-right">{{ item.quantity }} x {{ money(item.price) }}</div>
          </div>
        </div>
        <div class="rounded-2xl border border-slate-200">
          <h4 class="border-b border-slate-200 p-3 font-black">Status history</h4>
          <div v-if="!history.length" class="p-4 text-sm text-slate-500">Chưa có history.</div>
          <div v-for="h in history" :key="h.id" class="border-b border-slate-100 p-3 text-sm last:border-b-0">{{ h.createdAt }} - <b>{{ h.status }}</b> {{ h.note }}</div>
        </div>
      </div>
    </template>

    <table class="w-full min-w-[960px] text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="p-3">Code</th><th>Customer</th><th>Status</th><th>Payment</th><th>Shipping</th><th>Total</th><th>Created</th><th class="text-right">Actions</th></tr></thead>
      <tbody>
        <tr v-if="!rows.length" class="border-t"><td colspan="8" class="p-8 text-center text-slate-500">Không có order.</td></tr>
        <tr v-for="row in rows" :key="row.id" class="border-t"><td class="p-3 font-black">{{ row.code || row.id }}</td><td>{{ row.customerName }}<br><span class="text-slate-400">{{ row.customerPhone }}</span></td><td><span :class="badgeClass(row.status)">{{ row.status }}</span></td><td>{{ row.paymentMethod }} / {{ row.paymentStatus }}</td><td>{{ row.shippingMethod }} / {{ row.shippingStatus }}</td><td>{{ money(row.totalAmount) }}</td><td>{{ row.createdAt || '-' }}</td><td class="text-right"><button class="font-bold text-slate-700" @click="open(row.id)">Detail</button></td></tr>
      </tbody>
    </table>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { orderApi } from '@/modules/sales/order/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { money } from '@/modules/shared/types'
import type { Order, OrderStatusHistory } from '@/modules/sales/order/types'

const rows = ref<Order[]>([])
const detail = ref<Order | null>(null)
const history = ref<OrderStatusHistory[]>([])
const loading = ref(false)
const error = ref('')
const query = reactive({ keyword: '', status: '' })
const statusForm = reactive({ status: 'CONFIRMED', note: 'Updated by admin' })
const payment = reactive({ paymentMethod: 'COD', paymentStatus: 'PAID', paidAt: new Date().toISOString() })
const shipping = reactive({ shippingMethod: 'GHN', shippingStatus: 'SHIPPING', trackingCode: '' })

function badgeClass(status: string) {
  if (['CONFIRMED', 'COMPLETED'].includes(status)) return 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
  if (status === 'CANCELLED') return 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700'
  return 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700'
}

async function load() { loading.value = true; error.value = ''; try { rows.value = (await orderApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })).items } catch (err) { error.value = getErrorMessage(err) } finally { loading.value = false } }
async function open(id: string) { detail.value = await orderApi.detail(id); statusForm.status = detail.value.status; payment.paymentMethod = detail.value.paymentMethod || 'COD'; payment.paymentStatus = detail.value.paymentStatus || 'PAID'; shipping.shippingMethod = detail.value.shippingMethod || 'GHN'; shipping.shippingStatus = detail.value.shippingStatus || 'SHIPPING'; shipping.trackingCode = detail.value.trackingCode || ''; history.value = await orderApi.history(id).catch(() => []) }
async function saveStatus(id: string) { await orderApi.updateStatus(id, statusForm); await open(id); await load() }
async function savePayment(id: string) { await orderApi.updatePayment(id, payment); await open(id); await load() }
async function saveShipping(id: string) { await orderApi.updateShipping(id, shipping); await open(id); await load() }
onMounted(load)
</script>
