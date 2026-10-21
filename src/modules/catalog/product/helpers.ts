import type { Product, ProductFeatured, ProductSku } from './types'

const PRODUCT_GENDER_LABELS: Record<string, string> = {
  MALE: 'Nam',
  FEMALE: 'Nữ',
  UNISEX: 'Unisex',
}

export function productGenderLabel(gender?: string | null) {
  if (!gender) return ''
  return PRODUCT_GENDER_LABELS[gender.toUpperCase()] || gender
}

// Biến thể/SKU chỉ được bán khi đang ACTIVE (API có thể trả cả bản ghi đã ẩn).
export function isSellableStatus(status?: string | null) {
  return !status || status.toUpperCase() === 'ACTIVE'
}

// Giá thực trả của một SKU: salePrice chỉ có hiệu lực khi > 0 và nhỏ hơn giá gốc.
export function skuEffectivePrice(sku: Pick<ProductSku, 'price' | 'salePrice'>) {
  const price = Number(sku.price || 0)
  const salePrice = Number(sku.salePrice)
  return sku.salePrice !== null && sku.salePrice !== undefined && salePrice > 0 && salePrice < price
    ? salePrice
    : price
}

export function isDefaultSize(sku: Pick<ProductSku, 'size'>) {
  return !sku.size || /^default$/i.test(sku.size.trim())
}

export function skuSizeLabel(sku: Pick<ProductSku, 'size'>) {
  return isDefaultSize(sku) ? 'Mặc định' : sku.size.trim()
}

// Giá hiển thị ở danh sách: API list trả minSalePrice/minPrice, API chi tiết trả price/salePrice.
export function productListPrice(product: Product | ProductFeatured) {
  return Number(
    product.minSalePrice ||
      product.minPrice ||
      ('salePrice' in product ? product.salePrice : 0) ||
      ('price' in product ? product.price : 0) ||
      0,
  )
}
