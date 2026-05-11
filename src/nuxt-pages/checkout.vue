<template>
  <CheckoutPage />
</template>

<script setup lang="ts">
import CheckoutPage from '@/pages/public/CheckoutPage.vue'

definePageMeta({ layout: 'public', name: 'checkout' })

useSeoMeta({ robots: 'noindex, nofollow' })
</script>
