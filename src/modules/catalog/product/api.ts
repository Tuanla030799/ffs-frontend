import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { Product, ProductListQuery, ProductPayload, ProductSku, ProductVariant } from './types'
export const productApi = {
  async list(params?: ProductListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/api/products', { params })
    return unwrapList<Product>(res.data.data, params?.page, params?.limit) as Paginated<Product>
  },
  async featured(limit = 12) {
    const res = await httpClient.get<ApiEnvelope<Product[]>>('/api/products/featured', {
      params: { limit },
    })
    return res.data.data || []
  },
  async detail(slug: string) {
    const res = await httpClient.get<ApiEnvelope<Product>>(`/api/products/${slug}`)
    return res.data.data
  },
  async adminList(params?: ProductListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/api/admin/products', { params })
    return unwrapList<Product>(res.data.data, params?.page, params?.limit) as Paginated<Product>
  },
  async adminDetail(id: string) {
    const res = await httpClient.get<ApiEnvelope<Product>>(`/api/admin/products/${id}`)
    return res.data.data
  },
  async create(payload: ProductPayload) {
    const res = await httpClient.post<ApiEnvelope<Product>>('/api/admin/products', payload)
    return res.data.data
  },
  async update(id: string, payload: ProductPayload) {
    const res = await httpClient.put<ApiEnvelope<Product>>(`/api/admin/products/${id}`, payload)
    return res.data.data
  },
  async updateStatus(id: string, status: string) {
    const res = await httpClient.patch<ApiEnvelope<Product>>(`/api/admin/products/${id}/status`, {
      status,
    })
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/api/admin/products/${id}`)
  },
  async createVariant(productId: string, payload: ProductVariant) {
    const res = await httpClient.post<ApiEnvelope<ProductVariant>>(
      `/api/admin/products/${productId}/variants`,
      payload,
    )
    return res.data.data
  },
  async updateVariant(productId: string, variantId: string, payload: ProductVariant) {
    const res = await httpClient.put<ApiEnvelope<ProductVariant>>(
      `/api/admin/products/${productId}/variants/${variantId}`,
      payload,
    )
    return res.data.data
  },
  async removeVariant(productId: string, variantId: string) {
    await httpClient.delete(`/api/admin/products/${productId}/variants/${variantId}`)
  },
  async createSku(productId: string, payload: ProductSku) {
    const res = await httpClient.post<ApiEnvelope<ProductSku>>(
      `/api/admin/products/${productId}/skus`,
      payload,
    )
    return res.data.data
  },
  async updateSku(productId: string, skuId: string, payload: ProductSku) {
    const res = await httpClient.put<ApiEnvelope<ProductSku>>(
      `/api/admin/products/${productId}/skus/${skuId}`,
      payload,
    )
    return res.data.data
  },
  async removeSku(productId: string, skuId: string) {
    await httpClient.delete(`/api/admin/products/${productId}/skus/${skuId}`)
  },
}
