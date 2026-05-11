<template>
  <OrderSuccessPage />
</template>

<script setup lang="ts">
import OrderSuccessPage from '@/pages/public/OrderSuccessPage.vue'

definePageMeta({ layout: 'public', name: 'order-success' })

useSeoMeta({ robots: 'noindex, nofollow' })
</script>
