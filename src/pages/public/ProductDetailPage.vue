<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <div v-if="error" class="border border-red-200 bg-red-50 p-4 text-red-700">{{ error }}</div>
    <div v-else-if="loading" class="h-96 animate-pulse bg-black/10" />
    <div v-else-if="product" class="grid gap-6 md:gap-10 lg:grid-cols-[1fr_0.9fr]">
      <section class="space-y-4">
        <div class="aspect-square bg-[#f7f7f5] p-5 shadow-sm ring-1 ring-black/5 md:p-8">
          <img
            v-if="selectedImage"
            :src="selectedImage"
            class="h-full w-full object-contain"
            :alt="product.name"
          />
          <div v-else class="grid h-full place-items-center text-black/40">No image</div>
        </div>
        <div class="grid grid-cols-5 gap-2 md:gap-3">
          <UiButton
            v-for="image in images"
            :key="image.url || image.fileId"
            variant="secondary"
            square
            @click="selectedImage = image.url || ''"
          >
            <img :src="image.url" class="h-full w-full object-cover" :alt="image.altText" />
          </UiButton>
        </div>
      </section>

      <section class="bg-[#f7f7f5] p-5 shadow-sm ring-1 ring-black/5 md:p-8">
        <p class="text-sm font-bold tracking-[0.18em] text-black/50 uppercase">
          {{ product.brandName || product.categoryName }}
        </p>
        <h1 class="mt-3 text-3xl leading-tight font-black uppercase md:text-4xl">
          {{ product.name }}
        </h1>
        <p class="mt-4 leading-7 text-black/65">{{ product.shortDescription }}</p>
        <div class="mt-6 flex items-end gap-3">
          <strong class="text-3xl text-black">{{
            money(
              selectedSku?.salePrice || selectedSku?.price || product.salePrice || product.price,
            )
          }}</strong>
          <span
            v-if="selectedSku?.salePrice || product.salePrice"
            class="text-black/35 line-through"
            >{{ money(selectedSku?.price || product.price) }}</span
          >
        </div>

        <div class="mt-7">
          <p class="mb-3 font-black uppercase">Màu sắc</p>
          <div class="flex flex-wrap gap-2">
            <UiButton
              v-for="variant in variants"
              :key="variant.id || variant.clientId"
              :variant="selectedVariantKey === variantKey(variant) ? 'dark' : 'outline'"
              @click="selectVariant(variant)"
            >
              <span
                v-if="variant.colorCode"
                class="inline-block h-3 w-3 rounded-full border border-black/20"
                :style="{ backgroundColor: variant.colorCode }"
              />
              {{ variant.colorName || variant.name }}
            </UiButton>
          </div>
        </div>

        <div class="mt-7">
          <p class="mb-3 font-black uppercase">Size</p>
          <div class="flex flex-wrap gap-2">
            <UiButton
              v-for="sku in availableSkus"
              :key="sku.id || sku.skuCode"
              :variant="selectedSku?.id === sku.id ? 'dark' : 'outline'"
              :disabled="sku.stock <= 0"
              @click="selectedSku = sku"
              >{{ sku.size }}</UiButton
            >
          </div>
          <p class="mt-3 text-sm text-black/50">Tồn kho: {{ selectedSku?.stock ?? '-' }}</p>
        </div>

        <form
          class="mt-8 space-y-3 border border-black/10 bg-white p-3 md:p-4"
          @submit.prevent="submitOrder"
        >
          <h2 class="text-xl font-black uppercase">Đặt hàng nhanh</h2>
          <UiInput v-model="form.customerName" placeholder="Họ tên *" label="Họ tên" />
          <UiInput
            v-model="form.customerPhone"
            placeholder="Số điện thoại *"
            label="Số điện thoại"
          />
          <UiInput v-model="form.customerEmail" placeholder="Email" label="Email" />
          <UiTextarea
            v-model="form.shippingAddress"
            placeholder="Địa chỉ giao hàng *"
            label="Địa chỉ giao hàng"
          />
          <div class="grid gap-3 sm:grid-cols-[1fr_auto]">
            <UiInput v-model="form.couponCode" placeholder="Coupon" label="Coupon" />
            <UiButton native-type="button" variant="outline" @click="validateCoupon"
              >Validate</UiButton
            >
          </div>
          <UiTextarea v-model="form.note" placeholder="Ghi chú" label="Ghi chú" />
          <UiButton native-type="submit" block :disabled="submitting">{{
            submitting ? 'Đang đặt...' : 'Đặt hàng'
          }}</UiButton>
          <p
            v-if="notice"
            class="text-sm font-bold"
            :class="noticeType === 'error' ? 'text-red-600' : 'text-emerald-600'"
          >
            {{ notice }}
          </p>
        </form>
      </section>

      <section class="bg-[#f7f7f5] p-5 shadow-sm ring-1 ring-black/5 md:p-6 lg:col-span-2">
        <h2 class="mb-5 text-2xl font-black uppercase">Mô tả sản phẩm</h2>
        <EditorContent :value="product.descriptionJson" />
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute } from 'vue-router'
import { UiButton, UiInput, UiTextarea } from '@/components/ui'
import EditorContent from '@/components/storefront/EditorContent.vue'
import { productApi } from '@/modules/catalog/product/api'
import { orderApi } from '@/modules/sales/order/api'
import { couponApi } from '@/modules/promotion/coupon/api'
import { getErrorMessage, isPhone, required } from '@/modules/shared/hooks'
import { asArray, money } from '@/modules/shared/types'
import type { Product, ProductSku, ProductVariant } from '@/modules/catalog/product/types'

const route = useRoute()
const loading = ref(true)
const submitting = ref(false)
const error = ref('')
const notice = ref('')
const noticeType = ref<'ok' | 'error'>('ok')
const product = ref<Product | null>(null)
const selectedImage = ref('')
const selectedVariantKey = ref('')
const selectedSku = ref<ProductSku | null>(null)
const form = reactive({
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  shippingAddress: '',
  note: '',
  couponCode: '',
  quantity: 1,
})
const images = computed(() => asArray(product.value?.images))
const variants = computed(() => asArray(product.value?.variants))
const skus = computed(() => asArray(product.value?.skus))
const availableSkus = computed(() =>
  selectedVariantKey.value
    ? skus.value.filter(
        (s) =>
          s.variantId === selectedVariantKey.value ||
          s.variantClientId === selectedVariantKey.value,
      )
    : skus.value,
)

function variantKey(variant: ProductVariant) {
  return variant.id || variant.clientId || variant.name
}
function selectVariant(variant: ProductVariant) {
  selectedVariantKey.value = variantKey(variant)
  selectedSku.value = availableSkus.value[0] || null
  selectedImage.value = variant.imageUrl || selectedImage.value
}
function validateForm() {
  return (
    required(selectedSku.value?.id, 'SKU') ||
    required(form.customerName, 'Họ tên') ||
    required(form.customerPhone, 'Số điện thoại') ||
    isPhone(form.customerPhone) ||
    required(form.shippingAddress, 'Địa chỉ')
  )
}
async function validateCoupon() {
  if (!form.couponCode || !selectedSku.value) return
  try {
    const data = await couponApi.validate({
      code: form.couponCode,
      subtotalAmount: (selectedSku.value.salePrice || selectedSku.value.price) * form.quantity,
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
      items: [{ skuId: selectedSku.value?.id || '', quantity: form.quantity }],
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

onMounted(async () => {
  try {
    product.value = await productApi.detail(String(route.params.slug))
    selectedImage.value = images.value[0]?.url || ''
    if (variants.value[0]) selectVariant(variants.value[0])
    else selectedSku.value = skus.value[0] || null
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
})
</script>
