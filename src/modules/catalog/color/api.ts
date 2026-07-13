import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type ListQuery, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { ProductColor, ProductColorPayload } from './types'

export const colorApi = {
  async adminList(params?: ListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/colors', { params })
    return unwrapList<ProductColor>(
      res.data.data,
      params?.page,
      params?.limit,
    ) as Paginated<ProductColor>
  },
  async adminDetail(id: string) {
    const res = await httpClient.get<ApiEnvelope<ProductColor>>(`/admin/colors/${id}`)
    return res.data.data
  },
  async create(payload: ProductColorPayload) {
    const res = await httpClient.post<ApiEnvelope<ProductColor>>('/admin/colors', payload)
    return res.data.data
  },
  async update(id: string, payload: ProductColorPayload) {
    const res = await httpClient.put<ApiEnvelope<ProductColor>>(`/admin/colors/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/colors/${id}`)
  },
}
