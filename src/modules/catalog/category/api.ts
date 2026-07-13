import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated, type ListQuery } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { Category, CategoryPayload } from './types'
export const categoryApi = {
  async publicList() {
    const res = await httpClient.get<ApiEnvelope<Category[]>>('/categories')
    return res.data.data || []
  },
  async adminList(params?: ListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/categories', { params })
    return unwrapList<Category>(res.data.data, params?.page, params?.limit) as Paginated<Category>
  },
  async create(payload: CategoryPayload) {
    const res = await httpClient.post<ApiEnvelope<Category>>('/admin/categories', payload)
    return res.data.data
  },
  async update(id: string, payload: CategoryPayload) {
    const res = await httpClient.put<ApiEnvelope<Category>>(`/admin/categories/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/categories/${id}`)
  },
}
