<template>
  <ProductAdminPage />
</template>

<script setup lang="ts">
import ProductAdminPage from '@/pages/admin/catalog/ProductAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-products', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
