<template>
  <SitePageAdminFormPage />
</template>

<script setup lang="ts">
import SitePageAdminFormPage from '@/pages/admin/content/SitePageAdminFormPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-page-edit', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
