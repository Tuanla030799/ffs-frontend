import type { Status } from '@/modules/shared/types'
export interface Coupon {
  id: string
  code: string
  name: string
  discountType: 'PERCENT' | 'FIXED' | string
  discountValue: number
  maxDiscount?: number
  minOrderAmount?: number
  usageLimit?: number
  startsAt?: string
  endsAt?: string
  status: Status
}
export type CouponPayload = Omit<Coupon, 'id'>
export interface CouponValidatePayload {
  code: string
  subtotalAmount: number
}
// Mã không dùng được vẫn trả 200 với `valid: false`; `code` là lý do (COUPON_NOT_FOUND,
// COUPON_EXPIRED, COUPON_MIN_SUBTOTAL...) và `message` là câu tiếng Việt hiển thị được cho khách.
export interface CouponValidation {
  valid: boolean
  code: string | null
  message: string | null
  couponId: string | null
  // Mã đã chuẩn hoá (trim, viết hoa); chỉ có khi `valid`.
  couponCode: string | null
  discountAmount: number
  finalAmount: number
}
