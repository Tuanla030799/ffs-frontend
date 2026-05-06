import { onBeforeUnmount, onMounted, ref } from 'vue'
import type { Product, ProductFeatured, ProductSku } from '@/modules/catalog/product/types'

const CART_KEY = 'ffs-cart'
const CART_UPDATED_EVENT = 'ffs-cart-updated'

type CartItem = {
  id: string
  productId: string
  skuId?: string
  slug: string
  name: string
  quantity: number
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

function writeCart(items: CartItem[]) {
  window.localStorage.setItem(CART_KEY, JSON.stringify(items))
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
    window.removeEventListener(CART_UPDATED_EVENT, refresh)
    window.removeEventListener('storage', refresh)
  })

  return { totalQuantity, refresh }
}
