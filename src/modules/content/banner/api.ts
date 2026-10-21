import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated, type ListQuery } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { LandingBanner, LandingBannerPayload } from './types'
export const bannerApi = {
  // API trả về dạng phân trang ({ items, page, ... }), không phải mảng.
  async publicList() {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/landing-banners')
    return unwrapList<LandingBanner>(res.data.data).items
  },
  async adminList(params?: ListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/landing-banners', { params })
    return unwrapList<LandingBanner>(
      res.data.data,
      params?.page,
      params?.limit,
    ) as Paginated<LandingBanner>
  },
  async create(payload: LandingBannerPayload) {
    const res = await httpClient.post<ApiEnvelope<LandingBanner>>('/admin/landing-banners', payload)
    return res.data.data
  },
  async update(id: string, payload: LandingBannerPayload) {
    const res = await httpClient.put<ApiEnvelope<LandingBanner>>(
      `/admin/landing-banners/${id}`,
      payload,
    )
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/landing-banners/${id}`)
  },
}
