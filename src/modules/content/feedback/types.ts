import type { Status } from '@/modules/shared/types'

// Ảnh feedback của khách hiển thị ở trang chủ. Thường chỉ có ảnh; tên khách và mô tả tuỳ chọn.
export interface CustomerFeedback {
  id: string
  fileId: string
  imageUrl?: string | null
  customerName?: string | null
  description?: string | null
  sortOrder: number
  status: Status
  createdAt?: string
  updatedAt?: string
}

export interface CustomerFeedbackListQuery {
  status?: string
  page?: number
  limit?: number
}

export interface CustomerFeedbackPayload {
  fileId: string
  customerName: string | null
  description: string | null
  sortOrder: number
  status: Status
}
