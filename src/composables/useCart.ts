import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Product, ProductFeatured, ProductSku } from '@/modules/catalog/product/types'

const CART_KEY = 'ffs-cart'
const CART_COUPON_KEY = 'ffs-cart-coupon'
const CART_UPDATED_EVENT = 'ffs-cart-updated'

export type CartItem = {
  id: string
  productId: string
  skuId?: string
  slug: string
  name: string
  quantity: number
}

export type CartCoupon = {
  code: string
  discountAmount: number
}

function readCart(): CartItem[] {
  if (typeof window === 'undefined') return []
  try {
    const value = window.localStorage.getItem(CART_KEY)
    const parsed = value ? JSON.parse(value) : []
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function readCoupon(): CartCoupon | null {
  if (typeof window === 'undefined') return null
  try {
    const value = window.localStorage.getItem(CART_COUPON_KEY)
    const parsed = value ? JSON.parse(value) : null
    if (!parsed || typeof parsed !== 'object') return null

    const row = parsed as Partial<CartCoupon>
    return row.code
      ? { code: String(row.code), discountAmount: Number(row.discountAmount || 0) }
      : null
  } catch {
    return null
  }
}

function writeCart(items: CartItem[]) {
  if (typeof window === 'undefined') return
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}

function writeCoupon(coupon: CartCoupon | null) {
  if (typeof window === 'undefined') return
  if (coupon?.code) {
    window.localStorage.setItem(CART_COUPON_KEY, JSON.stringify(coupon))
  } else {
    window.localStorage.removeItem(CART_COUPON_KEY)
  }
  window.dispatchEvent(new CustomEvent(CART_UPDATED_EVENT))
}

export function addToCart(product: Product | ProductFeatured, sku?: ProductSku | null) {
  if (typeof window === 'undefined') return
  const productId = product.id || product.slug
  const skuId = sku?.id
  const id = skuId ? `${productId}:${skuId}` : productId
  const items = readCart()
  const existing = items.find((item) => item.id === id)

  if (existing) {
    existing.quantity += 1
  } else {
    items.push({
      id,
      productId,
      skuId,
      slug: product.slug,
      name: product.name,
      quantity: 1,
    })
  }

  writeCart(items)
}

export function useCart() {
  const items = ref<CartItem[]>([])
  const coupon = ref<CartCoupon | null>(null)

  function refresh() {
    items.value = readCart()
    coupon.value = readCoupon()
  }

  function setQuantity(itemId: string, quantity: number) {
    const nextQuantity = Math.max(1, Math.trunc(Number(quantity) || 1))
    writeCart(
      readCart().map((item) => (item.id === itemId ? { ...item, quantity: nextQuantity } : item)),
    )
    refresh()
  }

  function removeItem(itemId: string) {
    writeCart(readCart().filter((item) => item.id !== itemId))
    refresh()
  }

  function setCoupon(nextCoupon: CartCoupon | null) {
    writeCoupon(nextCoupon)
    refresh()
  }

  function clearCart() {
    writeCart([])
    writeCoupon(null)
    refresh()
  }

  onMounted(() => {
    refresh()
    window.addEventListener(CART_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
  })

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener(CART_UPDATED_EVENT, refresh)
    window.removeEventListener('storage', refresh)
  })

  return { items, coupon, refresh, setQuantity, removeItem, setCoupon, clearCart }
}

export function useCartCount() {
  const totalQuantity = ref(0)

  function refresh() {
    totalQuantity.value = readCart().reduce((total, item) => total + item.quantity, 0)
  }

  onMounted(() => {
    refresh()
    window.addEventListener(CART_UPDATED_EVENT, refresh)
    window.addEventListener('storage', refresh)
  })

  onBeforeUnmount(() => {
    if (typeof window === 'undefined') return
    window.removeEventListener(CART_UPDATED_EVENT, refresh)
    window.removeEventListener('storage', refresh)
  })

  return { totalQuantity, refresh }
}
