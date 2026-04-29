import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated, type ListQuery } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { LandingBanner, LandingBannerPayload } from './types'
export const bannerApi = {
  async publicList() { const res = await httpClient.get<ApiEnvelope<LandingBanner[]>>('/api/landing-banners'); return res.data.data || [] },
  async adminList(params?: ListQuery) { const res = await httpClient.get<ApiEnvelope<unknown>>('/api/admin/landing-banners', { params }); return unwrapList<LandingBanner>(res.data.data, params?.page, params?.limit) as Paginated<LandingBanner> },
  async create(payload: LandingBannerPayload) { const res = await httpClient.post<ApiEnvelope<LandingBanner>>('/api/admin/landing-banners', payload); return res.data.data },
  async update(id: string, payload: LandingBannerPayload) { const res = await httpClient.put<ApiEnvelope<LandingBanner>>(`/api/admin/landing-banners/${id}`, payload); return res.data.data },
  async remove(id: string) { await httpClient.delete(`/api/admin/landing-banners/${id}`) },
}
