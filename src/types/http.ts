export interface ApiEnvelope<T> {
  success?: boolean
  message?: string
  data: T
  meta?: Record<string, unknown>
}
export interface PageResult<T> {
  items: T[]
  total: number
  page: number
  limit: number
}
export interface ApiErrorPayload {
  message: string
  status?: number
  code?: string
  details?: unknown
}
export type QueryParamPrimitive = string | number | boolean | null | undefined | Date
export type QueryParamValue = QueryParamPrimitive | QueryParamPrimitive[]
export type QueryParams = Record<string, QueryParamValue>
export class ApiError extends Error {
  status: number
  code?: string
  details?: unknown
  constructor(payload: ApiErrorPayload) {
    super(payload.message)
    this.name = 'ApiError'
    this.status = payload.status ?? 0
    this.code = payload.code
    this.details = payload.details
  }
}
