import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'
import PublicLayout from '@/layouts/PublicLayout.vue'
import AdminLayout from '@/layouts/AdminLayout.vue'
import HomePage from '@/pages/public/HomePage.vue'
import ProductListPage from '@/pages/public/ProductListPage.vue'
import ProductDetailPage from '@/pages/public/ProductDetailPage.vue'
import LoginPage from '@/pages/admin/LoginPage.vue'
import DashboardPage from '@/pages/admin/DashboardPage.vue'
import CategoryAdminPage from '@/pages/admin/catalog/CategoryAdminPage.vue'
import ProductAdminPage from '@/pages/admin/catalog/ProductAdminPage.vue'
import OrderAdminPage from '@/pages/admin/sales/OrderAdminPage.vue'
import CouponAdminPage from '@/pages/admin/promotion/CouponAdminPage.vue'
import BannerAdminPage from '@/pages/admin/content/BannerAdminPage.vue'
import CustomerAdminPage from '@/pages/admin/customer/CustomerAdminPage.vue'
import AdminUserPage from '@/pages/admin/user/AdminUserPage.vue'
import NotFoundPage from '@/pages/system/NotFoundPage.vue'
import { pinia } from '@/stores'
import { useAppStore } from '@/stores/app'

const routes: RouteRecordRaw[] = [
  { path: '/', component: PublicLayout, children: [
    { path: '', name: 'home', component: HomePage, meta: { title: 'Trang chủ' } },
    { path: 'products', name: 'products', component: ProductListPage, meta: { title: 'Sản phẩm' } },
    { path: 'products/:slug', name: 'product-detail', component: ProductDetailPage, meta: { title: 'Chi tiết sản phẩm' } },
  ] },
  { path: '/admin/login', name: 'admin-login', component: LoginPage, meta: { publicOnly: true } },
  { path: '/admin', component: AdminLayout, meta: { requiresAdmin: true }, children: [
    { path: '', redirect: '/admin/dashboard' },
    { path: 'dashboard', name: 'admin-dashboard', component: DashboardPage, meta: { title: 'Dashboard', description: 'Tổng quan ecommerce bán giày.' } },
    { path: 'categories', name: 'admin-categories', component: CategoryAdminPage, meta: { title: 'Categories', description: 'CRUD danh mục sản phẩm.' } },
    { path: 'products', name: 'admin-products', component: ProductAdminPage, meta: { title: 'Products', description: 'CRUD product, images, variants, SKUs và Editor.js.' } },
    { path: 'orders', name: 'admin-orders', component: OrderAdminPage, meta: { title: 'Orders', description: 'Quản lý đơn hàng, thanh toán và vận chuyển.' } },
    { path: 'coupons', name: 'admin-coupons', component: CouponAdminPage, meta: { title: 'Coupons', description: 'Quản lý mã giảm giá.' } },
    { path: 'banners', name: 'admin-banners', component: BannerAdminPage, meta: { title: 'Landing banners', description: 'Quản lý banner trang chủ.' } },
    { path: 'customers', name: 'admin-customers', component: CustomerAdminPage, meta: { title: 'Customers', description: 'Quản lý khách hàng.' } },
    { path: 'users', name: 'admin-users', component: AdminUserPage, meta: { title: 'Admin users', description: 'Quản lý tài khoản admin.' } },
  ] },
  { path: '/fds', redirect: '/' },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: NotFoundPage },
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach((to) => {
  const appStore = useAppStore(pinia)
  appStore.hydrate()
  if (to.meta.requiresAdmin && !appStore.isAuthenticated) {
    return { name: 'admin-login', query: { redirect: to.fullPath } }
  }
  if (to.name === 'admin-login' && appStore.isAuthenticated) {
    return { name: 'admin-dashboard' }
  }
  return true
})

export default router
