import type { Status } from '@/modules/shared/types'

export interface ProductColor {
  id: string
  value?: string
  label?: string
  name: string
  colorCode?: string | null
  status: Status
  sortOrder?: number
  createdAt?: string
}

export interface ProductColorPayload {
  name: string
  colorCode?: string | null
  status: Status
  sortOrder?: number
}
