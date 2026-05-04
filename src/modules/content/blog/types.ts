import type { Status } from '@/modules/shared/types'

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  contentJson?: unknown
  coverFileId?: string
  coverUrl?: string
  imageUrl?: string
  status: Status
  publishedAt?: string
  createdAt?: string
}

export interface BlogListQuery {
  keyword?: string
  status?: string
  page?: number
  limit?: number
}

export interface BlogPayload {
  title: string
  slug?: string
  excerpt?: string
  contentJson?: string
  coverFileId?: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | string
  publishedAt?: string
}
