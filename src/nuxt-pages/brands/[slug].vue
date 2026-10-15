<template>
  <BrandDetailPage />
</template>

<script setup lang="ts">
import BrandDetailPage from '@/pages/public/BrandDetailPage.vue'

definePageMeta({ layout: 'public', name: 'brand-detail' })

useSeoMeta({
  title: 'Thương hiệu - The Pocket Shoes',
  description: 'Khám phá sản phẩm theo thương hiệu tại The Pocket Shoes.',
  ogTitle: 'Thương hiệu - The Pocket Shoes',
  ogDescription: 'Khám phá sản phẩm theo thương hiệu tại The Pocket Shoes.',
})
</script>
