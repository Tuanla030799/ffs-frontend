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
import ProductAdminFormPage from '@/pages/admin/catalog/ProductAdminFormPage.vue'
import OrderAdminPage from '@/pages/admin/sales/OrderAdminPage.vue'
import CouponAdminPage from '@/pages/admin/promotion/CouponAdminPage.vue'
import BannerAdminPage from '@/pages/admin/content/BannerAdminPage.vue'
import CollectionAdminPage from '@/pages/admin/content/CollectionAdminPage.vue'
import BlogAdminPage from '@/pages/admin/content/BlogAdminPage.vue'
import BlogAdminFormPage from '@/pages/admin/content/BlogAdminFormPage.vue'
import CustomerAdminPage from '@/pages/admin/customer/CustomerAdminPage.vue'
import AdminUserPage from '@/pages/admin/user/AdminUserPage.vue'
import CollectionListPage from '@/pages/public/CollectionListPage.vue'
import CollectionDetailPage from '@/pages/public/CollectionDetailPage.vue'
import BlogListPage from '@/pages/public/BlogListPage.vue'
import BlogDetailPage from '@/pages/public/BlogDetailPage.vue'
import BrandListPage from '@/pages/public/BrandListPage.vue'
import BrandDetailPage from '@/pages/public/BrandDetailPage.vue'
import BrandAdminPage from '@/pages/admin/content/BrandAdminPage.vue'
import NotFoundPage from '@/pages/system/NotFoundPage.vue'
import { pinia } from '@/stores'
import { useAppStore } from '@/stores/app'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    component: PublicLayout,
    children: [
      { path: '', name: 'home', component: HomePage, meta: { title: 'Trang chủ' } },
      {
        path: 'products',
        name: 'products',
        component: ProductListPage,
        meta: { title: 'Sản phẩm' },
      },
      {
        path: 'products/:slug',
        name: 'product-detail',
        component: ProductDetailPage,
        meta: { title: 'Chi tiết sản phẩm' },
      },
      {
        path: 'collections',
        name: 'collections',
        component: CollectionListPage,
        meta: { title: 'Bộ sưu tập' },
      },
      {
        path: 'collections/:slug',
        name: 'collection-detail',
        component: CollectionDetailPage,
        meta: { title: 'Chi tiết bộ sưu tập' },
      },
      { path: 'brands', name: 'brands', component: BrandListPage, meta: { title: 'Thương hiệu' } },
      {
        path: 'brands/:slug',
        name: 'brand-detail',
        component: BrandDetailPage,
        meta: { title: 'Chi tiết thương hiệu' },
      },
      { path: 'blogs', name: 'blogs', component: BlogListPage, meta: { title: 'Blog' } },
      {
        path: 'blogs/:slug',
        name: 'blog-detail',
        component: BlogDetailPage,
        meta: { title: 'Chi tiết blog' },
      },
    ],
  },
  { path: '/admin/login', name: 'admin-login', component: LoginPage, meta: { publicOnly: true } },
  {
    path: '/admin',
    component: AdminLayout,
    meta: { requiresAdmin: true },
    children: [
      { path: '', redirect: '/admin/dashboard' },
      {
        path: 'dashboard',
        name: 'admin-dashboard',
        component: DashboardPage,
        meta: { title: 'Dashboard', description: 'Tổng quan ecommerce bán giày.' },
      },
      {
        path: 'categories',
        name: 'admin-categories',
        component: CategoryAdminPage,
        meta: { title: 'Categories', description: 'CRUD danh mục sản phẩm.' },
      },
      {
        path: 'products',
        name: 'admin-products',
        component: ProductAdminPage,
        meta: {
          title: 'Products',
          description: 'CRUD product, images, variants, SKUs và Editor.js.',
        },
      },
      {
        path: 'products/create',
        name: 'admin-product-create',
        component: ProductAdminFormPage,
        meta: {
          title: 'Create product',
          description: 'Tạo product, images, variants, SKUs và Editor.js.',
        },
      },
      {
        path: 'products/:id/edit',
        name: 'admin-product-edit',
        component: ProductAdminFormPage,
        meta: {
          title: 'Edit product',
          description: 'Cập nhật product, images, variants, SKUs và Editor.js.',
        },
      },
      {
        path: 'orders',
        name: 'admin-orders',
        component: OrderAdminPage,
        meta: { title: 'Orders', description: 'Quản lý đơn hàng, thanh toán và vận chuyển.' },
      },
      {
        path: 'coupons',
        name: 'admin-coupons',
        component: CouponAdminPage,
        meta: { title: 'Coupons', description: 'Quản lý mã giảm giá.' },
      },
      {
        path: 'banners',
        name: 'admin-banners',
        component: BannerAdminPage,
        meta: { title: 'Landing banners', description: 'Quản lý banner trang chủ.' },
      },
      {
        path: 'brands',
        name: 'admin-brands',
        component: BrandAdminPage,
        meta: { title: 'Brands', description: 'Quản lý thương hiệu sản phẩm.' },
      },
      {
        path: 'collections',
        name: 'admin-collections',
        component: CollectionAdminPage,
        meta: { title: 'Collections', description: 'Quản lý bộ sưu tập sản phẩm.' },
      },
      {
        path: 'blogs',
        name: 'admin-blogs',
        component: BlogAdminPage,
        meta: { title: 'Blogs', description: 'Quản lý bài viết storefront.' },
      },
      {
        path: 'blogs/create',
        name: 'admin-blog-create',
        component: BlogAdminFormPage,
        meta: { title: 'Create blog', description: 'Tạo bài viết storefront.' },
      },
      {
        path: 'blogs/:id/edit',
        name: 'admin-blog-edit',
        component: BlogAdminFormPage,
        meta: { title: 'Edit blog', description: 'Cập nhật bài viết storefront.' },
      },
      {
        path: 'customers',
        name: 'admin-customers',
        component: CustomerAdminPage,
        meta: { title: 'Customers', description: 'Quản lý khách hàng.' },
      },
      {
        path: 'users',
        name: 'admin-users',
        component: AdminUserPage,
        meta: { title: 'Admin users', description: 'Quản lý tài khoản admin.' },
      },
    ],
  },
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
