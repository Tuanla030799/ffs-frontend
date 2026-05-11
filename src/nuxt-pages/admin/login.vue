<template>
  <LoginPage />
</template>

<script setup lang="ts">
import LoginPage from '@/pages/admin/LoginPage.vue'

definePageMeta({ layout: false, name: 'admin-login', middleware: 'guest-admin' })

useSeoMeta({ robots: 'noindex, nofollow' })
</script>
