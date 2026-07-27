import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { ProductFeatured } from '@/modules/catalog/product/types'
import type { Collection, CollectionDetail, CollectionListQuery, CollectionPayload } from './types'

type CollectionDetailResponse = Omit<CollectionDetail, 'products'> & {
  products?: unknown
}

function normalizeCollectionDetail(data: CollectionDetailResponse): CollectionDetail {
  return {
    ...data,
    products: unwrapList<ProductFeatured>(data.products).items,
  }
}

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
    const res = await httpClient.get<ApiEnvelope<CollectionDetailResponse>>(
      `/collections/${slug}`,
      { params },
    )
    return normalizeCollectionDetail(res.data.data)
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
    const res = await httpClient.get<ApiEnvelope<CollectionDetailResponse>>(
      `/admin/collections/${id}`,
    )
    return normalizeCollectionDetail(res.data.data)
  },
  async create(payload: CollectionPayload) {
    const res = await httpClient.post<ApiEnvelope<Collection>>('/admin/collections', payload)
    return res.data.data
  },
  async update(id: string, payload: CollectionPayload) {
    const res = await httpClient.put<ApiEnvelope<Collection>>(`/admin/collections/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/collections/${id}`)
  },
}
