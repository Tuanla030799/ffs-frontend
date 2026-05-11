<template>
  <BlogAdminPage />
</template>

<script setup lang="ts">
import BlogAdminPage from '@/pages/admin/content/BlogAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-blogs', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
