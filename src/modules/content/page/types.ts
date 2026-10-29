// Khoá cố định của các trang nội dung do BE quản lý (collection `site_pages`).
export type SitePageKey = 'about' | 'purchase-shipping'

export interface SitePage {
  key: SitePageKey
  title: string
  summary?: string | null
  contentHtml?: string | null
  // Trang chưa từng lưu: BE trả tiêu đề mặc định, các trường còn lại là null.
  createdAt?: string | null
  updatedAt?: string | null
}

export interface SitePagePayload {
  title: string
  summary?: string
  contentHtml?: string
}
