// Menu admin dùng chung cho sidebar (desktop) và thanh link nhanh (mobile).
export const adminNavItems = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Sizes', to: '/admin/sizes' },
  { label: 'Colors', to: '/admin/colors' },
  { label: 'Brands', to: '/admin/brands' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Collections', to: '/admin/collections' },
  { label: 'Blogs', to: '/admin/blogs' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Coupons', to: '/admin/coupons' },
  { label: 'Landing banners', to: '/admin/banners' },
  { label: 'Customers', to: '/admin/customers' },
  { label: 'Admin users', to: '/admin/users' },
  { label: 'Backend logs', to: '/admin/logs' },
  { label: 'Storefront', to: '/' },
]

export function isAdminNavActive(currentPath: string, to: string) {
  if (to === '/') return currentPath === '/'
  return currentPath === to || currentPath.startsWith(`${to}/`)
}
