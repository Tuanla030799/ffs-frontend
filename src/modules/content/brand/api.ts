import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { Brand, BrandListQuery, BrandPayload } from './types'

function unwrapBrandList(data: unknown) {
  if (Array.isArray(data)) return data as Brand[]
  return unwrapList<Brand>(data).items
}

export const brandApi = {
  async list(params?: BrandListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/brands', { params })
    return unwrapBrandList(res.data.data)
  },
  async detail(slug: string) {
    const res = await httpClient.get<ApiEnvelope<Brand>>(`/brands/${slug}`)
    return res.data.data
  },
  async adminList(params?: BrandListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/brands', { params })
    return unwrapList<Brand>(res.data.data, params?.page, params?.limit) as Paginated<Brand>
  },
  async adminDetail(id: string) {
    const res = await httpClient.get<ApiEnvelope<Brand>>(`/admin/brands/${id}`)
    return res.data.data
  },
  async create(payload: BrandPayload) {
    const res = await httpClient.post<ApiEnvelope<Brand>>('/admin/brands', payload)
    return res.data.data
  },
  async update(id: string, payload: BrandPayload) {
    const res = await httpClient.put<ApiEnvelope<Brand>>(`/admin/brands/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/brands/${id}`)
  },
}
