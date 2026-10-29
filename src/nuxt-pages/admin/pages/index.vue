<template>
  <SitePageAdminPage />
</template>

<script setup lang="ts">
import SitePageAdminPage from '@/pages/admin/content/SitePageAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-pages', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
