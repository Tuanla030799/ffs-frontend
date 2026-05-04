import type { Status } from '@/modules/shared/types'
export interface ProductImage { id?: string; fileId?: string; url?: string; altText?: string; imageType?: 'MAIN' | 'GALLERY' | string; sortOrder?: number; isPrimary?: boolean }
export interface ProductVariant { id?: string; clientId?: string; name: string; colorName?: string; colorCode?: string; imageFileId?: string; imageUrl?: string; status?: Status; sortOrder?: number }
export interface ProductSku { id?: string; variantClientId?: string; variantId?: string; skuCode: string; size: string; price: number; salePrice?: number | null; stock: number; status?: Status }
export type ProductGender = 'MALE' | 'FEMALE' | 'UNISEX' | string
export interface Product { id: string; categoryId?: string; categoryName?: string; brandId?: string | null; brandName?: string; brandSlug?: string; gender?: ProductGender; name: string; slug: string; shortDescription?: string; descriptionJson?: unknown; status: Status; isFeatured?: boolean; featuredOrder?: number; images?: ProductImage[]; variants?: ProductVariant[]; skus?: ProductSku[]; price?: number; salePrice?: number; stock?: number }
export interface ProductListQuery { categoryId?: string; categorySlug?: string; brandId?: string; brandSlug?: string; gender?: string; keyword?: string; size?: string; color?: string; minPrice?: number; maxPrice?: number; page?: number; limit?: number; status?: string }
export type ProductPayload = Omit<Product, 'id' | 'categoryName' | 'brandName' | 'brandSlug' | 'price' | 'salePrice' | 'stock'>
