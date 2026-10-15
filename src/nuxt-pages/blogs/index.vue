<template>
  <BlogListPage />
</template>

<script setup lang="ts">
import BlogListPage from '@/pages/public/BlogListPage.vue'

definePageMeta({ layout: 'public', name: 'blogs' })

useSeoMeta({
  title: 'Blog - The Pocket Shoes',
  description: 'Bài viết về giày sneaker, phong cách và cách chọn giày từ The Pocket Shoes.',
  ogTitle: 'Blog - The Pocket Shoes',
  ogDescription: 'Đọc các bài viết mới về giày và thời trang.',
})
</script>
