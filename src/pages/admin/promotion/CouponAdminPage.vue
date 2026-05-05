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
    @search="load"
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
        ><div class="space-x-3">
          <UiButton variant="ghost" @click="openEdit(row)">Edit</UiButton
          ><UiButton variant="danger" @click="deleting = row">Delete</UiButton>
        </div></template
      >
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { UiButton, UiForm, UiInput, UiSelect, UiTable } from '@/components/ui'
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
  { key: 'code', label: 'Code' },
  { key: 'name', label: 'Name' },
  { key: 'discountType', label: 'Type' },
  { key: 'discountValue', label: 'Value' },
  { key: 'minOrderAmount', label: 'Min order' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

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
    startsAt: r?.startsAt || '',
    endsAt: r?.endsAt || '',
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
async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (
      await couponApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })
    ).items
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}
async function save() {
  try {
    if (editing.value === 'new') await couponApi.create(form)
    else if (editing.value) await couponApi.update(editing.value.id, form)
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
