import type { Status } from '@/modules/shared/types'
export interface ProductImage {
  id?: string
  fileId?: string
  url?: string
  imageUrl?: string
  altText?: string
  imageType?: 'MAIN' | 'GALLERY' | string
  sortOrder?: number
  isPrimary?: boolean
}
export interface ProductVariant {
  id?: string
  clientId?: string
  name: string
  colorId?: string
  colorName?: string
  colorCode?: string
  imageFileId?: string
  imageUrl?: string
  status?: Status
  sortOrder?: number
}
export interface ProductSku {
  id?: string
  variantClientId?: string
  variantId?: string
  skuCode: string
  sizeId?: string
  size: string
  price: number
  salePrice?: number | null
  stock: number
  status?: Status
}
export type ProductPayload = Omit<
  Product,
  | 'id'
  | 'categoryName'
  | 'brandName'
  | 'brandSlug'
  | 'brandSizeGuideUrl'
  | 'price'
  | 'salePrice'
  | 'stock'
  | 'images'
  | 'variants'
  | 'skus'
> & {
  images?: Array<Omit<ProductImage, 'id' | 'url'>>
  variants?: Array<
    Omit<ProductVariant, 'id' | 'colorName' | 'colorCode' | 'imageFileId'> & {
      id?: string | null
      imageFileId?: string | null
    }
  >
  skus?: Array<
    Omit<ProductSku, 'id' | 'variantId' | 'variantClientId' | 'size'> & {
      id?: string | null
      variantId?: string | null
      variantClientId?: string | null
    }
  >
}
export type ProductGender = 'MALE' | 'FEMALE' | 'UNISEX' | string
export interface Product {
  id: string
  categoryId?: string
  categoryName?: string
  brandId?: string | null
  brandName?: string
  brandSlug?: string
  brandSizeGuideUrl?: string
  gender?: ProductGender
  name: string
  slug: string
  shortDescription?: string
  descriptionHtml?: string | null
  status: Status
  isFeatured?: boolean
  featuredOrder?: number
  images?: ProductImage[]
  variants?: ProductVariant[]
  skus?: ProductSku[]
  price?: number
  salePrice?: number
  stock?: number
  minPrice?: number
  minSalePrice?: number
  totalStock?: number
}

export interface ProductFeatured {
  id: string
  categoryId?: string
  categoryName?: string
  brandId?: string | null
  brandName?: string
  brandSlug?: string
  brandSizeGuideUrl?: string
  gender?: ProductGender
  name: string
  slug: string
  shortDescription?: string
  status: Status
  isFeatured?: boolean
  featuredOrder?: number
  minPrice: number
  minSalePrice: number
  totalStock: number
  primaryFileId: string
  primaryImageUrl: string
  createdAt: string
}

export interface ProductListQuery {
  categoryId?: string
  categorySlug?: string
  brandId?: string
  brandSlug?: string
  gender?: string
  keyword?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  page?: number
  limit?: number
  status?: string
}

export interface PublicProductListQuery extends Omit<
  ProductListQuery,
  'categoryId' | 'brandId' | 'gender' | 'size' | 'color' | 'status'
> {
  categoryId?: string[]
  brandId?: string[]
  gender?: string[]
  size?: string[]
  color?: string[]
}
