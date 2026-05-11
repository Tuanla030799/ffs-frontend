<template>
  <ProductListPage />
</template>

<script setup lang="ts">
import ProductListPage from '@/pages/public/ProductListPage.vue'

definePageMeta({ layout: 'public', name: 'products' })

useSeoMeta({
  title: 'Thepocketshoes',
  description: 'Danh sach san pham giay sneaker, loc theo thuong hieu, danh muc, size va mau sac.',
  ogTitle: 'Thepocketshoes',
  ogDescription: 'Tim doi giay phu hop voi phong cach cua ban tai Thepocketshoes.',
})
</script>
