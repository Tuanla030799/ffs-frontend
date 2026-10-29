import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { Faq, FaqListQuery, FaqPayload } from './types'

export const faqApi = {
  async list(params?: FaqListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/faqs', { params })
    return unwrapList<Faq>(res.data.data, params?.page, params?.limit) as Paginated<Faq>
  },
  async adminList(params?: FaqListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/faqs', { params })
    return unwrapList<Faq>(res.data.data, params?.page, params?.limit) as Paginated<Faq>
  },
  async adminDetail(id: string) {
    const res = await httpClient.get<ApiEnvelope<Faq>>(`/admin/faqs/${id}`)
    return res.data.data
  },
  async create(payload: FaqPayload) {
    const res = await httpClient.post<ApiEnvelope<{ id: string }>>('/admin/faqs', payload)
    return res.data.data
  },
  async update(id: string, payload: FaqPayload) {
    await httpClient.put(`/admin/faqs/${id}`, payload)
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/faqs/${id}`)
  },
}
