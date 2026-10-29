import type { SitePageKey } from './types'

// Nơi mỗi trang nội dung hiển thị trên storefront, để admin biết mình đang sửa gì.
export const SITE_PAGE_META: Record<SitePageKey, { placement: string; usesSummary: boolean }> = {
  about: { placement: 'Trang /about', usesSummary: true },
  'purchase-shipping': {
    placement: 'Tab "Cách mua hàng và hình thức vận chuyển" trên mọi trang sản phẩm',
    usesSummary: false,
  },
}

export function sitePageMeta(key: string) {
  return SITE_PAGE_META[key as SitePageKey]
}
