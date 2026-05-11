<template>
  <CustomerAdminPage />
</template>

<script setup lang="ts">
import CustomerAdminPage from '@/pages/admin/customer/CustomerAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-customers', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
