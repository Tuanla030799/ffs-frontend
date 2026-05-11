<template>
  <AdminUserPage />
</template>

<script setup lang="ts">
import AdminUserPage from '@/pages/admin/user/AdminUserPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-users', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
