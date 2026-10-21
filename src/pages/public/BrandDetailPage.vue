<script setup lang="ts">
import { navigateTo, useRoute } from '#imports'

const route = useRoute()

// Trang thương hiệu dùng chung danh sách sản phẩm có lọc theo brand. Chuyển hướng ngay từ
// server (301) thay vì trả 200 rồi mới chuyển ở client.
await navigateTo(
  { path: '/products', query: { brand: String(route.params.slug || '') } },
  { redirectCode: 301, replace: true },
)
</script>

<template>
  <main class="grid min-h-72 place-items-center text-black/60">
    Đang chuyển tới danh sách sản phẩm...
  </main>
</template>
