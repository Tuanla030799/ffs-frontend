<template>
  <ProductDetailPage />
</template>

<script setup lang="ts">
import ProductDetailPage from '@/pages/public/ProductDetailPage.vue'

definePageMeta({ layout: 'public', name: 'product-detail' })

useSeoMeta({
  title: 'Chi tiết sản phẩm - The Pocket Shoes',
  description: 'Thông tin chi tiết sản phẩm tại The Pocket Shoes.',
  ogTitle: 'Chi tiết sản phẩm - The Pocket Shoes',
  ogDescription: 'Thông tin chi tiết sản phẩm tại The Pocket Shoes.',
})
</script>
