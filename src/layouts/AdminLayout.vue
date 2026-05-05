<template>
  <div class="min-h-screen bg-[var(--ui-bg)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
    <div class="hidden lg:block">
      <AdminSidebarNav />
    </div>
    <div class="min-w-0">
      <AdminTopbar :title="pageTitle" :description="pageDescription" @logout="handleLogout" />

      <div class="border-b border-slate-200 bg-white p-3 lg:hidden">
        <div class="flex gap-2 overflow-x-auto">
          <RouterLink
            v-for="item in quickLinks"
            v-slot="{ isActive, href, navigate }"
            :key="item.to"
            :to="item.to"
            custom
          >
            <a :href="href" :class="quickLinkClass(isActive)" @click="navigate">
              {{ item.label }}
            </a>
          </RouterLink>
        </div>
      </div>
      <main class="p-4 sm:p-6">
        <RouterView />
      </main>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink, RouterView, useRoute, useRouter } from 'vue-router'
import AdminSidebarNav from '@/components/admin/SidebarNav.vue'
import AdminTopbar from '@/components/admin/Topbar.vue'
import { adminAuthService } from '@/services/admin/auth.service'
import { useAppStore } from '@/stores/app'
import { cn } from '@/utils/cn'
const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const quickLinks = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Sizes', to: '/admin/sizes' },
  { label: 'Colors', to: '/admin/colors' },
  { label: 'Brands', to: '/admin/brands' },
  { label: 'Collections', to: '/admin/collections' },
  { label: 'Blogs', to: '/admin/blogs' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Store', to: '/' },
]
const pageTitle = computed(() => String(route.meta.title || 'Admin'))
const pageDescription = computed(() => String(route.meta.description || 'Quản trị bán giày.'))
function quickLinkClass(isActive: boolean) {
  return cn(
    'shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold no-underline transition',
    isActive
      ? 'border-slate-950 bg-slate-950 text-white'
      : 'border-slate-200 bg-white text-slate-700',
  )
}
async function handleLogout() {
  try {
    if (appStore.refreshToken) await adminAuthService.logout(appStore.refreshToken)
  } finally {
    appStore.clearAuthSession()
    void router.replace({ name: 'admin-login' })
  }
}
</script>
