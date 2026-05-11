<template>
  <BlogListPage />
</template>

<script setup lang="ts">
import BlogListPage from '@/pages/public/BlogListPage.vue'

definePageMeta({ layout: 'public', name: 'blogs' })

useSeoMeta({
  title: 'Blog - Thepocketshoes',
  description: 'Bai viet ve giay sneaker, phong cach va cach chon giay tu Thepocketshoes.',
  ogTitle: 'Blog - Thepocketshoes',
  ogDescription: 'Doc cac bai viet moi ve giay va thoi trang.',
})
</script>
