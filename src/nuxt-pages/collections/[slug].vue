<template>
  <CollectionDetailPage />
</template>

<script setup lang="ts">
import CollectionDetailPage from '@/pages/public/CollectionDetailPage.vue'

definePageMeta({ layout: 'public', name: 'collection-detail' })

useSeoMeta({
  title: 'Bộ sưu tập - The Pocket Shoes',
  description: 'Khám phá các bộ sưu tập giày được chọn lọc tại The Pocket Shoes.',
  ogTitle: 'Bộ sưu tập - The Pocket Shoes',
  ogDescription: 'Khám phá các bộ sưu tập giày được chọn lọc tại The Pocket Shoes.',
})
</script>
