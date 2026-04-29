<template>
  <aside class="sticky top-0 flex h-screen flex-col border-r border-slate-200 bg-slate-950 p-4 text-white">
    <RouterLink to="/admin/dashboard" class="mb-6 flex items-center gap-3 no-underline text-white"><span class="grid h-10 w-10 place-items-center rounded-xl bg-white text-slate-950 font-black">FS</span><span class="font-bold">Admin</span></RouterLink>
    <nav class="space-y-1 overflow-y-auto">
      <RouterLink v-for="item in items" :key="item.to" :to="item.to" class="block rounded-xl px-3 py-2 text-sm font-semibold text-slate-300 no-underline hover:bg-white/10 hover:text-white">{{ item.label }}</RouterLink>
    </nav>
  </aside>
</template>
<script setup lang="ts">
import { RouterLink } from 'vue-router'
const items = [
  { label: 'Dashboard', to: '/admin/dashboard' }, { label: 'Categories', to: '/admin/categories' }, { label: 'Products', to: '/admin/products' }, { label: 'Orders', to: '/admin/orders' }, { label: 'Coupons', to: '/admin/coupons' }, { label: 'Landing banners', to: '/admin/banners' }, { label: 'Customers', to: '/admin/customers' }, { label: 'Admin users', to: '/admin/users' }, { label: 'Storefront', to: '/' },
]
</script>
