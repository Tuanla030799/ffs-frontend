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
export interface CouponValidation {
  valid: boolean
  discountAmount?: number
  message?: string
  coupon?: Coupon
}
