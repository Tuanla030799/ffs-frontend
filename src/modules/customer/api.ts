import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated, type ListQuery } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { AdminUser, AdminUserPayload, Customer, CustomerPayload } from './types'
export const customerApi = {
  async list(params?: ListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/customers', { params })
    return unwrapList<Customer>(res.data.data, params?.page, params?.limit) as Paginated<Customer>
  },
  async detail(id: string) {
    const res = await httpClient.get<ApiEnvelope<Customer>>(`/admin/customers/${id}`)
    return res.data.data
  },
  async create(payload: CustomerPayload) {
    const res = await httpClient.post<ApiEnvelope<Customer>>('/admin/customers', payload)
    return res.data.data
  },
  async update(id: string, payload: CustomerPayload) {
    const res = await httpClient.put<ApiEnvelope<Customer>>(`/admin/customers/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/customers/${id}`)
  },
}
export const adminUserApi = {
  async list(params?: ListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/users', { params })
    return unwrapList<AdminUser>(res.data.data, params?.page, params?.limit) as Paginated<AdminUser>
  },
  async create(payload: AdminUserPayload) {
    const res = await httpClient.post<ApiEnvelope<AdminUser>>('/admin/users', payload)
    return res.data.data
  },
  async update(id: string, payload: AdminUserPayload) {
    const res = await httpClient.put<ApiEnvelope<AdminUser>>(`/admin/users/${id}`, payload)
    return res.data.data
  },
  async remove(id: string) {
    await httpClient.delete(`/admin/users/${id}`)
  },
}
