import { normalizeRichTextInput } from '@/lib/richText'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import type { Product, ProductImage, ProductPayload, ProductSku, ProductVariant } from './types'

// Trạng thái form tạo/sửa sản phẩm trong admin. SKU được gom vào đúng màu (variant) của nó để
// người dùng nhập "màu + giá + tồn kho" một chỗ; khi lưu mới tách lại thành variants/skus như API.

export type ProductImageDraft = {
  key: string
  fileId: string
  url: string
  altText: string
  isPrimary: boolean
}

export type ProductSkuDraft = {
  key: string
  id?: string
  skuCode: string
  sizeId: string
  size: string
  price: number | null
  salePrice: number | null
  stock: number | null
  status: string
}

export type ProductVariantDraft = {
  key: string
  id?: string
  clientId: string
  name: string
  colorId: string
  image: { fileId: string; url: string } | null
  status: string
  skus: ProductSkuDraft[]
}

export type ProductDraft = {
  categoryId: string
  brandId: string
  gender: string
  name: string
  slug: string
  shortDescription: string
  descriptionHtml: string
  status: string
  isFeatured: boolean
  featuredOrder: number | null
  images: ProductImageDraft[]
  variants: ProductVariantDraft[]
  // SKU dữ liệu cũ không gắn với màu nào: vẫn hiển thị và gửi lại để không mất dữ liệu.
  unassignedSkus: ProductSkuDraft[]
}

export type ProductDraftErrors = Record<string, string>

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/
export const SHORT_DESCRIPTION_RECOMMENDED_LENGTH = 160

function newKey() {
  return crypto.randomUUID()
}

export function createSkuDraft(): ProductSkuDraft {
  return {
    key: newKey(),
    skuCode: '',
    sizeId: '',
    size: '',
    price: null,
    salePrice: null,
    stock: null,
    status: 'ACTIVE',
  }
}

// Mỗi màu mới có sẵn một SKU (size mặc định) vì cửa hàng không bán theo size.
export function createVariantDraft(): ProductVariantDraft {
  const clientId = newKey()
  return {
    key: clientId,
    clientId,
    name: '',
    colorId: '',
    image: null,
    status: 'ACTIVE',
    skus: [createSkuDraft()],
  }
}

export function createProductDraft(
  defaults: Partial<Pick<ProductDraft, 'categoryId' | 'brandId' | 'gender' | 'status'>> = {},
): ProductDraft {
  return {
    categoryId: '',
    brandId: '',
    gender: 'UNISEX',
    name: '',
    slug: '',
    shortDescription: '',
    descriptionHtml: '',
    status: 'ACTIVE',
    isFeatured: false,
    featuredOrder: null,
    images: [],
    variants: [createVariantDraft()],
    unassignedSkus: [],
    ...defaults,
  }
}

function toSkuDraft(sku: ProductSku): ProductSkuDraft {
  return {
    key: sku.id || newKey(),
    id: sku.id || undefined,
    skuCode: sku.skuCode || '',
    sizeId: sku.sizeId || '',
    size: sku.size || '',
    price: sku.price ?? null,
    salePrice: sku.salePrice ?? null,
    stock: sku.stock ?? null,
    status: sku.status || 'ACTIVE',
  }
}

function toVariantDraft(variant: ProductVariant): ProductVariantDraft {
  const clientId = variant.clientId || newKey()
  return {
    key: variant.id || clientId,
    id: variant.id || undefined,
    clientId,
    name: variant.name || '',
    colorId: variant.colorId || '',
    image: variant.imageFileId
      ? { fileId: variant.imageFileId, url: variant.imageUrl || '' }
      : null,
    status: variant.status || 'ACTIVE',
    skus: [],
  }
}

// Ảnh đầu tiên luôn là ảnh chính: danh sách sản phẩm dùng ảnh chính làm ảnh đại diện còn trang
// sản phẩm hiển thị ảnh theo thứ tự, giữ hai thứ này trùng nhau để hai nơi không lệch ảnh.
export function normalizeImageDrafts(images: ProductImageDraft[]) {
  return images.map((image, index) => ({ ...image, isPrimary: index === 0 }))
}

export function imageDraftFromUpload(file: {
  fileId: string | number
  url?: string
  path?: string
}) {
  return {
    key: newKey(),
    fileId: String(file.fileId),
    url: file.url || file.path || '',
    altText: '',
    isPrimary: false,
  } satisfies ProductImageDraft
}

export function productToDraft(row: Product): ProductDraft {
  const bySortOrder = <T extends { sortOrder?: number }>(a: T, b: T) =>
    (a.sortOrder ?? 0) - (b.sortOrder ?? 0)

  const variants = [...(row.variants || [])].sort(bySortOrder).map(toVariantDraft)
  const unassignedSkus: ProductSkuDraft[] = []
  for (const sku of row.skus || []) {
    const owner = variants.find(
      (variant) =>
        (sku.variantId && variant.id === sku.variantId) ||
        (sku.variantClientId && variant.clientId === sku.variantClientId),
    )
    if (owner) owner.skus.push(toSkuDraft(sku))
    else unassignedSkus.push(toSkuDraft(sku))
  }

  const images = [...(row.images || [])]
    .sort(bySortOrder)
    .map((image: ProductImage): ProductImageDraft => ({
      key: image.id || image.fileId || newKey(),
      fileId: image.fileId || '',
      url: image.url || image.imageUrl || '',
      altText: image.altText || '',
      isPrimary: Boolean(image.isPrimary),
    }))
  // Dữ liệu cũ có ảnh chính không đứng đầu thì đưa lên đầu để giữ đúng ảnh đại diện.
  const primaryIndex = images.findIndex((image) => image.isPrimary)
  if (primaryIndex > 0) images.unshift(...images.splice(primaryIndex, 1))

  return {
    categoryId: row.categoryId || '',
    brandId: row.brandId || '',
    gender: row.gender || 'UNISEX',
    name: row.name || '',
    slug: row.slug || '',
    shortDescription: row.shortDescription || '',
    descriptionHtml: normalizeRichTextInput(row.descriptionHtml),
    status: row.status || 'ACTIVE',
    isFeatured: Boolean(row.isFeatured),
    featuredOrder: row.featuredOrder ?? null,
    images: normalizeImageDrafts(images),
    variants,
    unassignedSkus,
  }
}

export function skuErrorKey(sku: ProductSkuDraft, field: keyof ProductSkuDraft) {
  return `sku.${sku.key}.${field}`
}

export function variantErrorKey(variant: ProductVariantDraft, field: string) {
  return `variant.${variant.key}.${field}`
}

// Trả về lỗi theo từng trường, theo thứ tự từ trên xuống của form (dùng để focus lỗi đầu tiên).
export function validateProductDraft(draft: ProductDraft): ProductDraftErrors {
  const errors: ProductDraftErrors = {}
  const slug = draft.slug.trim()

  if (!draft.name.trim()) errors.name = 'Nhập tên sản phẩm.'
  if (!draft.categoryId) errors.categoryId = 'Chọn danh mục.'
  if (!slug) errors.slug = 'Nhập đường dẫn.'
  else if (!SLUG_PATTERN.test(slug)) {
    errors.slug = 'Đường dẫn chỉ gồm chữ thường không dấu, số và dấu gạch ngang.'
  }

  const allSkus = [...draft.variants.flatMap((variant) => variant.skus), ...draft.unassignedSkus]
  if (!allSkus.length) errors.variants = 'Thêm ít nhất một màu kèm giá bán.'

  const codeCounts = new Map<string, number>()
  for (const sku of allSkus) {
    const code = sku.skuCode.trim().toUpperCase()
    if (code) codeCounts.set(code, (codeCounts.get(code) || 0) + 1)
  }

  // Thứ tự kiểm tra trùng thứ tự hiển thị (giá, khuyến mãi, tồn kho, mã SKU).
  const validateSku = (sku: ProductSkuDraft) => {
    if (!sku.price || sku.price <= 0) errors[skuErrorKey(sku, 'price')] = 'Nhập giá bán lớn hơn 0.'
    if (sku.salePrice && sku.price && sku.salePrice >= sku.price) {
      errors[skuErrorKey(sku, 'salePrice')] = 'Giá khuyến mãi phải nhỏ hơn giá bán.'
    }

    if (sku.stock === null || Number.isNaN(sku.stock)) {
      errors[skuErrorKey(sku, 'stock')] = 'Nhập số lượng tồn kho.'
    } else if (sku.stock < 0 || !Number.isInteger(sku.stock)) {
      errors[skuErrorKey(sku, 'stock')] = 'Tồn kho phải là số nguyên không âm.'
    }

    const code = sku.skuCode.trim()
    if (!code) errors[skuErrorKey(sku, 'skuCode')] = 'Nhập mã SKU.'
    else if ((codeCounts.get(code.toUpperCase()) || 0) > 1) {
      errors[skuErrorKey(sku, 'skuCode')] = 'Mã SKU bị trùng với một màu khác.'
    }
  }

  for (const variant of draft.variants) {
    if (!variant.colorId) errors[variantErrorKey(variant, 'colorId')] = 'Chọn màu.'
    if (!variant.skus.length) {
      errors[variantErrorKey(variant, 'skus')] = 'Màu này chưa có giá bán và tồn kho.'
    }
    variant.skus.forEach(validateSku)
  }
  draft.unassignedSkus.forEach(validateSku)

  if (draft.isFeatured && draft.featuredOrder !== null && draft.featuredOrder < 0) {
    errors.featuredOrder = 'Thứ tự phải là số không âm.'
  }

  return errors
}

// Gợi ý mã SKU khi không có mã của nhà cung cấp: đường dẫn sản phẩm + tên màu, viết hoa.
export function suggestSkuCode(slug: string, colorLabel = '') {
  return [slug, colorLabel]
    .map((part) =>
      part
        .normalize('NFD')
        .replace(/[̀-ͯ]/g, '')
        .replace(/đ/gi, 'd')
        .replace(/[^a-z0-9]+/gi, '-')
        .replace(/^-+|-+$/g, ''),
    )
    .filter(Boolean)
    .join('-')
    .toUpperCase()
    .slice(0, 48)
}

function skuPayload(sku: ProductSkuDraft, variant?: ProductVariantDraft) {
  return {
    id: sku.id || null,
    variantId: variant?.id || null,
    variantClientId: variant && !variant.id ? variant.clientId : null,
    skuCode: sku.skuCode.trim(),
    sizeId: sku.sizeId || undefined,
    price: Number(sku.price || 0),
    // Giá khuyến mãi để trống hoặc bằng 0 nghĩa là không giảm giá.
    salePrice: sku.salePrice ? Number(sku.salePrice) : null,
    stock: Number(sku.stock || 0),
    status: sku.status || 'ACTIVE',
  }
}

export function draftToPayload(
  draft: ProductDraft,
  options: { colorLabel: (colorId: string) => string },
): ProductPayload {
  const productName = draft.name.trim()
  const images = normalizeImageDrafts(draft.images)

  return {
    categoryId: draft.categoryId,
    brandId: draft.brandId || null,
    gender: draft.gender || 'UNISEX',
    name: productName,
    slug: draft.slug.trim(),
    shortDescription: draft.shortDescription.trim(),
    descriptionHtml: sanitizeHtml(draft.descriptionHtml || ''),
    status: draft.status || 'ACTIVE',
    isFeatured: draft.isFeatured,
    featuredOrder: Number(draft.featuredOrder || 0),
    images: images.map((image, index) => ({
      fileId: image.fileId,
      // Alt để trống thì dùng tên sản phẩm (cho SEO và trình đọc màn hình).
      altText: image.altText.trim() || productName,
      imageType: image.isPrimary ? 'MAIN' : 'GALLERY',
      sortOrder: index,
      isPrimary: image.isPrimary,
    })),
    variants: draft.variants.map((variant, index) => ({
      id: variant.id || null,
      clientId: variant.clientId,
      // Tên phân loại để trống thì dùng tên màu.
      name: variant.name.trim() || options.colorLabel(variant.colorId) || productName,
      colorId: variant.colorId,
      imageFileId: variant.image?.fileId || null,
      status: variant.status || 'ACTIVE',
      sortOrder: index,
    })),
    skus: [
      ...draft.variants.flatMap((variant) => variant.skus.map((sku) => skuPayload(sku, variant))),
      ...draft.unassignedSkus.map((sku) => skuPayload(sku)),
    ],
  }
}
