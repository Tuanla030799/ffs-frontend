<template>
  <BlogAdminFormPage />
</template>

<script setup lang="ts">
import BlogAdminFormPage from '@/pages/admin/content/BlogAdminFormPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-blog-edit', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
