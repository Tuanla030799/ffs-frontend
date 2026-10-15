<template>
  <CollectionListPage />
</template>

<script setup lang="ts">
import CollectionListPage from '@/pages/public/CollectionListPage.vue'

definePageMeta({ layout: 'public', name: 'collections' })

useSeoMeta({
  title: 'Bộ sưu tập - The Pocket Shoes',
  description:
    'Khám phá các bộ sưu tập giày được The Pocket Shoes chọn lọc theo phong cách và nhu cầu.',
  ogTitle: 'Bộ sưu tập - The Pocket Shoes',
  ogDescription: 'Các bộ sưu tập sneaker và giày thời trang nổi bật.',
})
</script>
