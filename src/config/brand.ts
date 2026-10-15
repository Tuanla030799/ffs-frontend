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
    role: 'Đồng sáng lập · Full-stack Developer',
    bio: 'Phụ trách công nghệ, tự xây dựng nền tảng The Pocket Shoes từ storefront, trang quản trị đến hạ tầng triển khai. Đang phát triển Pocket AI Stylist để việc tìm giày trở nên cá nhân và dễ dàng hơn.',
    links: [{ label: 'GitHub', url: 'https://github.com/Tuanla030799' }],
  },
  {
    name: 'Hà Thị Huyền',
    role: 'Đồng sáng lập · Marketing',
    bio: 'Phụ trách marketing và thương hiệu, kết nối The Pocket Shoes với cộng đồng yêu giày qua nội dung và mạng xã hội. Mang góc nhìn của khách hàng vào từng bộ sưu tập.',
  },
  {
    name: 'Mai Phương Thảo',
    role: 'Đồng sáng lập',
    bio: 'Cùng xây dựng The Pocket Shoes từ những ngày đầu năm 2020, đồng hành trong việc định hướng sản phẩm và trải nghiệm mua sắm của cửa hàng.',
  },
]
