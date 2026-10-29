<template>
  <footer class="border-t border-black/10 bg-white">
    <div class="mx-auto max-w-[1440px] px-4 py-8 text-sm text-black/60 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div class="flex flex-col items-center gap-3 md:items-start">
          <p>© 2026 THE POCKET SHOES. All rights reserved.</p>
          <div class="flex flex-wrap gap-x-5 gap-y-2">
            <a
              v-for="link in SOCIAL_LINKS"
              :key="link.url"
              :href="link.url"
              target="_blank"
              rel="noopener noreferrer"
              class="font-semibold text-black no-underline hover:opacity-60"
            >
              {{ link.label }}
            </a>
          </div>
        </div>

        <nav class="flex flex-wrap justify-center gap-x-6 gap-y-2 md:justify-end">
          <RouterLink class="text-black/60 no-underline hover:text-black" to="/products">
            Sản phẩm
          </RouterLink>
          <RouterLink class="text-black/60 no-underline hover:text-black" to="/brands">
            Thương hiệu
          </RouterLink>
          <RouterLink class="text-black/60 no-underline hover:text-black" to="/collections">
            Bộ sưu tập
          </RouterLink>
          <RouterLink class="text-black/60 no-underline hover:text-black" to="/about">
            Về chúng tôi
          </RouterLink>
          <RouterLink class="text-black/60 no-underline hover:text-black" to="/faq">
            Câu hỏi thường gặp
          </RouterLink>
          <RouterLink class="text-black/60 no-underline hover:text-black" to="/about#lien-he">
            Liên hệ
          </RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { SOCIAL_LINKS } from '@/config/brand'
</script>
