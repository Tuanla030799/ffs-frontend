<template>
  <CustomerFeedbackAdminPage />
</template>

<script setup lang="ts">
import CustomerFeedbackAdminPage from '@/pages/admin/content/CustomerFeedbackAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-feedbacks', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
