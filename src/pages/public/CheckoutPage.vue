<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[{ label: 'Cửa hàng', to: '/products' }, { label: 'Đặt hàng' }]"
    />

    <div class="mb-8">
      <p class="text-sm font-bold tracking-[0.18em] text-black/45 uppercase">Đặt hàng</p>
      <h1 class="mt-2 text-3xl leading-tight font-black text-black md:text-5xl">
        Xác nhận thông tin
      </h1>
    </div>

    <UiAlert v-if="pageError" class="mb-5" variant="error">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span>{{ pageError }}</span>
        <UiButton variant="secondary" size="sm" @click="loadProducts({ force: true })">
          Thử lại
        </UiButton>
      </div>
    </UiAlert>

    <UiEmpty
      v-if="cartReady && !cartItems.length"
      title="Giỏ hàng đang trống"
      description="Chọn một đôi giày trước rồi quay lại đây để gửi thông tin đặt hàng."
    >
      <template #action>
        <UiButton variant="dark" @click="goShopping">Quay lại mua hàng</UiButton>
      </template>
    </UiEmpty>

    <div v-else class="grid gap-8 lg:grid-cols-[minmax(0,1fr)_380px]">
      <section class="space-y-5">
        <div v-if="showSkeleton" class="grid gap-3">
          <div
            v-for="i in Math.min(Math.max(items.length, 1), 3)"
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
              :class="item.issue && 'bg-red-50/60'"
            >
              <NuxtLink
                class="block aspect-square overflow-hidden bg-[#f3f3f1]"
                :to="`/products/${item.cart.slug}`"
                :aria-label="item.product?.name || item.cart.name"
              >
                <StorefrontImage
                  :src="item.imageUrl"
                  :fallback-src="null"
                  fit="contain"
                  alt=""
                  class="h-full w-full object-contain p-4"
                >
                  <template #fallback>
                    <div class="grid h-full place-items-center text-xs font-bold text-black/35">
                      Chưa có ảnh
                    </div>
                  </template>
                </StorefrontImage>
              </NuxtLink>

              <div class="grid min-w-0 gap-4 md:grid-cols-[minmax(0,1fr)_220px]">
                <div class="min-w-0">
                  <NuxtLink
                    class="text-base font-black text-black no-underline transition hover:opacity-60"
                    :to="`/products/${item.cart.slug}`"
                  >
                    {{ item.product?.name || item.cart.name }}
                  </NuxtLink>
                  <p v-if="item.variantLabel || item.sizeLabel" class="mt-1 text-sm text-black/55">
                    <span v-if="item.variantLabel">{{ item.variantLabel }}</span>
                    <span v-if="item.variantLabel && item.sizeLabel"> / </span>
                    <span v-if="item.sizeLabel">Size {{ item.sizeLabel }}</span>
                  </p>
                  <p v-if="item.issue" class="mt-2 text-sm font-semibold text-red-600" role="alert">
                    {{ item.issue }}
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
                        class="h-9 w-9 font-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                        :disabled="item.quantity <= 1"
                        aria-label="Giảm số lượng"
                        @click="changeQuantity(item, item.quantity - 1)"
                      >
                        -
                      </button>
                      <input
                        :value="item.quantity"
                        class="h-9 w-12 border-x border-black/15 text-center font-bold outline-none focus-visible:bg-black/5"
                        inputmode="numeric"
                        aria-label="Số lượng"
                        @change="onQuantityChange(item, $event)"
                      />
                      <button
                        type="button"
                        class="h-9 w-9 font-black transition hover:bg-black hover:text-white disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent disabled:hover:text-black"
                        :disabled="item.stock > 0 && item.quantity >= item.stock"
                        aria-label="Tăng số lượng"
                        @click="changeQuantity(item, item.quantity + 1)"
                      >
                        +
                      </button>
                    </div>
                  </div>
                  <div>
                    <p class="text-black/45">Đơn giá</p>
                    <p class="mt-1 font-bold text-black">
                      {{ item.sku ? money(item.unitPrice) : '—' }}
                    </p>
                  </div>
                  <div>
                    <p class="text-black/45">Thành tiền</p>
                    <p class="mt-1 font-black text-black">
                      {{ item.sku ? money(item.subtotal) : '—' }}
                    </p>
                  </div>
                </div>
              </div>
            </article>
          </div>
        </div>

        <UiForm
          as="form"
          class="border border-black/10 bg-white p-4 sm:p-5"
          novalidate
          @submit.prevent="submitOrder"
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
                autocomplete="name"
                required
                :aria-invalid="Boolean(errors.fullName) || undefined"
                @input="clearError('fullName')"
              />
              <p v-if="errors.fullName" class="mt-1 text-sm font-semibold text-red-600">
                {{ errors.fullName }}
              </p>
            </div>
            <div>
              <UiInput
                v-model="form.phone"
                name="phone"
                type="tel"
                label="Số điện thoại"
                placeholder="0901234567"
                autocomplete="tel"
                required
                :aria-invalid="Boolean(errors.phone) || undefined"
                @input="clearError('phone')"
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
              autocomplete="email"
              :aria-invalid="Boolean(errors.email) || undefined"
              @input="clearError('email')"
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
              autocomplete="street-address"
              required
              :aria-invalid="Boolean(errors.address) || undefined"
              @input="clearError('address')"
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
              <span class="text-black/55">
                Giảm giá<span v-if="coupon?.code" class="text-black/40"> ({{ coupon.code }})</span>
              </span>
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

          <form
            class="mt-5 grid items-end gap-3 sm:grid-cols-[1fr_auto] lg:grid-cols-1"
            @submit.prevent="applyCoupon"
          >
            <UiInput v-model="couponCode" name="coupon" placeholder="Nhập mã" label="Mã giảm giá" />
            <UiButton native-type="submit" variant="outline" :loading="checkingCoupon">
              {{ couponCode.trim() || !coupon ? 'Áp dụng' : 'Bỏ mã' }}
            </UiButton>
          </form>
          <p
            v-if="couponMessage"
            class="mt-2 text-sm font-semibold"
            :class="couponMessageClass"
            role="status"
          >
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
            @click="submitOrder"
          >
            Đặt hàng
          </UiButton>
          <p class="mt-3 text-xs leading-5 text-black/45">
            Thanh toán khi nhận hàng (COD). Shop sẽ gọi xác nhận trước khi giao.
          </p>
        </section>
      </aside>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
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
import { isNotFoundError } from '@/composables/useNotFoundStatus'
import { useToast } from '@/composables/useToast'
import { resolveFileUrl } from '@/lib/fileUrl'
import { productApi } from '@/modules/catalog/product/api'
import {
  isDefaultSize,
  isSellableStatus,
  skuEffectivePrice,
  skuSizeLabel,
} from '@/modules/catalog/product/helpers'
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
  quantity: number
  stock: number
  unitPrice: number
  subtotal: number
  sizeLabel: string
  variantLabel: string
  issue: string
}

type CheckoutField = 'fullName' | 'phone' | 'email' | 'address'
type CheckoutErrors = Partial<Record<CheckoutField, string>>

const UNAVAILABLE_PRODUCT_MESSAGE = 'Sản phẩm không còn được bán, vui lòng xóa khỏi giỏ hàng.'
const COUPON_REVALIDATE_DELAY_MS = 400

const router = useRouter()
const toast = useToast()
const { items, coupon, setQuantity, removeItem, setCoupon, clearCart } = useCart()

const cartReady = ref(false)
const initialLoaded = ref(false)
const loadingCount = ref(0)
const pageError = ref('')
const submitError = ref('')
const submitting = ref(false)
const checkingCoupon = ref(false)
const couponCode = ref('')
const couponMessage = ref('')
const couponMessageType = ref<'ok' | 'error'>('ok')
const productsBySlug = ref<Record<string, Product>>({})
const unavailableSlugs = ref<Record<string, string>>({})
const inflightSlugs = new Set<string>()
let couponCheckToken = 0
let couponTimer: ReturnType<typeof setTimeout> | undefined

const form = reactive({
  fullName: '',
  phone: '',
  email: '',
  address: '',
  note: '',
})
const errors = reactive<CheckoutErrors>({})

const loadingProducts = computed(() => loadingCount.value > 0)
const showSkeleton = computed(
  () => !initialLoaded.value && (!cartReady.value || items.value.length > 0),
)
// Danh sách slug (không phụ thuộc số lượng) để chỉ tải lại khi thêm/bớt sản phẩm.
const cartSlugs = computed(() =>
  [...new Set(items.value.map((item) => item.slug).filter(Boolean))].sort(),
)

const cartItems = computed<EnrichedCartItem[]>(() =>
  items.value.map((cart) => {
    const product = productsBySlug.value[cart.slug] || null
    const sku = cart.skuId
      ? asArray(product?.skus).find((item) => item.id === cart.skuId) || null
      : null
    const variant = findVariant(product, sku)
    const quantity = Math.max(1, Math.trunc(Number(cart.quantity || 1)))
    const stock = Math.max(0, Number(sku?.stock || 0))
    const unitPrice = sku ? skuEffectivePrice(sku) : 0

    return {
      cart,
      product,
      sku,
      variant,
      imageUrl: resolveItemImage(product, variant),
      quantity,
      stock,
      unitPrice,
      subtotal: unitPrice * quantity,
      sizeLabel: sku && !isDefaultSize(sku) ? skuSizeLabel(sku) : '',
      variantLabel: variant?.colorName || variant?.name || '',
      issue: itemIssue(cart, product, sku, quantity, stock),
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
const hasItemIssues = computed(() => cartItems.value.some((item) => item.issue))
const submitDisabled = computed(
  () => submitting.value || !cartItems.value.length || loadingProducts.value,
)
const couponMessageClass = computed(() =>
  couponMessageType.value === 'error' ? 'text-red-600' : 'text-emerald-600',
)

watch(
  coupon,
  (nextCoupon) => {
    if (nextCoupon?.code) couponCode.value = nextCoupon.code
  },
  { immediate: true },
)

watch(cartSlugs, () => {
  if (cartReady.value) void loadProducts()
})

// Số tiền giảm phụ thuộc tạm tính: khi giỏ hàng thay đổi thì kiểm tra lại mã đang áp dụng,
// tránh hiển thị tổng tiền khác với số BE tính khi tạo đơn.
watch([subtotal, initialLoaded], () => {
  if (!initialLoaded.value || !coupon.value?.code) return
  clearTimeout(couponTimer)
  couponTimer = setTimeout(() => void revalidateCoupon(), COUPON_REVALIDATE_DELAY_MS)
})

function itemIssue(
  cart: CartItem,
  product: Product | null,
  sku: ProductSku | null,
  quantity: number,
  stock: number,
) {
  if (!cart.skuId) return 'Sản phẩm này thiếu thông tin phân loại, vui lòng xóa và chọn lại.'
  if (unavailableSlugs.value[cart.slug]) return unavailableSlugs.value[cart.slug] || ''
  if (!product) {
    return loadingProducts.value || !initialLoaded.value
      ? ''
      : 'Chưa tải được thông tin sản phẩm, vui lòng thử lại.'
  }
  if (!sku || !isSellableStatus(sku.status)) return 'Phân loại này không còn được bán.'
  if (stock <= 0) return 'Sản phẩm đã hết hàng.'
  if (quantity > stock) return `Chỉ còn ${stock} sản phẩm, vui lòng giảm số lượng.`
  return ''
}

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

function clearError(field: CheckoutField) {
  if (errors[field]) errors[field] = ''
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

function focusField(field: CheckoutField) {
  window.requestAnimationFrame(() => {
    const input = document.querySelector<HTMLElement>(`[name="${field}"]`)
    input?.focus()
  })
}

function changeQuantity(item: EnrichedCartItem, quantity: number) {
  const maxQuantity = item.stock > 0 ? item.stock : Number.POSITIVE_INFINITY
  setQuantity(item.cart.id, Math.min(Math.max(1, quantity), maxQuantity))
}

function onQuantityChange(item: EnrichedCartItem, event: Event) {
  const input = event.target as HTMLInputElement
  changeQuantity(item, Math.trunc(Number(input.value)) || 1)
  // Giá trị bị chặn (nhỏ hơn 1 hoặc vượt tồn kho) có thể trùng giá trị cũ nên ô nhập không
  // tự cập nhật lại: đồng bộ thủ công với số lượng thật trong giỏ.
  const current = items.value.find((cartItem) => cartItem.id === item.cart.id)
  input.value = String(current?.quantity ?? item.quantity)
}

// Chỉ tải sản phẩm chưa có (hoặc tải lại tất cả khi force); lỗi từng sản phẩm không làm hỏng
// cả giỏ hàng.
async function loadProducts(options: { force?: boolean } = {}) {
  const targets = cartSlugs.value.filter(
    (slug) =>
      !inflightSlugs.has(slug) &&
      (options.force || (!productsBySlug.value[slug] && !unavailableSlugs.value[slug])),
  )
  if (!targets.length) {
    if (!inflightSlugs.size) initialLoaded.value = true
    return
  }

  targets.forEach((slug) => inflightSlugs.add(slug))
  loadingCount.value += 1
  pageError.value = ''

  try {
    const results = await Promise.allSettled(targets.map((slug) => productApi.detail(slug)))
    const nextProducts = { ...productsBySlug.value }
    const nextUnavailable = { ...unavailableSlugs.value }
    let networkError = ''

    results.forEach((result, index) => {
      const slug = targets[index]!
      if (result.status === 'fulfilled' && result.value) {
        nextProducts[slug] = result.value
        delete nextUnavailable[slug]
        return
      }
      if (result.status === 'rejected' && !isNotFoundError(result.reason)) {
        networkError = getErrorMessage(result.reason)
        return
      }
      delete nextProducts[slug]
      nextUnavailable[slug] = UNAVAILABLE_PRODUCT_MESSAGE
    })

    productsBySlug.value = nextProducts
    unavailableSlugs.value = nextUnavailable
    if (networkError) pageError.value = `Không tải được thông tin sản phẩm: ${networkError}`
  } finally {
    targets.forEach((slug) => inflightSlugs.delete(slug))
    loadingCount.value -= 1
    if (!inflightSlugs.size) initialLoaded.value = true
  }
}

async function revalidateCoupon() {
  const current = coupon.value
  if (!current?.code || subtotal.value <= 0) return

  const token = ++couponCheckToken
  try {
    const data = await couponApi.validate({ code: current.code, subtotalAmount: subtotal.value })
    if (token !== couponCheckToken) return

    if (!data.valid) {
      setCoupon(null)
      couponMessageType.value = 'error'
      couponMessage.value = `Mã ${current.code} không còn áp dụng: ${data.message || 'không hợp lệ'}.`
      return
    }

    const nextDiscount = Number(data.discountAmount || 0)
    if (nextDiscount !== current.discountAmount) {
      setCoupon({ code: current.code, discountAmount: nextDiscount })
      couponMessageType.value = 'ok'
      couponMessage.value = `Đã cập nhật mức giảm theo giỏ hàng: ${money(nextDiscount)}.`
    }
  } catch {
    // Không kiểm tra lại được thì giữ nguyên; BE vẫn tính lại mã khi tạo đơn.
  }
}

async function applyCoupon() {
  const code = couponCode.value.trim()
  couponMessage.value = ''
  couponCheckToken += 1

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
      couponMessage.value = data.message || 'Mã giảm giá không hợp lệ.'
      return
    }

    setCoupon({ code, discountAmount: Number(data.discountAmount || 0) })
    couponMessageType.value = 'ok'
    couponMessage.value = data.message || `Mã hợp lệ, giảm ${money(data.discountAmount)}.`
  } catch (error) {
    couponMessageType.value = 'error'
    couponMessage.value = getErrorMessage(error)
  } finally {
    checkingCoupon.value = false
  }
}

async function submitOrder() {
  if (submitting.value) return
  submitError.value = ''

  if (!cartItems.value.length) return
  if (!validateForm()) return
  if (hasItemIssues.value) {
    submitError.value =
      'Vui lòng xử lý các sản phẩm được đánh dấu trong giỏ hàng trước khi đặt hàng.'
    return
  }

  submitting.value = true
  try {
    const { order } = await orderApi.create({
      customerName: form.fullName.trim(),
      customerPhone: form.phone.trim(),
      customerEmail: form.email.trim() || undefined,
      shippingAddress: form.address.trim(),
      note: form.note.trim() || undefined,
      couponCode: coupon.value?.code || undefined,
      paymentMethod: 'COD',
      shippingMethod: 'STANDARD',
      shippingFee: shippingFee.value,
      items: cartItems.value.map((item) => ({
        skuId: item.cart.skuId || '',
        quantity: item.quantity,
      })),
    })

    clearCart()
    toast.push('Shop đã nhận thông tin và sẽ liên hệ xác nhận.', 'success', 'Đặt hàng thành công')
    await router.push({
      name: 'order-success',
      query: { code: order.orderCode || order.id },
    })
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
  cartReady.value = true
  void loadProducts()
})

onBeforeUnmount(() => {
  clearTimeout(couponTimer)
})
</script>
