<template>
  <div
    class="admin-layout-shell flex flex-col overflow-hidden bg-[var(--ui-bg)] lg:grid lg:grid-cols-[280px_minmax(0,1fr)]"
  >
    <div class="hidden min-h-0 lg:block">
      <SidebarNav />
    </div>
    <div class="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
      <Topbar class="shrink-0" :title="pageTitle" :description="pageDescription" @logout="logout" />

      <div class="shrink-0 border-b border-slate-200 bg-white p-3 lg:hidden">
        <div class="flex gap-2 overflow-x-auto">
          <NuxtLink
            v-for="item in quickLinks"
            :key="item.to"
            :to="item.to"
            class="shrink-0 rounded-xl border px-3 py-2 text-sm font-semibold no-underline transition"
            :class="quickLinkClass(item.to)"
            :aria-current="isAdminNavActive(route.path, item.to) ? 'page' : undefined"
          >
            {{ item.label }}
          </NuxtLink>
        </div>
      </div>
      <main
        class="admin-layout-main min-h-0 flex-1 overflow-y-scroll overscroll-contain p-4 sm:p-6"
      >
        <slot />
      </main>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useHead } from '#imports'
import { computed } from 'vue'
import SidebarNav from '@/components/admin/SidebarNav.vue'
import Topbar from '@/components/admin/Topbar.vue'
import { useAppStore } from '@/stores/app'
import { adminNavItems, isAdminNavActive } from '@/config/adminNav'
import { adminAuthService } from '@/services/admin/auth.service'
import { cn } from '@/utils/cn'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()

useHead({
  htmlAttrs: { class: 'admin-scroll-lock' },
  bodyAttrs: { class: 'admin-scroll-lock' },
})

const quickLinks = adminNavItems

const pageTitle = computed(() => String(route.meta.title || 'Admin'))
const pageDescription = computed(() => String(route.meta.description || 'Quản trị bán giày.'))

function quickLinkClass(to: string) {
  return cn(
    isAdminNavActive(route.path, to)
      ? 'border-slate-950 bg-slate-950 text-white'
      : 'border-slate-200 bg-white text-slate-700',
  )
}

async function logout() {
  try {
    // Luôn gọi logout: BE thu hồi token trong cookie HttpOnly và xoá cookie.
    await adminAuthService.logout(appStore.refreshToken)
  } finally {
    appStore.clearAuthSession()
    await router.replace({ name: 'admin-login' })
  }
}
</script>
