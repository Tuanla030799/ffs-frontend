<template>
  <BlogDetailPage />
</template>

<script setup lang="ts">
import BlogDetailPage from '@/pages/public/BlogDetailPage.vue'

definePageMeta({ layout: 'public', name: 'blog-detail' })

useSeoMeta({
  title: 'Blog - The Pocket Shoes',
  description: 'Bài viết và cảm hứng thời trang từ The Pocket Shoes.',
  ogTitle: 'Blog - The Pocket Shoes',
  ogDescription: 'Bài viết và cảm hứng thời trang từ The Pocket Shoes.',
})
</script>
