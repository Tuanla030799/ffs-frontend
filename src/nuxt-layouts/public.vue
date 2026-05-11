<template>
  <div class="min-h-screen bg-[#f7f7f5] text-black">
    <StorefrontHeader />
    <slot />
    <StorefrontFooter />
  </div>
</template>

<script setup lang="ts">
import StorefrontFooter from '@/components/storefront/StorefrontFooter.vue'
import StorefrontHeader from '@/components/storefront/StorefrontHeader.vue'
</script>
