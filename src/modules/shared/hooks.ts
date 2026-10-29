import { ApiError } from '@/types/http'
import { apiErrorMessage } from './errors'
export function getErrorMessage(error: unknown) {
  if (error instanceof ApiError) return apiErrorMessage(error)
  if (error instanceof Error) return error.message
  return 'Đã có lỗi xảy ra.'
}
export function required(value: unknown, label: string) {
  return value === undefined || value === null || String(value).trim() === ''
    ? `${label} là bắt buộc.`
    : ''
}
