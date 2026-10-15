<template>
  <ProductListPage />
</template>

<script setup lang="ts">
import ProductListPage from '@/pages/public/ProductListPage.vue'

definePageMeta({ layout: 'public', name: 'products' })

useSeoMeta({
  title: 'Sản phẩm - The Pocket Shoes',
  description: 'Danh sách sản phẩm giày sneaker, lọc theo thương hiệu, danh mục, size và màu sắc.',
  ogTitle: 'Sản phẩm - The Pocket Shoes',
  ogDescription: 'Tìm đôi giày phù hợp với phong cách của bạn tại The Pocket Shoes.',
})
</script>
