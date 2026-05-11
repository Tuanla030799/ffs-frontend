import type { Status } from '@/modules/shared/types'

export interface Blog {
  id: string
  title: string
  slug: string
  excerpt?: string
  contentHtml?: string | null
  contentJson?: unknown
  coverFileId?: string
  coverUrl?: string
  coverImageUrl?: string
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
  contentHtml?: string
  contentJson?: unknown
  coverFileId?: string
  status: 'DRAFT' | 'ACTIVE' | 'INACTIVE' | string
  publishedAt?: string
}
