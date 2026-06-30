<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý order"
    description="Theo dõi đơn hàng, cập nhật trạng thái, thanh toán và vận chuyển."
    :loading="loading"
    :error="error"
    :create-label="''"
    :status-options="[...ORDER_STATUSES]"
    :show-modal="Boolean(detail)"
    :modal-title="detail ? `Order ${orderCode(detail.order)}` : ''"
    modal-description="Chi tiết order, sản phẩm, thanh toán, vận chuyển và lịch sử trạng thái."
    @reload="load"
    @search="search"
    @close="closeDetail"
  >
    <template #form>
      <div v-if="detail" class="space-y-5">
        <section
          class="flex flex-wrap items-start justify-between gap-3 rounded-2xl border border-slate-200 bg-slate-50 p-4"
        >
          <div class="min-w-0">
            <div class="flex flex-wrap items-center gap-2">
              <h3 class="truncate text-xl font-black text-slate-950">
                {{ orderCode(detail.order) }}
              </h3>
              <span :class="badgeClass(detail.order.status)">
                {{ detail.order.status }}
              </span>
            </div>
            <p class="mt-1 text-sm text-slate-500">
              Tạo lúc {{ formatLocalDateTime(detail.order.createdAt) }}
            </p>
          </div>
          <UiButton native-type="button" variant="secondary" size="sm" @click="closeDetail">
            Quay lại danh sách
          </UiButton>
        </section>

        <div class="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <OrderSectionCard title="Thông tin khách hàng">
            <div class="grid gap-4 sm:grid-cols-2">
              <OrderInfoRow label="Tên khách" :value="detail.order.customerName" />
              <OrderInfoRow label="Số điện thoại" :value="detail.order.customerPhone" />
              <OrderInfoRow label="Email" :value="detail.order.customerEmail" />
              <OrderInfoRow label="Customer ID" :value="detail.order.customerId || ''" />
            </div>
          </OrderSectionCard>

          <OrderSectionCard title="Địa chỉ giao hàng">
            <p class="text-sm leading-6 whitespace-pre-line text-slate-700">
              {{ detail.order.shippingAddress || '-' }}
            </p>
          </OrderSectionCard>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <OrderSectionCard title="Ghi chú khách">
            <p class="min-h-12 text-sm leading-6 whitespace-pre-line text-slate-700">
              {{ detail.order.note || '-' }}
            </p>
          </OrderSectionCard>

          <OrderSectionCard title="Ghi chú nội bộ">
            <p class="min-h-12 text-sm leading-6 whitespace-pre-line text-slate-700">
              {{ detail.order.internalNote || '-' }}
            </p>
          </OrderSectionCard>
        </div>

        <OrderSectionCard title="Danh sách sản phẩm">
          <div class="overflow-x-auto">
            <table class="w-full min-w-[860px] text-left text-sm">
              <thead class="bg-slate-50 text-xs font-black text-slate-500 uppercase">
                <tr>
                  <th class="px-4 py-3">Sản phẩm</th>
                  <th class="px-4 py-3">SKU</th>
                  <th class="px-4 py-3">Phiên bản</th>
                  <th class="px-4 py-3">Size</th>
                  <th class="px-4 py-3 text-right">Đơn giá</th>
                  <th class="px-4 py-3 text-right">SL</th>
                  <th class="px-4 py-3 text-right">Thành tiền</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-100">
                <tr v-if="!detail.items.length">
                  <td colspan="7" class="px-4 py-5 text-center text-slate-500">
                    Không có sản phẩm trong đơn.
                  </td>
                </tr>
                <tr v-for="item in detail.items" :key="item.id || item.skuId || item.skuCode">
                  <td class="px-4 py-3 font-semibold text-slate-950">
                    {{ item.productName || '-' }}
                  </td>
                  <td class="px-4 py-3 text-slate-600">
                    {{ item.skuCode || '-' }}
                  </td>
                  <td class="px-4 py-3 text-slate-600">
                    {{ item.variantName || '-' }}
                  </td>
                  <td class="px-4 py-3 text-slate-600">
                    {{ item.size || '-' }}
                  </td>
                  <td class="px-4 py-3 text-right text-slate-700">
                    {{ money(item.unitPrice ?? item.price) }}
                  </td>
                  <td class="px-4 py-3 text-right font-semibold text-slate-950">
                    {{ item.quantity }}
                  </td>
                  <td class="px-4 py-3 text-right font-black text-slate-950">
                    {{ money(item.lineTotal ?? item.subtotal) }}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </OrderSectionCard>

        <div class="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
          <OrderSectionCard title="Tổng tiền">
            <div class="space-y-3 text-sm">
              <OrderMoneyRow label="Tạm tính" :value="detail.order.subtotalAmount" />
              <OrderMoneyRow label="Giảm giá" :value="detail.order.discountAmount" muted />
              <OrderMoneyRow label="Phí vận chuyển" :value="detail.order.shippingFee" />
              <div class="border-t border-slate-200 pt-3">
                <OrderMoneyRow label="Tổng cộng" :value="detail.order.totalAmount" strong />
              </div>
            </div>
          </OrderSectionCard>

          <OrderSectionCard title="Cập nhật trạng thái đơn">
            <div class="grid gap-3">
              <UiSelect v-model="statusForm.status" label="Trạng thái" :options="orderOptions" />
              <UiTextarea
                v-model="statusForm.note"
                label="Ghi chú"
                rows="3"
                placeholder="Ví dụ: Đã xác nhận đơn"
              />
              <UiButton
                class="justify-self-start"
                variant="dark"
                :loading="savingStatus"
                @click="saveStatus(detail.order.id)"
              >
                Update Status
              </UiButton>
            </div>
          </OrderSectionCard>
        </div>

        <div class="grid gap-4 lg:grid-cols-2">
          <OrderSectionCard title="Thanh toán">
            <div class="grid gap-3">
              <UiInput
                v-model="paymentForm.paymentMethod"
                label="Phương thức thanh toán"
                placeholder="COD, BANK_TRANSFER..."
              />
              <UiSelect
                v-model="paymentForm.paymentStatus"
                label="Trạng thái thanh toán"
                :options="paymentOptions"
              />
              <UiInput v-model="paymentForm.paidAt" type="datetime-local" label="Paid at" />
              <div class="flex items-center justify-between gap-3">
                <span class="text-xs text-slate-500">
                  {{
                    detail.order.paidAt
                      ? formatLocalDateTime(detail.order.paidAt)
                      : 'Chưa thanh toán'
                  }}
                </span>
                <UiButton
                  variant="dark"
                  :loading="savingPayment"
                  @click="savePayment(detail.order.id)"
                >
                  Save Payment
                </UiButton>
              </div>
            </div>
          </OrderSectionCard>

          <OrderSectionCard title="Vận chuyển">
            <div class="grid gap-3">
              <UiInput
                v-model="shippingForm.shippingMethod"
                label="Phương thức vận chuyển"
                placeholder="GHN, GHTK..."
              />
              <UiSelect
                v-model="shippingForm.shippingStatus"
                label="Trạng thái vận chuyển"
                :options="shippingOptions"
              />
              <UiInput
                v-model="shippingForm.trackingCode"
                label="Mã vận đơn"
                placeholder="GHN123456"
              />
              <UiButton
                class="justify-self-end"
                variant="dark"
                :loading="savingShipping"
                @click="saveShipping(detail.order.id)"
              >
                Save Shipping
              </UiButton>
            </div>
          </OrderSectionCard>
        </div>

        <OrderSectionCard title="Lịch sử trạng thái">
          <div v-if="!history.length" class="py-4 text-sm text-slate-500">
            Chưa có lịch sử trạng thái.
          </div>
          <div v-else class="divide-y divide-slate-100">
            <div
              v-for="item in history"
              :key="item.id"
              class="grid gap-1 py-3 text-sm sm:grid-cols-[170px_1fr]"
            >
              <div class="text-slate-500">
                {{ formatLocalDateTime(item.createdAt) }}
              </div>
              <div>
                <div class="font-semibold text-slate-950">
                  {{ item.oldStatus || '-' }} → {{ item.newStatus || item.status || '-' }}
                </div>
                <p v-if="item.note" class="mt-1 text-slate-600">
                  {{ item.note }}
                </p>
                <p v-if="item.createdBy" class="mt-1 text-xs text-slate-400">
                  By {{ item.createdBy }}
                </p>
              </div>
            </div>
          </div>
        </OrderSectionCard>
      </div>
    </template>

    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      density="sm"
      sticky-header
      striped
      row-key="id"
      min-width="min-w-[960px]"
      empty-text="Không có order."
    >
      <template #cell-code="{ row }">
        <span class="font-black text-slate-950">{{ orderCode(row) }}</span>
      </template>
      <template #cell-customer="{ row }">
        {{ row.customerName }}<br />
        <span class="text-slate-400">{{ row.customerPhone || '-' }}</span>
      </template>
      <template #cell-status="{ row }">
        <span :class="badgeClass(row.status)">{{ row.status }}</span>
      </template>
      <template #cell-payment="{ row }">
        {{ row.paymentMethod || '-' }} / {{ row.paymentStatus || '-' }}
      </template>
      <template #cell-shipping="{ row }">
        {{ row.shippingMethod || '-' }} / {{ row.shippingStatus || '-' }}
      </template>
      <template #cell-totalAmount="{ row }">{{ money(row.totalAmount) }}</template>
      <template #cell-createdAt="{ row }">{{ formatLocalDateTime(row.createdAt) }}</template>
      <template #cell-actions="{ row }">
        <UiDropdown
          :items="actionItems"
          placement="right"
          @select="(key) => handleRowAction(key, row)"
        >
          <template #trigger>
            <UiButton variant="ghost" :loading="openingId === row.id">Thao tác</UiButton>
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
import OrderInfoRow from '@/components/admin/order/OrderInfoRow.vue'
import OrderMoneyRow from '@/components/admin/order/OrderMoneyRow.vue'
import OrderSectionCard from '@/components/admin/order/OrderSectionCard.vue'
import { UiButton, UiDropdown, UiInput, UiPagination, UiSelect, UiTable, UiTextarea } from '@/components/ui'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { usePageQuery } from '@/composables/usePageQuery'
import { useToast } from '@/composables/useToast'
import { orderApi } from '@/modules/sales/order/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { money } from '@/modules/shared/types'
import { formatLocalDateTime, toBackendDateTime, toDateTimeLocalInput } from '@/lib/dateTime'
import type { Order, OrderDetail, OrderStatusHistory } from '@/modules/sales/order/types'

const ORDER_STATUSES = ['PENDING', 'CONFIRMED', 'SHIPPING', 'COMPLETED', 'CANCELLED'] as const
const PAYMENT_STATUSES = ['UNPAID', 'PAID', 'REFUNDED', 'FAILED'] as const
const SHIPPING_STATUSES = [
  'PENDING',
  'PACKING',
  'SHIPPING',
  'DELIVERED',
  'RETURNED',
  'CANCELLED',
] as const

const toast = useToast()
const pageQuery = usePageQuery()
const rows = ref<Order[]>([])
const detail = ref<OrderDetail | null>(null)
const history = ref<OrderStatusHistory[]>([])
const loading = ref(false)
const openingId = ref('')
const savingStatus = ref(false)
const savingPayment = ref(false)
const savingShipping = ref(false)
const error = ref('')
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const statusForm = reactive({ status: 'PENDING', note: '' })
const paymentForm = reactive({
  paymentMethod: '',
  paymentStatus: 'UNPAID',
  paidAt: '',
})
const shippingForm = reactive({ shippingMethod: '', shippingStatus: 'PENDING', trackingCode: '' })

const orderOptions = computed(() => toSelectOptions(ORDER_STATUSES))
const paymentOptions = computed(() => toSelectOptions(PAYMENT_STATUSES))
const shippingOptions = computed(() => toSelectOptions(SHIPPING_STATUSES))

const columns = [
  { key: 'code', label: 'Mã đơn hàng', cellAlign: 'left', width: '180px' },
  { key: 'customer', label: 'Khách hàng', cellAlign: 'left', width: '200px' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'payment', label: 'Thanh toán', cellAlign: 'center', width: '170px' },
  { key: 'shipping', label: 'Vận chuyển', cellAlign: 'center', width: '170px' },
  { key: 'totalAmount', label: 'Tổng cộng', cellAlign: 'right', width: '140px' },
  { key: 'createdAt', label: 'Ngày tạo', cellAlign: 'center', width: '180px' },
  { key: 'actions', label: 'Actions', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [{ key: 'detail', label: 'Detail' }]

function toSelectOptions(values: readonly string[]) {
  return values.map((value) => ({ label: value, value }))
}

function orderCode(order: Order) {
  return order.orderCode || order.code || order.id
}

function badgeClass(status: string) {
  if (['CONFIRMED', 'COMPLETED', 'DELIVERED', 'PAID'].includes(status))
    return 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
  if (['CANCELLED', 'FAILED', 'RETURNED'].includes(status))
    return 'rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700'
  if (['SHIPPING', 'PACKING'].includes(status))
    return 'rounded-full bg-sky-50 px-2.5 py-1 text-xs font-bold text-sky-700'
  return 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700'
}

function populateForms(order: Order) {
  statusForm.status = order.status || 'PENDING'
  statusForm.note = ''
  paymentForm.paymentMethod = order.paymentMethod || ''
  paymentForm.paymentStatus = order.paymentStatus || 'UNPAID'
  paymentForm.paidAt = toDateTimeLocalInput(order.paidAt || null)
  shippingForm.shippingMethod = order.shippingMethod || ''
  shippingForm.shippingStatus = order.shippingStatus || 'PENDING'
  shippingForm.trackingCode = order.trackingCode || ''
}

function closeDetail() {
  detail.value = null
  history.value = []
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await orderApi.adminList(query)
    rows.value = data.items
    total.value = data.total
    totalPages.value = data.totalPages
    query.page = data.page || query.page
    query.limit = data.limit || query.limit
  } catch (err) {
    error.value = getErrorMessage(err)
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

async function refreshDetail(id: string, includeHistory = false) {
  const [orderDetail, statusHistory] = await Promise.all([
    orderApi.detail(id),
    includeHistory || !detail.value
      ? orderApi.history(id).catch(() => [])
      : Promise.resolve(history.value),
  ])
  detail.value = orderDetail
  history.value = statusHistory
  populateForms(orderDetail.order)
}

async function open(id: string) {
  openingId.value = id
  error.value = ''
  try {
    await refreshDetail(id, true)
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    openingId.value = ''
  }
}

function handleRowAction(key: string, row: Order) {
  if (key === 'detail') void open(row.id)
}

async function saveStatus(id: string) {
  if (!ORDER_STATUSES.includes(statusForm.status as (typeof ORDER_STATUSES)[number])) {
    toast.push('Trạng thái đơn không hợp lệ.', 'error', 'Không thể cập nhật')
    return
  }

  savingStatus.value = true
  try {
    const res = await orderApi.updateStatus(id, {
      status: statusForm.status,
      note: statusForm.note || undefined,
    })
    await refreshDetail(id, true)
    await load()
    toast.push(res.message || 'Đã cập nhật trạng thái đơn.', 'success', 'Thành công')
  } catch (err) {
    toast.push(getErrorMessage(err), 'error', 'Cập nhật thất bại')
  } finally {
    savingStatus.value = false
  }
}

async function savePayment(id: string) {
  if (!PAYMENT_STATUSES.includes(paymentForm.paymentStatus as (typeof PAYMENT_STATUSES)[number])) {
    toast.push('Trạng thái thanh toán không hợp lệ.', 'error', 'Không thể cập nhật')
    return
  }

  const paidAt = paymentForm.paidAt ? toBackendDateTime(paymentForm.paidAt) : null
  if (paymentForm.paidAt && !paidAt) {
    toast.push('Paid at không hợp lệ.', 'error', 'Không thể cập nhật')
    return
  }

  savingPayment.value = true
  try {
    const res = await orderApi.updatePayment(id, {
      paymentMethod: paymentForm.paymentMethod,
      paymentStatus: paymentForm.paymentStatus,
      paidAt,
    })
    await refreshDetail(id)
    await load()
    toast.push(res.message || 'Đã cập nhật thanh toán.', 'success', 'Thành công')
  } catch (err) {
    toast.push(getErrorMessage(err), 'error', 'Cập nhật thất bại')
  } finally {
    savingPayment.value = false
  }
}

async function saveShipping(id: string) {
  if (
    !SHIPPING_STATUSES.includes(shippingForm.shippingStatus as (typeof SHIPPING_STATUSES)[number])
  ) {
    toast.push('Trạng thái vận chuyển không hợp lệ.', 'error', 'Không thể cập nhật')
    return
  }

  savingShipping.value = true
  try {
    const res = await orderApi.updateShipping(id, {
      shippingMethod: shippingForm.shippingMethod,
      shippingStatus: shippingForm.shippingStatus,
      trackingCode: shippingForm.trackingCode || undefined,
    })
    await refreshDetail(id)
    await load()
    toast.push(res.message || 'Đã cập nhật vận chuyển.', 'success', 'Thành công')
  } catch (err) {
    toast.push(getErrorMessage(err), 'error', 'Cập nhật thất bại')
  } finally {
    savingShipping.value = false
  }
}

onMounted(load)
</script>
