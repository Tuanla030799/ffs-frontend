import type { ProductFeatured } from '@/modules/catalog/product/types'
import type { Status } from '@/modules/shared/types'

export interface Collection {
  id: string
  name: string
  slug: string
  excerpt?: string
  descriptionHtml?: string | null
  descriptionJson?: unknown
  fileId?: string
  coverUrl?: string
  imageUrl?: string
  status: Status
  sortOrder?: number
  productCount?: number
  products?: ProductFeatured[]
  createdAt?: string
}

export type CollectionDetail = Collection

export interface CollectionListQuery {
  keyword?: string
  status?: string
  page?: number
  limit?: number
}

export interface CollectionPayload {
  name: string
  slug?: string
  excerpt?: string
  descriptionHtml?: string
  descriptionJson?: unknown
  fileId?: string
  status: 'ACTIVE' | 'INACTIVE' | string
  sortOrder?: number
  products: Array<{
    productId: string
    sortOrder: number
  }>
}
