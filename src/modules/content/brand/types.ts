import type { Status } from '@/modules/shared/types'

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
}

export interface BrandListQuery {
  keyword?: string
  status?: string
}

export interface BrandPayload {
  name: string
  slug?: string
  description?: string
  fileId?: string
  status: 'ACTIVE' | 'INACTIVE' | string
  sortOrder?: number
}
