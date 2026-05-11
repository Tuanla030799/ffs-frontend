<template>
  <DashboardPage />
</template>

<script setup lang="ts">
import DashboardPage from '@/pages/admin/DashboardPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-dashboard', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
