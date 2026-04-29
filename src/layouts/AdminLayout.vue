<template>
  <div class="min-h-screen bg-slate-50 lg:grid lg:grid-cols-[280px_minmax(0,1fr)]">
    <div class="hidden lg:block"><AdminSidebarNav /></div>
    <div class="min-w-0"><AdminTopbar :title="pageTitle" :description="pageDescription" @logout="handleLogout" />
      <div class="border-b border-slate-200 bg-white p-3 lg:hidden"><div class="flex gap-2 overflow-x-auto"><RouterLink v-for="item in quickLinks" :key="item.to" :to="item.to" class="shrink-0 rounded-xl border px-3 py-2 text-sm no-underline">{{ item.label }}</RouterLink></div></div>
      <main class="p-4 sm:p-6"><RouterView /></main>
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
const route = useRoute(); const router = useRouter(); const appStore = useAppStore()
const quickLinks = [{ label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Products', to: '/admin/products' }, { label: 'Orders', to: '/admin/orders' }, { label: 'Store', to: '/' }]
const pageTitle = computed(() => String(route.meta.title || 'Admin'))
const pageDescription = computed(() => String(route.meta.description || 'Quản trị ecommerce bán giày.'))
async function handleLogout() { try { if (appStore.refreshToken) await adminAuthService.logout(appStore.refreshToken) } finally { appStore.clearAuthSession(); void router.replace({ name: 'admin-login' }) } }
</script>
