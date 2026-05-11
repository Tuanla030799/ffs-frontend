<template>
  <CategoryAdminPage />
</template>

<script setup lang="ts">
import CategoryAdminPage from '@/pages/admin/catalog/CategoryAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-categories', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
