<template>
  <CollectionListPage />
</template>

<script setup lang="ts">
import CollectionListPage from '@/pages/public/CollectionListPage.vue'

definePageMeta({ layout: 'public', name: 'collections' })

useSeoMeta({
  title: 'Thepocketshoes',
  description:
    'Kham pha cac bo suu tap giay duoc Thepocketshoes chon loc theo phong cach va nhu cau.',
  ogTitle: 'Thepocketshoes',
  ogDescription: 'Cac bo suu tap sneaker va giay thoi trang noi bat.',
})
</script>
