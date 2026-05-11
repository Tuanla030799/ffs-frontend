<template>
  <BlogDetailPage />
</template>

<script setup lang="ts">
import BlogDetailPage from '@/pages/public/BlogDetailPage.vue'

definePageMeta({ layout: 'public', name: 'blog-detail' })

useSeoMeta({
  title: 'Blog Fresh Shoes',
  description: 'Bai viet va cam hung thoi trang tu Fresh Shoes.',
  ogTitle: 'Blog Fresh Shoes',
  ogDescription: 'Bai viet va cam hung thoi trang tu Fresh Shoes.',
})
</script>
