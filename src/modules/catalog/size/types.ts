import type { Status } from '@/modules/shared/types'

export interface ProductSize {
  id: string
  value: string
  label?: string
  status: Status
  sortOrder?: number
  createdAt?: string
}

export interface ProductSizePayload {
  value: string
  label?: string
  status: Status
  sortOrder?: number
}
