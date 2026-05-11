<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[{ label: 'Cửa hàng', to: '/products' }, { label: 'Checkout' }]"
    />

    <div class="mb-8">
      <p class="text-sm font-bold tracking-[0.18em] text-black/45 uppercase">Checkout</p>
      <h1 class="mt-2 text-3xl leading-tight font-black text-black md:text-5xl">
        Xác nhận thông tin
      </h1>
    </div>

    <UiAlert v-if="pageError" class="mb-5" variant="error">{{ pageError }}</UiAlert>

    <UiEmpty
      v-if="!loading && !cartItems.length"
      title="Giỏ hàng đang trống"
      description="Chọn một đôi giày trước rồi quay lại đây để gửi thông tin liên hệ."
    >
      <template #action>
        <UiButton variant="dark" @click="goShopping">Quay lại mua hàng</UiButton>
      </template>
    </UiEmpty>

    <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section class="space-y-5">
        <div v-if="loading" class="grid gap-3">
          <div
            v-for="i in 3"
            :key="i"
            class="grid gap-4 border border-black/10 bg-white p-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:p-5"
          >
            <UiSkeleton variant="block" class="aspect-square" />
            <UiSkeleton :rows="4" />
          </div>
        </div>

        <div v-else class="overflow-hidden border border-black/10 bg-white">
          <div class="border-b border-black/10 px-4 py-3 sm:px-5">
            <h2 class="text-base font-black text-black">Sản phẩm trong giỏ</h2>
          </div>

          <div class="divide-y divide-black/10">
            <article
              v-for="item in cartItems"
              :key="item.cart.id"
              class="grid gap-4 p-4 sm:grid-cols-[112px_minmax(0,1fr)] sm:p-5"
            >
              <RouterLink
                class="block aspect-square overflow-hidden bg-[#f3f3f1]"
                :to="{ name: 'product-detail', params: { slug: item.cart.slug } }"
              >
                <img
                  v-if="item.imageUrl"
                  :src="item.imageUrl"
                  :alt="item.product?.name || item.cart.name"
                  class="h-full w-full object-contain p-4"
                />
                <div v-else class="grid h-full place-items-center text-xs font-bold text-black/35">
                  No image
                </div>
              </RouterLink>

              <div class="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div class="min-w-0">
                  <RouterLink
                    class="text-base font-black text-black no-underline transition hover:opacity-60"
                    :to="{ name: 'product-detail', params: { slug: item.cart.slug } }"
                  >
                    {{ item.product?.name || item.cart.name }}
                  </RouterLink>
                  <p class="mt-1 text-sm text-black/55">
                    <span v-if="item.variantLabel">{{ item.variantLabel }}</span>
                    <span v-if="item.variantLabel && item.sizeLabel"> / </span>
                    <span v-if="item.sizeLabel">Size {{ item.sizeLabel }}</span>
                    <span v-if="!item.variantLabel && !item.sizeLabel"
                      >SKU {{ item.cart.skuId }}</span
                    >
                  </p>
                  <p v-if="!item.cart.skuId" class="mt-2 text-sm font-semibold text-red-600">
                    Sản phẩm này thiếu SKU, vui lòng chọn lại size.
                  </p>
                  <button
                    type="button"
                    class="mt-4 text-sm font-bold text-black/50 underline-offset-4 transition hover:text-black hover:underline"
                    @click="removeItem(item.cart.id)"
                  >
                    Xóa
                  </button>
                </div>

                <div class="grid gap-3 text-sm sm:grid-cols-3 md:grid-cols-1 md:text-right">
                  <div>
                    <p class="text-black/45">Số lượng</p>
                    <div class="mt-1 inline-flex overflow-hidden border border-black/15">
                      <button
                        type="button"
                        class="h-9 w-9 font-black transition hover:bg-black hover:text-white"
                        @click="setQuantity(item.cart.id, item.cart.quantity - 1)"
                      >
                        -
                      </button>
                      <input
                        :value="item.cart.quantity"
                        class="h-9 w-12 border-x border-black/15 text-center font-bold outline-none"
                        inputmode="numeric"
                        @change="onQuantityChange(item.cart.id, $event)"
                      />
                      <button
                        type="button"
                        class="h-9 w-9 font-black transition hover:bg-black hover:text-white"
                        @click="setQuantity(item.cart.id, item.cart.quantity + 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <p class="text-black/45">Đơn giá</p>
                    <p class="mt-1 font-bold text-black">{{ money(item.unitPrice) }}</p>
                  </div>
                  <div>
                    <p class="text-black/45">Thành tiền</p>
                    <p class="mt-1 font-black text-black">{{ money(item.subtotal) }}</p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        <UiForm
          as="form"
          class="border border-black/10 bg-white p-4 sm:p-5"
          @submit.prevent="submitContact"
        >
          <div>
            <h2 class="text-base font-black text-black">Thông tin liên hệ / giao hàng</h2>
            <p class="mt-1 text-sm leading-6 text-black/55">
              Shop sẽ liên hệ xác nhận đơn sau khi nhận thông tin.
            </p>
          </div>

          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <UiInput
                v-model="form.fullName"
                name="fullName"
                label="Họ tên"
                placeholder="Nguyễn Văn A"
                required
              />
              <p v-if="errors.fullName" class="mt-1 text-sm font-semibold text-red-600">
                {{ errors.fullName }}
              </p>
            </div>
            <div>
              <UiInput
                v-model="form.phone"
                name="phone"
                label="Số điện thoại"
                placeholder="0901234567"
                required
              />
              <p v-if="errors.phone" class="mt-1 text-sm font-semibold text-red-600">
                {{ errors.phone }}
              </p>
            </div>
          </div>

          <div>
            <UiInput
              v-model="form.email"
              name="email"
              type="email"
              label="Email"
              placeholder="you@example.com"
            />
            <p v-if="errors.email" class="mt-1 text-sm font-semibold text-red-600">
              {{ errors.email }}
            </p>
          </div>

          <div>
            <UiTextarea
              v-model="form.address"
              name="address"
              label="Địa chỉ giao hàng"
              placeholder="Số nhà, đường, phường/xã, quận/huyện, tỉnh/thành"
            />
            <p v-if="errors.address" class="mt-1 text-sm font-semibold text-red-600">
              {{ errors.address }}
            </p>
          </div>

          <UiTextarea
            v-model="form.note"
            name="note"
            label="Ghi chú"
            placeholder="Thời gian nhận hàng, yêu cầu khác..."
          />
        </UiForm>
      </section>

      <aside class="lg:sticky lg:top-[92px] lg:self-start">
        <section class="border border-black/10 bg-white p-4 sm:p-5">
          <h2 class="text-base font-black text-black">Tóm tắt</h2>

          <div class="mt-5 space-y-3 text-sm">
            <div class="flex justify-between gap-3">
              <span class="text-black/55">Tạm tính</span>
              <span class="font-bold text-black">{{ money(subtotal) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-black/55">Giảm giá</span>
              <span class="font-bold text-black">-{{ money(discountAmount) }}</span>
            </div>
            <div class="flex justify-between gap-3">
              <span class="text-black/55">Phí ship</span>
              <span class="font-bold text-black">{{ money(shippingFee) }}</span>
            </div>
          </div>

          <div class="mt-5 border-t border-black/10 pt-5">
            <div class="flex items-end justify-between gap-3">
              <span class="font-black text-black">Tổng tiền</span>
              <span class="text-xl font-black text-black">{{ money(totalAmount) }}</span>
            </div>
          </div>

          <div class="mt-5 grid gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-1">
            <UiInput v-model="couponCode" placeholder="Mã giảm giá" label="Coupon" />
            <UiButton variant="outline" :loading="checkingCoupon" @click="applyCoupon">
              Áp dụng
            </UiButton>
          </div>
          <p v-if="couponMessage" class="mt-2 text-sm font-semibold" :class="couponMessageClass">
            {{ couponMessage }}
          </p>

          <UiAlert v-if="submitError" class="mt-5" variant="error">{{ submitError }}</UiAlert>

          <UiButton
            class="mt-5"
            variant="dark"
            size="lg"
            block
            :loading="submitting"
            :disabled="submitDisabled"
            @click="submitContact"
          >
            Liên hệ
          </UiButton>
        </section>
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import {
  UiAlert,
  UiButton,
  UiEmpty,
  UiForm,
  UiInput,
  UiSkeleton,
  UiTextarea,
} from '@/components/ui'
import { useCart, type CartItem } from '@/composables/useCart'
import { useToast } from '@/composables/useToast'
import { resolveFileUrl } from '@/lib/fileUrl'
import { productApi } from '@/modules/catalog/product/api'
import type {
  Product,
  ProductImage,
  ProductSku,
  ProductVariant,
} from '@/modules/catalog/product/types'
import { couponApi } from '@/modules/promotion/coupon/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { asArray, money } from '@/modules/shared/types'
import { orderApi } from '@/modules/sales/order/api'

type EnrichedCartItem = {
  cart: CartItem
  product: Product | null
  sku: ProductSku | null
  variant: ProductVariant | null
  imageUrl: string
  unitPrice: number
  subtotal: number
  sizeLabel: string
  variantLabel: string
}

type CheckoutErrors = Partial<Record<'fullName' | 'phone' | 'email' | 'address', string>>

const router = useRouter()
const toast = useToast()
const { items, coupon, refresh, setQuantity, removeItem, setCoupon, clearCart } = useCart()

const loading = ref(false)
const pageError = ref('')
const submitError = ref('')
const submitting = ref(false)
const checkingCoupon = ref(false)
const couponCode = ref('')
const couponMessage = ref('')
const couponMessageType = ref<'ok' | 'error'>('ok')
const productsBySlug = ref<Record<string, Product>>({})

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  note: '',
})
const errors = reactive<CheckoutErrors>({})

const cartItems = computed<EnrichedCartItem[]>(() =>
  items.value.map((cart) => {
    const product = productsBySlug.value[cart.slug] || null
    const sku = asArray(product?.skus).find((item) => item.id === cart.skuId) || null
    const variant = findVariant(product, sku)
    const unitPrice = Number(
      sku?.salePrice || sku?.price || product?.salePrice || product?.price || 0,
    )
    const quantity = Math.max(1, Number(cart.quantity || 1))

    return {
      cart,
      product,
      sku,
      variant,
      imageUrl: resolveItemImage(product, variant),
      unitPrice,
      subtotal: unitPrice * quantity,
      sizeLabel: sku?.size || sku?.sizeId || '',
      variantLabel: variant?.colorName || variant?.name || '',
    }
  }),
)

const subtotal = computed(() => cartItems.value.reduce((total, item) => total + item.subtotal, 0))
const discountAmount = computed(() =>
  Math.min(Number(coupon.value?.discountAmount || 0), subtotal.value),
)
const shippingFee = computed(() => 0)
const totalAmount = computed(() =>
  Math.max(0, subtotal.value - discountAmount.value + shippingFee.value),
)
const formValid = computed(() =>
  Boolean(
    form.fullName.trim() &&
    form.phone.trim() &&
    !validatePhone(form.phone) &&
    !validateEmail(form.email) &&
    form.address.trim(),
  ),
)
const submitDisabled = computed(
  () => submitting.value || !cartItems.value.length || !formValid.value,
)
const couponMessageClass = computed(() =>
  couponMessageType.value === 'error' ? 'text-red-600' : 'text-emerald-600',
)

watch(
  items,
  () => {
    void loadProducts()
  },
  { deep: true },
)

watch(
  coupon,
  (nextCoupon) => {
    couponCode.value = nextCoupon?.code || couponCode.value
  },
  { immediate: true },
)

function findVariant(product: Product | null, sku: ProductSku | null) {
  if (!product || !sku) return null
  return asArray(product.variants).find((variant) => variant.id === sku.variantId) || null
}

function resolveItemImage(product: Product | null, variant: ProductVariant | null) {
  if (variant?.imageUrl) return resolveFileUrl(variant.imageUrl)

  const images = asArray<ProductImage>(product?.images)
  const image = images.find((item) => item.isPrimary) || images[0]
  return resolveFileUrl(image?.url || image?.imageUrl || '')
}

function validatePhone(value: string) {
  const normalized = value.replace(/[\s.-]/g, '')
  return /^(0|\+84|84)(3|5|7|8|9)\d{8}$/.test(normalized)
    ? ''
    : 'Số điện thoại Việt Nam không hợp lệ.'
}

function validateEmail(value: string) {
  if (!value.trim()) return ''
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim()) ? '' : 'Email không hợp lệ.'
}

function validateForm() {
  errors.fullName = required(form.fullName, 'Họ tên')
  errors.phone = required(form.phone, 'Số điện thoại') || validatePhone(form.phone)
  errors.email = validateEmail(form.email)
  errors.address = required(form.address, 'Địa chỉ')

  const firstInvalidField = (['fullName', 'phone', 'email', 'address'] as const).find(
    (field) => errors[field],
  )

  if (firstInvalidField) {
    focusField(firstInvalidField)
    return false
  }

  return true
}

function focusField(field: keyof CheckoutErrors) {
  window.requestAnimationFrame(() => {
    const input = document.querySelector<HTMLElement>(`[name="${field}"]`)
    input?.focus()
  })
}

function onQuantityChange(itemId: string, event: Event) {
  setQuantity(itemId, Number((event.target as HTMLInputElement).value))
}

async function loadProducts() {
  if (!items.value.length) {
    productsBySlug.value = {}
    return
  }

  loading.value = true
  pageError.value = ''

  try {
    const uniqueSlugs = [...new Set(items.value.map((item) => item.slug).filter(Boolean))]
    const products = await Promise.all(uniqueSlugs.map((slug) => productApi.detail(slug)))
    productsBySlug.value = products.reduce<Record<string, Product>>((map, product) => {
      map[product.slug] = product
      return map
    }, {})
  } catch (error) {
    pageError.value = getErrorMessage(error)
  } finally {
    loading.value = false
  }
}

async function applyCoupon() {
  const code = couponCode.value.trim()
  couponMessage.value = ''

  if (!code) {
    setCoupon(null)
    couponMessageType.value = 'ok'
    couponMessage.value = 'Đã bỏ mã giảm giá.'
    return
  }

  checkingCoupon.value = true
  try {
    const data = await couponApi.validate({ code, subtotalAmount: subtotal.value })

    if (!data.valid) {
      setCoupon(null)
      couponMessageType.value = 'error'
      couponMessage.value = data.message || 'Coupon không hợp lệ.'
      return
    }

    setCoupon({ code, discountAmount: Number(data.discountAmount || 0) })
    couponMessageType.value = 'ok'
    couponMessage.value = data.message || `Coupon hợp lệ, giảm ${money(data.discountAmount)}.`
  } catch (error) {
    couponMessageType.value = 'error'
    couponMessage.value = getErrorMessage(error)
  } finally {
    checkingCoupon.value = false
  }
}

async function submitContact() {
  submitError.value = ''

  if (!cartItems.value.length) return
  if (!validateForm()) return

  const orderItems = cartItems.value
    .filter((item) => item.cart.skuId)
    .map((item) => ({ skuId: item.cart.skuId || '', quantity: item.cart.quantity }))

  if (orderItems.length !== cartItems.value.length) {
    submitError.value = 'Một số sản phẩm thiếu SKU. Vui lòng chọn lại size trước khi liên hệ.'
    return
  }

  submitting.value = true
  try {
    const order = await orderApi.create({
      customerName: form.fullName.trim(),
      customerPhone: form.phone.trim(),
      customerEmail: form.email.trim() || undefined,
      shippingAddress: form.address.trim(),
      note: form.note.trim() || undefined,
      couponCode: coupon.value?.code || undefined,
      paymentMethod: 'COD',
      shippingMethod: 'STANDARD',
      shippingFee: shippingFee.value,
      items: orderItems,
    })

    clearCart()
    toast.push('Shop đã nhận thông tin và sẽ liên hệ xác nhận.', 'success', 'Tạo đơn thành công')
    await router.push({ name: 'order-success', query: { code: order.code || order.id } })
  } catch (error) {
    submitError.value = getErrorMessage(error)
  } finally {
    submitting.value = false
  }
}

function goShopping() {
  void router.push({ name: 'products' })
}

onMounted(() => {
  refresh()
  void loadProducts()
})
</script>
