<template>
  <CouponAdminPage />
</template>

<script setup lang="ts">
import CouponAdminPage from '@/pages/admin/promotion/CouponAdminPage.vue'

definePageMeta({ layout: 'admin', name: 'admin-coupons', middleware: 'admin' })
useSeoMeta({ robots: 'noindex, nofollow' })
</script>
