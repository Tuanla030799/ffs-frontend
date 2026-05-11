<template>
  <BrandDetailPage />
</template>

<script setup lang="ts">
import BrandDetailPage from '@/pages/public/BrandDetailPage.vue'

definePageMeta({ layout: 'public', name: 'brand-detail' })

useSeoMeta({
  title: 'Thuong hieu - Fresh Shoes',
  description: 'Kham pha san pham theo thuong hieu tai Fresh Shoes.',
  ogTitle: 'Thuong hieu - Fresh Shoes',
  ogDescription: 'Kham pha san pham theo thuong hieu tai Fresh Shoes.',
})
</script>
