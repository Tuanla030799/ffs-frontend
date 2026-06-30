<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý coupon"
    description="Mã giảm giá percent/fixed, giới hạn thời gian và usage."
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo coupon' : 'Cập nhật coupon'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa coupon ${deleting?.code || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <UiInput v-model="form.code" placeholder="Code" required label="Code" />
        <UiInput v-model="form.name" placeholder="Name" required label="Name" />
        <UiSelect v-model="form.discountType" label="Loại giảm giá"
          ><option>PERCENT</option>
          <option>FIXED</option></UiSelect
        >
        <UiInput
          v-model.number="form.discountValue"
          placeholder="Discount value"
          label="Discount value"
        />
        <UiInput
          v-model.number="form.maxDiscount"
          placeholder="Max discount"
          label="Max discount"
        />
        <UiInput v-model.number="form.minOrderAmount" placeholder="Min order" label="Min order" />
        <UiInput v-model.number="form.usageLimit" placeholder="Usage limit" label="Usage limit" />
        <UiInput v-model="form.startsAt" type="datetime-local" label="Bắt đầu" />
        <UiInput v-model="form.endsAt" type="datetime-local" label="Kết thúc" />
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
      min-width="min-w-[880px]"
      empty-text="Không có coupon."
    >
      <template #cell-code="{ row }"
        ><span class="font-black text-slate-950">{{ row.code }}</span></template
      >
      <template #cell-minOrderAmount="{ row }">{{ money(row.minOrderAmount) }}</template>
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
import { couponApi } from '@/modules/promotion/coupon/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { money } from '@/modules/shared/types'
import { toBackendDateTime, toDateTimeLocalInput } from '@/lib/dateTime'
import type { Coupon, CouponPayload } from '@/modules/promotion/coupon/types'

const rows = ref<Coupon[]>([])
const pageQuery = usePageQuery()
const loading = ref(false)
const error = ref('')
const editing = ref<Coupon | 'new' | null>(null)
const deleting = ref<Coupon | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<CouponPayload>({
  code: '',
  name: '',
  discountType: 'PERCENT',
  discountValue: 0,
  maxDiscount: 0,
  minOrderAmount: 0,
  usageLimit: 0,
  startsAt: '',
  endsAt: '',
  status: 'ACTIVE',
})
const columns = [
  { key: 'code', label: 'Code', cellAlign: 'left', width: '150px' },
  { key: 'name', label: 'Name', cellAlign: 'left', width: '220px' },
  { key: 'discountType', label: 'Type', cellAlign: 'center', width: '130px' },
  { key: 'discountValue', label: 'Value', cellAlign: 'right', width: '120px' },
  { key: 'minOrderAmount', label: 'Min order', cellAlign: 'right', width: '140px' },
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
function fill(r?: Coupon) {
  Object.assign(form, {
    code: r?.code || '',
    name: r?.name || '',
    discountType: r?.discountType || 'PERCENT',
    discountValue: r?.discountValue || 0,
    maxDiscount: r?.maxDiscount || 0,
    minOrderAmount: r?.minOrderAmount || 0,
    usageLimit: r?.usageLimit || 0,
    startsAt: toDateTimeLocalInput(r?.startsAt),
    endsAt: toDateTimeLocalInput(r?.endsAt),
    status: r?.status || 'ACTIVE',
  })
}
function openCreate() {
  editing.value = 'new'
  fill()
}
function openEdit(r: Coupon) {
  editing.value = r
  fill(r)
}
function handleRowAction(key: string, row: Coupon) {
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
    const data = await couponApi.adminList(query)
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
  try {
    const payload = {
      ...form,
      startsAt: toBackendDateTime(form.startsAt || null) || undefined,
      endsAt: toBackendDateTime(form.endsAt || null) || undefined,
    }
    if (editing.value === 'new') await couponApi.create(payload)
    else if (editing.value) await couponApi.update(editing.value.id, payload)
    editing.value = null
    await load()
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  await couponApi.remove(deleting.value.id)
  deleting.value = null
  await load()
}
onMounted(load)
</script>
