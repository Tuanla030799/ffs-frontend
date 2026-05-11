<template>
  <ColorAdminPage />
</template>

<script setup lang="ts">
import ColorAdminPage from '@/pages/admin/catalog/ColorAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-colors', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
