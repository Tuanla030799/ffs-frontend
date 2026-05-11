<template>
  <BannerAdminPage />
</template>

<script setup lang="ts">
import BannerAdminPage from '@/pages/admin/content/BannerAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-banners', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
