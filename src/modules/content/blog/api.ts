import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { Blog, BlogListQuery, BlogPayload } from './types'

export const blogApi = {
  async list(params?: BlogListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/api/blogs', { params })
    return unwrapList<Blog>(res.data.data, params?.page, params?.limit) as Paginated<Blog>
  },
  async detail(slug: string) {
    const res = await httpClient.get<ApiEnvelope<Blog>>(`/api/blogs/${slug}`)
    return res.data.data
  },
  async adminList(params?: BlogListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/api/admin/blogs', { params })
    return unwrapList<Blog>(res.data.data, params?.page, params?.limit) as Paginated<Blog>
  },
  async adminDetail(id: string) {
    const res = await httpClient.get<ApiEnvelope<Blog>>(`/api/admin/blogs/${id}`)
    return res.data.data
  },
  async create(payload: BlogPayload) {
    const res = await httpClient.post<ApiEnvelope<Blog>>('/api/admin/blogs', payload)
    return res.data.data
  },
  async update(id: string, payload: BlogPayload) {
    const res = await httpClient.put<ApiEnvelope<Blog>>(`/api/admin/blogs/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/api/admin/blogs/${id}`)
  },
}
