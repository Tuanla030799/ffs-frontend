<template>
  <div class="min-h-screen bg-slate-50 text-slate-950">
    <header class="sticky top-0 z-40 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
        <RouterLink to="/" class="flex items-center gap-3 no-underline">
          <span class="flex h-11 w-11 items-center justify-center rounded-2xl bg-slate-950 text-lg font-black text-white">FS</span>
          <div><p class="font-black tracking-tight">Fresh Shoes</p><p class="text-xs text-slate-500">Modern sneaker store</p></div>
        </RouterLink>
        <nav class="flex items-center gap-2 text-sm font-semibold">
          <RouterLink class="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100" to="/">Trang chủ</RouterLink>
          <RouterLink class="rounded-full px-4 py-2 text-slate-600 hover:bg-slate-100" to="/products">Sản phẩm</RouterLink>
          <RouterLink class="rounded-full bg-slate-950 px-4 py-2 text-white" to="/admin">Admin</RouterLink>
        </nav>
      </div>
    </header>
    <RouterView />
    <footer class="border-t border-slate-200 bg-white py-8 text-center text-sm text-slate-500">© 2026 Fresh Shoes. Storefront dùng API backend có sẵn.</footer>
  </div>
</template>
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>
