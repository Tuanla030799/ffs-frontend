<template>
  <HomePage />
</template>

<script setup lang="ts">
import HomePage from '@/pages/public/HomePage.vue'

definePageMeta({ layout: 'public', name: 'home' })

useSeoMeta({
  title: 'Thepocketshoes - Giay sneaker va thoi trang',
  description:
    'Thepocketshoes mang den cac mau giay sneaker, bo suu tap va bai viet thoi trang moi.',
  ogTitle: 'Thepocketshoes',
  ogDescription: 'Kham pha giay sneaker, bo suu tap noi bat va cam hung phoi do moi.',
})
</script>
