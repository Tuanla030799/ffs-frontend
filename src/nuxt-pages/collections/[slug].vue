<template>
  <CollectionDetailPage />
</template>

<script setup lang="ts">
import CollectionDetailPage from '@/pages/public/CollectionDetailPage.vue'

definePageMeta({ layout: 'public', name: 'collection-detail' })

useSeoMeta({
  title: 'Bo suu tap - Fresh Shoes',
  description: 'Kham pha cac bo suu tap giay duoc chon loc tai Fresh Shoes.',
  ogTitle: 'Bo suu tap - Fresh Shoes',
  ogDescription: 'Kham pha cac bo suu tap giay duoc chon loc tai Fresh Shoes.',
})
</script>
