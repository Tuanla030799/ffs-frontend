<template>
  <FaqAdminPage />
</template>

<script setup lang="ts">
import FaqAdminPage from '@/pages/admin/content/FaqAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-faqs', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
