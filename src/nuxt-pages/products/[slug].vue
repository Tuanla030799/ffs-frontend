<template>
  <ProductDetailPage />
</template>

<script setup lang="ts">
import ProductDetailPage from '@/pages/public/ProductDetailPage.vue'

definePageMeta({ layout: 'public', name: 'product-detail' })

useSeoMeta({
  title: 'Chi tiet san pham - Fresh Shoes',
  description: 'Thong tin chi tiet san pham tai Fresh Shoes.',
  ogTitle: 'Chi tiet san pham - Fresh Shoes',
  ogDescription: 'Thong tin chi tiet san pham tai Fresh Shoes.',
})
</script>
