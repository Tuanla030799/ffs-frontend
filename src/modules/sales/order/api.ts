import { httpClient } from '@/lib/http/httpClient'
import { unwrapList, type Paginated, type ListQuery } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { CreateOrderPayload, Order, OrderDetail, OrderItem, OrderStatusHistory } from './types'

function normalizeOrderDetail(data: OrderDetail | Order | null | undefined): OrderDetail {
  const row = (data || {}) as OrderDetail & Order
  if ('order' in row && row.order) {
    return {
      order: row.order,
      items: Array.isArray(row.items) ? row.items : [],
    }
  }

  return {
    order: row as Order,
    items: Array.isArray(row.items) ? (row.items as OrderItem[]) : [],
  }
}

export const orderApi = {
  async create(payload: CreateOrderPayload) {
    const res = await httpClient.post<ApiEnvelope<Order>>('/api/orders', payload)
    return res.data.data
  },
  async adminList(params?: ListQuery) {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/api/admin/orders', { params })
    return unwrapList<Order>(res.data.data, params?.page, params?.limit) as Paginated<Order>
  },
  async detail(id: string) {
    const res = await httpClient.get<ApiEnvelope<OrderDetail | Order>>(`/api/admin/orders/${id}`)
    return normalizeOrderDetail(res.data.data)
  },
  async updateStatus(id: string, payload: { status: string; note?: string }) {
    const res = await httpClient.patch<ApiEnvelope<Order>>(
      `/api/admin/orders/${id}/status`,
      payload,
    )
    return res.data
  },
  async updatePayment(
    id: string,
    payload: { paymentMethod: string; paymentStatus: string; paidAt?: string | null },
  ) {
    const res = await httpClient.patch<ApiEnvelope<Order>>(
      `/api/admin/orders/${id}/payment`,
      payload,
    )
    return res.data
  },
  async updateShipping(
    id: string,
    payload: { shippingMethod: string; shippingStatus: string; trackingCode?: string },
  ) {
    const res = await httpClient.patch<ApiEnvelope<Order>>(
      `/api/admin/orders/${id}/shipping`,
      payload,
    )
    return res.data
  },
  async history(id: string) {
    const res = await httpClient.get<ApiEnvelope<OrderStatusHistory[]>>(
      `/api/admin/orders/${id}/status-history`,
    )
    return res.data.data || []
  },
}
