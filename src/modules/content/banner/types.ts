import type { Status } from '@/modules/shared/types'
export interface LandingBanner {
  id: string
  title: string
  subtitle?: string
  // Link nút "Buy now" (đỏ) và nút "Download a PDF" (đen); trống thì trang chủ dùng link mặc định.
  linkUrl?: string | null
  pdfUrl?: string | null
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
