import type { Status } from '@/modules/shared/types'
export interface Customer {
  id: string
  fullName: string
  email?: string
  phone?: string
  status: Status
  createdAt?: string
}
export type CustomerPayload = Omit<Customer, 'id' | 'createdAt'>
export interface AdminUser {
  id: string
  name: string
  email: string
  role: string
  status: Status
}
export interface AdminUserPayload {
  name: string
  email: string
  password?: string
  role: string
  status: Status
}
