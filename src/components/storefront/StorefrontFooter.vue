<template>
  <footer class="border-t border-black/10 bg-white">
    <div class="mx-auto max-w-[1440px] px-4 py-8 text-sm text-black/60 sm:px-6 lg:px-8">
      <div class="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <p>© 2026 THE POCKET SHOES. All rights reserved.</p>

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
          <RouterLink class="text-black/60 no-underline hover:text-black" to="/contact">
            Liên hệ
          </RouterLink>
        </nav>
      </div>
    </div>
  </footer>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
</script>
