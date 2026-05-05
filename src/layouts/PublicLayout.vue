<template>
  <div class="min-h-screen bg-white text-black">
    <header class="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
      <div
        class="mx-auto flex max-w-7xl items-center justify-between gap-4 px-4 py-4 sm:px-6 md:py-5 lg:px-8"
      >
        <RouterLink to="/" class="flex items-center gap-3 no-underline">
          <div class="leading-none text-black">
            <p class="text-xl font-black tracking-[0.08em] md:text-2xl">WALK</p>
            <p class="text-[11px] font-bold tracking-[0.18em]">YOUR STORY</p>
          </div>
        </RouterLink>
        <nav class="hidden items-center gap-9 text-sm font-semibold md:flex">
          <RouterLink class="text-black no-underline hover:opacity-60" to="/">Trang chủ</RouterLink>
          <RouterLink class="text-black no-underline hover:opacity-60" to="/products"
            >Cửa hàng</RouterLink
          >
          <RouterLink class="text-black no-underline hover:opacity-60" to="/brands"
            >Thương hiệu</RouterLink
          >
          <RouterLink class="text-black no-underline hover:opacity-60" to="/collections"
            >Bộ sưu tập</RouterLink
          >
          <RouterLink class="text-black no-underline hover:opacity-60" to="/blogs">Blog</RouterLink>
          <RouterLink class="text-black no-underline hover:opacity-60" to="/admin"
            >Admin</RouterLink
          >
        </nav>
        <nav class="flex items-center gap-4 text-xl" aria-label="Tài khoản và giỏ hàng">
          <RouterLink
            class="header-icon-link text-black no-underline"
            to="/admin"
            aria-label="Tài khoản"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M20 21a8 8 0 0 0-16 0" />
              <circle cx="12" cy="7" r="4" />
            </svg>
          </RouterLink>
          <RouterLink
            class="header-icon-link relative text-black no-underline"
            to="/products"
            aria-label="Giỏ hàng"
          >
            <svg
              viewBox="0 0 24 24"
              class="h-6 w-6"
              fill="none"
              stroke="currentColor"
              stroke-width="1.8"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M6 8h12l-1 13H7L6 8Z" />
              <path d="M9 8a3 3 0 0 1 6 0" />
            </svg>
            <span
              class="absolute -top-2 -right-2 grid h-4 w-4 place-items-center rounded-full bg-black text-[10px] font-bold text-white"
              >0</span
            >
          </RouterLink>
        </nav>
      </div>
      <nav
        class="flex gap-5 overflow-x-auto border-t border-black/5 px-4 py-3 text-sm font-semibold md:hidden"
        aria-label="Điều hướng mobile"
      >
        <RouterLink class="shrink-0 text-black no-underline" to="/">Trang chủ</RouterLink>
        <RouterLink class="shrink-0 text-black no-underline" to="/products">Cửa hàng</RouterLink>
        <RouterLink class="shrink-0 text-black no-underline" to="/brands">Thương hiệu</RouterLink>
        <RouterLink class="shrink-0 text-black no-underline" to="/collections"
          >Bộ sưu tập</RouterLink
        >
        <RouterLink class="shrink-0 text-black no-underline" to="/blogs">Blog</RouterLink>
      </nav>
    </header>
    <RouterView />
    <footer class="border-t border-black/10 bg-white py-8 text-center text-sm text-black/60">
      © 2026 WALK YOUR STORY. Storefront dùng API backend có sẵn.
    </footer>
  </div>
</template>
<script setup lang="ts">
import { RouterLink, RouterView } from 'vue-router'
</script>
