<template>
  <BrandListPage />
</template>

<script setup lang="ts">
import BrandListPage from '@/pages/public/BrandListPage.vue'

definePageMeta({ layout: 'public', name: 'brands' })

useSeoMeta({
  title: 'Thương hiệu - The Pocket Shoes',
  description: 'Danh sách thương hiệu giày đang có tại The Pocket Shoes.',
  ogTitle: 'Thương hiệu - The Pocket Shoes',
  ogDescription: 'Khám phá các thương hiệu giày và sneaker nổi bật.',
})
</script>
