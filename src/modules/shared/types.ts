import type { PageResult } from '@/types/http'
import { formatLocalDateTime } from '@/lib/dateTime'
export type Status = 'ACTIVE' | 'INACTIVE' | 'DRAFT' | 'DELETED' | string
export type Paginated<T> = PageResult<T>
export interface ListQuery {
  keyword?: string
  page?: number
  limit?: number
  status?: string
}
export function unwrapList<T>(data: unknown, fallbackPage = 1, fallbackLimit = 20): PageResult<T> {
  if (Array.isArray(data))
    return { items: data as T[], total: data.length, page: fallbackPage, limit: fallbackLimit }
  const row = (data || {}) as Record<string, unknown>
  const raw = row.items || row.content || row.rows || row.data || []
  const items = Array.isArray(raw) ? (raw as T[]) : []
  return {
    items,
    total: Number(row.total ?? row.totalElements ?? items.length),
    page: Number(row.page ?? row.pageNumber ?? fallbackPage),
    limit: Number(row.limit ?? row.size ?? fallbackLimit),
  }
}
export function money(value?: number | null) {
  return new Intl.NumberFormat('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  }).format(Number(value || 0))
}
export function asArray<T>(value: T[] | null | undefined): T[] {
  return Array.isArray(value) ? value : []
}
export function formatDateTime(value?: string | Date | null) {
  return formatLocalDateTime(value)
}
