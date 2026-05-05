import type { Status } from '@/modules/shared/types'
export interface Category {
  id: string
  parentId?: string | null
  name: string
  slug: string
  description?: string
  status: Status
  sortOrder?: number
  imageUrl?: string
}
export interface CategoryPayload {
  parentId?: string | null
  name: string
  slug: string
  description?: string
  status: Status
  sortOrder?: number
}
