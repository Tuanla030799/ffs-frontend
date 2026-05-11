<template>
  <div class="public-layout flex min-h-screen flex-col bg-white text-black">
    <StorefrontHeader />

    <main class="min-h-0 flex-1">
      <slot />
    </main>

    <StorefrontFooter />
  </div>
</template>

<script setup lang="ts">
import StorefrontFooter from '@/components/storefront/StorefrontFooter.vue'
import StorefrontHeader from '@/components/storefront/StorefrontHeader.vue'
</script>

<style scoped>
.public-layout {
  --public-header-height: 65px;
}
</style>
