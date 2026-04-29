import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated, type ListQuery } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { Coupon, CouponPayload, CouponValidatePayload, CouponValidation } from './types'
export const couponApi = {
  async validate(payload: CouponValidatePayload) { const res = await httpClient.post<ApiEnvelope<CouponValidation>>('/api/coupons/validate', payload); return res.data.data },
  async adminList(params?: ListQuery) { const res = await httpClient.get<ApiEnvelope<unknown>>('/api/admin/coupons', { params }); return unwrapList<Coupon>(res.data.data, params?.page, params?.limit) as Paginated<Coupon> },
  async create(payload: CouponPayload) { const res = await httpClient.post<ApiEnvelope<Coupon>>('/api/admin/coupons', payload); return res.data.data },
  async update(id: string, payload: CouponPayload) { const res = await httpClient.put<ApiEnvelope<Coupon>>(`/api/admin/coupons/${id}`, payload); return res.data.data },
  async remove(id: string) { await httpClient.delete(`/api/admin/coupons/${id}`) },
}
