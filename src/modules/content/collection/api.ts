import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { Collection, CollectionDetail, CollectionListQuery, CollectionPayload } from './types'

export const collectionApi = {
  async list(params?: CollectionListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/collections', { params })
    return unwrapList<Collection>(
      res.data.data,
      params?.page,
      params?.limit,
    ) as Paginated<Collection>
  },
  async detail(slug: string, params?: CollectionListQuery) {
    const res = await httpClient.get<ApiEnvelope<CollectionDetail>>(`/collections/${slug}`, {
      params,
    })
    return res.data.data
  },
  async adminList(params?: CollectionListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/collections', { params })
    return unwrapList<Collection>(
      res.data.data,
      params?.page,
      params?.limit,
    ) as Paginated<Collection>
  },
  async adminDetail(id: string) {
    const res = await httpClient.get<ApiEnvelope<Collection>>(`/admin/collections/${id}`)
    return res.data.data
  },
  async create(payload: CollectionPayload) {
    const res = await httpClient.post<ApiEnvelope<Collection>>('/admin/collections', payload)
    return res.data.data
  },
  async update(id: string, payload: CollectionPayload) {
    const res = await httpClient.put<ApiEnvelope<Collection>>(
      `/admin/collections/${id}`,
      payload,
    )
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/collections/${id}`)
  },
}
