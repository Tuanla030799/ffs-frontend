<template>
  <BrandListPage />
</template>

<script setup lang="ts">
import BrandListPage from '@/pages/public/BrandListPage.vue'

definePageMeta({ layout: 'public', name: 'brands' })

useSeoMeta({
  title: 'Thepocketshoes',
  description: 'Danh sach thuong hieu giay dang co tai Thepocketshoes.',
  ogTitle: 'Thepocketshoes',
  ogDescription: 'Kham pha cac thuong hieu giay va sneaker noi bat.',
})
</script>
