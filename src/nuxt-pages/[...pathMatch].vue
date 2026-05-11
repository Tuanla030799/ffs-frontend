<template>
  <NotFoundPage />
</template>

<script setup lang="ts">
import NotFoundPage from '@/pages/system/NotFoundPage.vue'

definePageMeta({ layout: 'public', name: 'not-found' })

useSeoMeta({ title: 'Khong tim thay trang', robots: 'noindex, nofollow' })
</script>
