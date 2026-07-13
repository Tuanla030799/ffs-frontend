<template>
  <LogStreamPage />
</template>

<script setup lang="ts">
import LogStreamPage from '@/pages/admin/system/LogStreamPage.vue'

definePageMeta({
  layout: 'admin',
  name: 'admin-logs',
  middleware: 'admin',
  title: 'Backend logs',
  description: 'Theo dõi log backend theo thời gian thực.',
})
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
