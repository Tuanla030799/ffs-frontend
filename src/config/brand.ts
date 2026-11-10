export const FOUNDING_YEAR = 2024

// Link mặc định của 2 nút trên banner trang chủ khi admin để trống ô link tương ứng.
export const DEFAULT_BANNER_BUY_URL = '/products'
export const DEFAULT_BANNER_PDF_URL =
  'https://drive.google.com/file/d/15X-agWiPB_Jn-2TSUzAdTd8VFivbmWsk/view'

export type SocialLink = { label: string; url: string }

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', url: 'https://www.facebook.com/thepocketshoes' },
  { label: 'Instagram', url: 'https://www.instagram.com/thepocketshoes/' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@thepocketshoes' },
]
