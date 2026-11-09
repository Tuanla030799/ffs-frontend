import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { CustomerFeedback, CustomerFeedbackListQuery, CustomerFeedbackPayload } from './types'

export const customerFeedbackApi = {
  async list(params?: CustomerFeedbackListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/customer-feedbacks', { params })
    return unwrapList<CustomerFeedback>(
      res.data.data,
      params?.page,
      params?.limit,
    ) as Paginated<CustomerFeedback>
  },
  async adminList(params?: CustomerFeedbackListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/customer-feedbacks', { params })
    return unwrapList<CustomerFeedback>(
      res.data.data,
      params?.page,
      params?.limit,
    ) as Paginated<CustomerFeedback>
  },
  async create(payload: CustomerFeedbackPayload) {
    const res = await httpClient.post<ApiEnvelope<{ id: string }>>(
      '/admin/customer-feedbacks',
      payload,
    )
    return res.data.data
  },
  async update(id: string, payload: CustomerFeedbackPayload) {
    await httpClient.put(`/admin/customer-feedbacks/${id}`, payload)
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/customer-feedbacks/${id}`)
  },
}
