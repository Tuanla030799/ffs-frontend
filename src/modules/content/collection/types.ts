import type { Product } from '@/modules/catalog/product/types'
import type { Status } from '@/modules/shared/types'

export interface CollectionProduct {
  productId: string
  sortOrder: number
  product?: Product
}

export interface Collection {
  id: string
  name: string
  slug: string
  description?: string
  descriptionJson?: unknown
  fileId?: string
  coverUrl?: string
  imageUrl?: string
  status: Status
  sortOrder?: number
  productCount?: number
  products?: CollectionProduct[]
  createdAt?: string
}

export interface CollectionListQuery {
  keyword?: string
  status?: string
  page?: number
  limit?: number
}

export interface CollectionPayload {
  name: string
  slug?: string
  description?: string
  descriptionJson?: string
  fileId?: string
  status: 'ACTIVE' | 'INACTIVE' | string
  sortOrder?: number
  products: Array<{
    productId: string
    sortOrder: number
  }>
}
