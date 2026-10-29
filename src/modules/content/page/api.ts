import { httpClient } from '@/lib/http/httpClient'
import { unwrapList } from '@/modules/shared/types'
import type { ApiEnvelope } from '@/types/http'
import type { SitePage, SitePageKey, SitePagePayload } from './types'

export const sitePageApi = {
  async detail(key: SitePageKey) {
    const res = await httpClient.get<ApiEnvelope<SitePage>>(`/pages/${key}`)
    return res.data.data
  },
  async adminList() {
    const res = await httpClient.get<ApiEnvelope<unknown>>('/admin/pages')
    return unwrapList<SitePage>(res.data.data).items
  },
  async adminDetail(key: string) {
    const res = await httpClient.get<ApiEnvelope<SitePage>>(`/admin/pages/${key}`)
    return res.data.data
  },
  async update(key: string, payload: SitePagePayload) {
    await httpClient.put(`/admin/pages/${key}`, payload)
  },
}
