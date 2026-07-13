import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type ListQuery, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { ProductSize, ProductSizePayload } from './types'

export const sizeApi = {
  async adminList(params?: ListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/sizes', { params })
    return unwrapList<ProductSize>(
      res.data.data,
      params?.page,
      params?.limit,
    ) as Paginated<ProductSize>
  },
  async adminDetail(id: string) {
    const res = await httpClient.get<ApiEnvelope<ProductSize>>(`/admin/sizes/${id}`)
    return res.data.data
  },
  async create(payload: ProductSizePayload) {
    const res = await httpClient.post<ApiEnvelope<ProductSize>>('/admin/sizes', payload)
    return res.data.data
  },
  async update(id: string, payload: ProductSizePayload) {
    const res = await httpClient.put<ApiEnvelope<ProductSize>>(`/admin/sizes/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/sizes/${id}`)
  },
}
