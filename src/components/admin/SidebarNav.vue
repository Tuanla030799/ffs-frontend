<template>
  <aside
    class="sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-slate-950 p-4 text-white"
  >
    <RouterLink to="/admin/dashboard" class="mb-6 flex items-center gap-3 text-white no-underline"
      ><span class="grid h-10 w-10 place-items-center rounded-xl bg-white font-black text-slate-950"
        >FS</span
      ><span class="font-bold">Admin</span></RouterLink
    >
    <nav class="space-y-1 overflow-y-auto">
      <RouterLink
        v-for="item in items"
        v-slot="{ isActive, href, navigate }"
        :key="item.to"
        :to="item.to"
        custom
      >
        <a :href="href" :class="navClass(isActive)" @click="navigate">
          <span
            v-if="isActive"
            class="absolute top-1/2 left-0 h-6 w-1 -translate-y-1/2 rounded-r-full bg-white"
          />
          {{ item.label }}
        </a>
      </RouterLink>
    </nav>
  </aside>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { cn } from '@/utils/cn'
const items = [
  { label: 'Dashboard', to: '/admin/dashboard' },
  { label: 'Categories', to: '/admin/categories' },
  { label: 'Brands', to: '/admin/brands' },
  { label: 'Products', to: '/admin/products' },
  { label: 'Collections', to: '/admin/collections' },
  { label: 'Blogs', to: '/admin/blogs' },
  { label: 'Orders', to: '/admin/orders' },
  { label: 'Coupons', to: '/admin/coupons' },
  { label: 'Landing banners', to: '/admin/banners' },
  { label: 'Customers', to: '/admin/customers' },
  { label: 'Admin users', to: '/admin/users' },
  { label: 'Storefront', to: '/' },
]

function navClass(isActive: boolean) {
  return cn(
    'relative block rounded-xl px-3 py-2 pl-4 text-sm font-semibold no-underline transition',
    isActive
      ? 'bg-white text-slate-950 shadow-sm'
      : 'text-slate-300 hover:bg-white/10 hover:text-white',
  )
}
</script>
