<template>
  <CollectionAdminPage />
</template>

<script setup lang="ts">
import CollectionAdminPage from '@/pages/admin/content/CollectionAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-collections', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
