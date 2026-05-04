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
          <UiSelect v-model="statusForm.status" label="Trạng thái"><option>PENDING</option><option>CONFIRMED</option><option>SHIPPING</option><option>COMPLETED</option><option>CANCELLED</option></UiSelect>
          <UiInput v-model="statusForm.note" placeholder="Status note"  label="Status note"/>
          <UiButton variant="dark" @click="saveStatus(detail.id)">Update status</UiButton>
          <UiInput v-model="payment.paymentMethod" placeholder="paymentMethod"  label="Phương thức thanh toán"/>
          <UiInput v-model="payment.paymentStatus" placeholder="paymentStatus"  label="Trạng thái thanh toán"/>
          <UiButton variant="dark" @click="savePayment(detail.id)">Update payment</UiButton>
          <UiInput v-model="shipping.shippingMethod" placeholder="shippingMethod"  label="Phương thức vận chuyển"/>
          <UiInput v-model="shipping.shippingStatus" placeholder="shippingStatus"  label="Trạng thái vận chuyển"/>
          <UiInput v-model="shipping.trackingCode" placeholder="trackingCode"  label="Mã vận đơn"/>
          <div class="md:col-span-3">
            <UiButton block variant="dark" @click="saveShipping(detail.id)">Update shipping</UiButton>
          </div>
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
          <div v-for="h in history" :key="h.id" class="border-b border-slate-100 p-3 text-sm last:border-b-0">{{ formatDateTime(h.createdAt) }} - <b>{{ h.status }}</b> {{ h.note }}</div>
        </div>
      </div>
    </template>

    <UiTable :columns="columns" :rows="rows" :loading="loading" density="sm" sticky-header striped row-key="id" min-width="min-w-[960px]" empty-text="Không có order.">
      <template #cell-code="{ row }"><span class="font-black text-slate-950">{{ row.code || row.id }}</span></template>
      <template #cell-customer="{ row }">{{ row.customerName }}<br><span class="text-slate-400">{{ row.customerPhone }}</span></template>
      <template #cell-status="{ row }"><span :class="badgeClass(row.status)">{{ row.status }}</span></template>
      <template #cell-payment="{ row }">{{ row.paymentMethod }} / {{ row.paymentStatus }}</template>
      <template #cell-shipping="{ row }">{{ row.shippingMethod }} / {{ row.shippingStatus }}</template>
      <template #cell-totalAmount="{ row }">{{ money(row.totalAmount) }}</template>
      <template #cell-createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
      <template #cell-actions="{ row }"><UiButton variant="ghost" @click="open(row.id)">Detail</UiButton></template>
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { UiButton, UiInput, UiSelect, UiTable } from '@/components/ui'
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { orderApi } from '@/modules/sales/order/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { money, formatDateTime } from '@/modules/shared/types'
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
const columns = [
  { key: 'code', label: 'Code' },
  { key: 'customer', label: 'Customer' },
  { key: 'status', label: 'Status' },
  { key: 'payment', label: 'Payment' },
  { key: 'shipping', label: 'Shipping' },
  { key: 'totalAmount', label: 'Total' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

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
