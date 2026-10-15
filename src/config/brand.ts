export const FOUNDING_YEAR = 2020

export type SocialLink = { label: string; url: string }

export type TeamMember = {
  name: string
  role: string
  bio?: string
  links?: SocialLink[]
}

export const SOCIAL_LINKS: SocialLink[] = [
  { label: 'Facebook', url: 'https://www.facebook.com/thepocketshoes' },
  { label: 'Instagram', url: 'https://www.instagram.com/thepocketshoes/' },
  { label: 'TikTok', url: 'https://www.tiktok.com/@thepocketshoes' },
]

export const TEAM: TeamMember[] = [
  {
    name: 'Lê Anh Tuấn',
    role: 'Đồng sáng lập · Công nghệ & Vận hành',
    bio: 'Full-stack developer, tự xây dựng nền tảng The Pocket Shoes từ storefront, trang quản trị đến hạ tầng triển khai, đồng thời phụ trách vận hành cửa hàng. Đang phát triển Pocket AI Stylist để việc tìm giày trở nên cá nhân và dễ dàng hơn.',
    links: [{ label: 'GitHub', url: 'https://github.com/Tuanla030799' }],
  },
  {
    name: 'Hà Thị Huyền',
    role: 'Đồng sáng lập · Marketing, Content & Sản phẩm',
    bio: 'Phụ trách marketing, nội dung và sản phẩm: tuyển chọn các mẫu giày, xây dựng bộ sưu tập và kết nối The Pocket Shoes với cộng đồng yêu giày qua blog và mạng xã hội.',
  },
  {
    name: 'Mai Phương Thảo',
    role: 'Đồng sáng lập · Tài chính & Chăm sóc khách hàng',
    bio: 'Phụ trách tài chính và chăm sóc khách hàng, đồng hành cùng The Pocket Shoes từ năm 2020. Đảm bảo mỗi đơn hàng được hỗ trợ chu đáo từ lúc đặt đến khi giày đến tay khách.',
  },
]
