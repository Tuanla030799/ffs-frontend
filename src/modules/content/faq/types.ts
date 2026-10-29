export interface Faq {
  id: string
  question: string
  answerHtml: string
  sortOrder: number
  status: 'ACTIVE' | 'INACTIVE' | string
  createdAt?: string
  updatedAt?: string
}

export interface FaqListQuery {
  keyword?: string
  status?: string
  page?: number
  limit?: number
}

export interface FaqPayload {
  question: string
  answerHtml: string
  sortOrder: number
  status: 'ACTIVE' | 'INACTIVE' | string
}
