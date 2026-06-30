import type { ListQuery, Status } from '@/modules/shared/types'

export interface Brand {
  id: string
  name: string
  slug: string
  description?: string
  fileId?: string
  imageUrl?: string
  status: Status
  sortOrder?: number
  createdAt?: string
  fileSizeId?: string
  sizeGuideImageUrl?: string
}

export type BrandListQuery = ListQuery

export interface BrandPayload {
  name: string
  slug?: string
  description?: string
  fileId?: string
  status: 'ACTIVE' | 'INACTIVE' | string
  sortOrder?: number
  fileSizeId?: string
}
