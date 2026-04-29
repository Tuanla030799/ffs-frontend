import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated, type ListQuery } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { AdminUser, AdminUserPayload, Customer, CustomerPayload } from './types'
export const customerApi = {
  async list(params?: ListQuery) { const res = await httpClient.get<ApiEnvelope<unknown>>('/api/admin/customers', { params }); return unwrapList<Customer>(res.data.data, params?.page, params?.limit) as Paginated<Customer> },
  async detail(id: string) { const res = await httpClient.get<ApiEnvelope<Customer>>(`/api/admin/customers/${id}`); return res.data.data },
  async create(payload: CustomerPayload) { const res = await httpClient.post<ApiEnvelope<Customer>>('/api/admin/customers', payload); return res.data.data },
  async update(id: string, payload: CustomerPayload) { const res = await httpClient.put<ApiEnvelope<Customer>>(`/api/admin/customers/${id}`, payload); return res.data.data },
  async remove(id: string) { await httpClient.delete(`/api/admin/customers/${id}`) },
}
export const adminUserApi = {
  async list(params?: ListQuery) { const res = await httpClient.get<ApiEnvelope<unknown>>('/api/admin/users', { params }); return unwrapList<AdminUser>(res.data.data, params?.page, params?.limit) as Paginated<AdminUser> },
  async create(payload: AdminUserPayload) { const res = await httpClient.post<ApiEnvelope<AdminUser>>('/api/admin/users', payload); return res.data.data },
  async update(id: string, payload: AdminUserPayload) { const res = await httpClient.put<ApiEnvelope<AdminUser>>(`/api/admin/users/${id}`, payload); return res.data.data },
  async remove(id: string) { await httpClient.delete(`/api/admin/users/${id}`) },
}
