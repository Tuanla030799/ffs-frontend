<template>
  <header class="sticky top-0 z-40 border-b border-black/10 bg-white/95 backdrop-blur">
    <div
      class="mx-auto grid h-[65px] max-w-[1440px] grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-4 px-4 sm:px-6 lg:px-8"
    >
      <div class="flex items-center gap-3">
        <UiButton
          class="md:hidden"
          variant="ghost"
          square
          aria-label="Mở menu"
          @click="mobileMenuOpen = true"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor">
            <path d="M4 7h16M4 12h16M4 17h16" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </UiButton>
        <RouterLink to="/" class="flex items-center gap-3 no-underline">
          <img class="h-12 w-auto md:h-14" :src="logoUrl" alt="The Pocket Shoes" />
        </RouterLink>
      </div>

      <nav class="hidden justify-center gap-9 text-sm font-bold md:flex">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          class="text-black no-underline transition hover:opacity-60"
          :to="item.to"
        >
          {{ item.label }}
        </RouterLink>
      </nav>

      <div class="flex min-w-0 items-center justify-end gap-1 sm:gap-2">
        <UiForm
          as="form"
          layout="none"
          class="hidden h-10 min-w-48 items-center gap-2 rounded-full bg-black/[0.06] px-3 lg:flex"
          @submit.prevent="submitSearch"
        >
          <svg
            viewBox="0 0 24 24"
            class="h-5 w-5 shrink-0 text-black/55"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="7" stroke-width="1.8" />
            <path d="m16.5 16.5 4 4" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <UiInput v-model="searchKeyword" class="storefront-search-input" placeholder="Search" />
        </UiForm>

        <UiButton
          class="lg:hidden"
          variant="ghost"
          square
          aria-label="Tìm kiếm"
          @click="mobileSearchOpen = !mobileSearchOpen"
        >
          <svg viewBox="0 0 24 24" class="h-6 w-6" fill="none" stroke="currentColor">
            <circle cx="11" cy="11" r="7" stroke-width="1.8" />
            <path d="m16.5 16.5 4 4" stroke-width="1.8" stroke-linecap="round" />
          </svg>
        </UiButton>
        <!-- <RouterLink
          class="inline-flex h-11 w-11 items-center justify-center rounded-[var(--ui-radius-md)] text-black no-underline transition hover:bg-[var(--ui-surface-soft)]"
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
          class="hidden h-11 w-11 items-center justify-center rounded-[var(--ui-radius-md)] text-black no-underline transition hover:bg-[var(--ui-surface-soft)] sm:inline-flex"
          to="/products"
          aria-label="Wishlist"
        >
          <span class="text-2xl leading-none">♡</span>
        </RouterLink> -->
        <RouterLink
          class="relative inline-flex h-11 w-11 items-center justify-center rounded-[var(--ui-radius-md)] text-black no-underline transition hover:bg-[var(--ui-surface-soft)]"
          to="/checkout"
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
            class="absolute top-1 right-1 grid h-4 min-w-4 place-items-center rounded-full bg-black px-1 text-[10px] font-bold text-white"
            >{{ totalQuantity }}</span
          >
        </RouterLink>
      </div>
    </div>

    <UiForm
      v-if="mobileSearchOpen"
      as="form"
      layout="none"
      class="border-t border-black/10 px-4 py-3 lg:hidden"
      @submit.prevent="submitSearch"
    >
      <UiInput v-model="searchKeyword" placeholder="Search" />
    </UiForm>

    <UiDrawer :open="mobileMenuOpen" title="Menu" @close="mobileMenuOpen = false">
      <nav class="grid gap-1">
        <RouterLink
          v-for="item in navItems"
          :key="item.to"
          class="border-b border-black/10 py-4 text-xl font-black text-black no-underline"
          :to="item.to"
          @click="mobileMenuOpen = false"
        >
          {{ item.label }}
        </RouterLink>
        <RouterLink
          class="border-b border-black/10 py-4 text-xl font-black text-black no-underline"
          to="/admin"
          @click="mobileMenuOpen = false"
        >
          Admin
        </RouterLink>
      </nav>
    </UiDrawer>
  </header>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import logoUrl from '@/assets/logo.jpg'
import { UiButton, UiDrawer, UiForm, UiInput } from '@/components/ui'
import { useCartCount } from '@/composables/useCart'

const router = useRouter()
const { totalQuantity } = useCartCount()
const mobileMenuOpen = ref(false)
const mobileSearchOpen = ref(false)
const searchKeyword = ref('')
const navItems = [
  { label: 'Trang chủ', to: '/' },
  { label: 'Sản phẩm', to: '/products' },
  { label: 'Thương hiệu', to: '/brands' },
  { label: 'Bộ sưu tập', to: '/collections' },
  { label: 'Blog', to: '/blogs' },
  { label: 'About Us', to: '/about' },
]

function submitSearch() {
  const keyword = searchKeyword.value.trim()
  void router.push({ path: '/products', query: keyword ? { keyword } : {} })
  mobileSearchOpen.value = false
}
</script>

<style scoped>
:deep(.storefront-search-input input) {
  border: 0;
  background: transparent;
  padding: 0;
  font-weight: 600;
  box-shadow: none;
}

:deep(.storefront-search-input input:focus) {
  border: 0;
  box-shadow: none;
}
</style>
