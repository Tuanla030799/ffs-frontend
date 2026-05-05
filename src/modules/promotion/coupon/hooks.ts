import { couponApi } from './api'
export function useCouponValidator() {
  return { validateCoupon: couponApi.validate }
}
