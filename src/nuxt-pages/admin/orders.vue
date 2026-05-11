<template>
  <OrderAdminPage />
</template>

<script setup lang="ts">
import OrderAdminPage from '@/pages/admin/sales/OrderAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-orders', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
