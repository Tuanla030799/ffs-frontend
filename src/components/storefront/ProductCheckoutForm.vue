<template>
  <UiForm as="form" class="space-y-3 border-t border-black/10 pt-6" @submit.prevent="submitOrder">
    <h2 class="text-base font-black">Thông tin nhận hàng</h2>
    <UiInput v-model="form.customerName" placeholder="Họ tên *" label="Họ tên" />
    <UiInput v-model="form.customerPhone" placeholder="Số điện thoại *" label="Số điện thoại" />
    <UiInput v-model="form.customerEmail" placeholder="Email" label="Email" />
    <UiTextarea
      v-model="form.shippingAddress"
      placeholder="Địa chỉ giao hàng *"
      label="Địa chỉ giao hàng"
    />
    <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
      <UiInput v-model="form.couponCode" placeholder="Coupon" label="Coupon" />
      <UiButton native-type="button" variant="outline" @click="validateCoupon">Validate</UiButton>
    </div>
    <UiTextarea v-model="form.note" placeholder="Ghi chú" label="Ghi chú" />
    <UiButton native-type="submit" block :disabled="submitting">
      {{ submitting ? 'Đang đặt...' : 'Đặt hàng' }}
    </UiButton>
    <p
      v-if="notice"
      class="text-sm font-bold"
      :class="noticeType === 'error' ? 'text-red-600' : 'text-emerald-600'"
    >
      {{ notice }}
    </p>
  </UiForm>
</template>

<script setup lang="ts">
import { reactive, ref } from 'vue'
import { UiButton, UiForm, UiInput, UiTextarea } from '@/components/ui'
import { couponApi } from '@/modules/promotion/coupon/api'
import { orderApi } from '@/modules/sales/order/api'
import { getErrorMessage, isPhone, required } from '@/modules/shared/hooks'
import { money } from '@/modules/shared/types'
import type { ProductSku } from '@/modules/catalog/product/types'

const props = defineProps<{
  selectedSku?: ProductSku | null
}>()

const submitting = ref(false)
const notice = ref('')
const noticeType = ref<'ok' | 'error'>('ok')
const form = reactive({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  shippingAddress: '',
  note: '',
  couponCode: '',
  quantity: 1,
})

function validateForm() {
  return (
    required(props.selectedSku?.id, 'SKU') ||
    required(form.customerName, 'Họ tên') ||
    required(form.customerPhone, 'Số điện thoại') ||
    isPhone(form.customerPhone) ||
    required(form.shippingAddress, 'Địa chỉ')
  )
}

async function validateCoupon() {
  if (!form.couponCode || !props.selectedSku) return
  try {
    const data = await couponApi.validate({
      code: form.couponCode,
      subtotalAmount: (props.selectedSku.salePrice || props.selectedSku.price) * form.quantity,
    })
    noticeType.value = data.valid ? 'ok' : 'error'
    notice.value =
      data.message ||
      (data.valid ? `Coupon hợp lệ, giảm ${money(data.discountAmount)}` : 'Coupon không hợp lệ')
  } catch (err) {
    noticeType.value = 'error'
    notice.value = getErrorMessage(err)
  }
}

async function submitOrder() {
  const msg = validateForm()
  if (msg) {
    noticeType.value = 'error'
    notice.value = msg
    return
  }
  submitting.value = true
  try {
    await orderApi.create({
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail || undefined,
      shippingAddress: form.shippingAddress,
      note: form.note || undefined,
      couponCode: form.couponCode || undefined,
      paymentMethod: 'COD',
      shippingMethod: 'STANDARD',
      shippingFee: 0,
      items: [{ skuId: props.selectedSku?.id || '', quantity: form.quantity }],
    })
    noticeType.value = 'ok'
    notice.value = 'Đặt hàng thành công. Shop sẽ liên hệ xác nhận.'
  } catch (err) {
    noticeType.value = 'error'
    notice.value = getErrorMessage(err)
  } finally {
    submitting.value = false
  }
}

defineExpose({ submitOrder })
</script>
