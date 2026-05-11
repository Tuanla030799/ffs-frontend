<template>
  <SizeAdminPage />
</template>

<script setup lang="ts">
import SizeAdminPage from '@/pages/admin/catalog/SizeAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-sizes', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
