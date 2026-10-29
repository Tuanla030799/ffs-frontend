import type { Status } from '@/modules/shared/types'
export interface LandingBanner {
  id: string
  title: string
  subtitle?: string
  linkUrl?: string
  fileId?: string
  imageUrl?: string
  // Ảnh dọc riêng cho điện thoại (tuỳ chọn); không có thì trang chủ cắt ảnh desktop.
  mobileFileId?: string | null
  mobileImageUrl?: string | null
  status: Status
  sortOrder?: number
  startsAt?: string
  endsAt?: string
}
export type LandingBannerPayload = Omit<LandingBanner, 'id' | 'imageUrl' | 'mobileImageUrl'>
