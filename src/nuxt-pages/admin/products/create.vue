<template>
  <ProductAdminFormPage />
</template>

<script setup lang="ts">
import ProductAdminFormPage from '@/pages/admin/catalog/ProductAdminFormPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-product-create', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
