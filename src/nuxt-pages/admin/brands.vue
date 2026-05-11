<template>
  <BrandAdminPage />
</template>

<script setup lang="ts">
import BrandAdminPage from '@/pages/admin/content/BrandAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-brands', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
