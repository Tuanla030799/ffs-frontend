<template>
  <div class="public-layout flex min-h-screen flex-col bg-white text-black">
    <StorefrontHeader />

    <main class="min-h-0 flex-1">
      <RouterView />
    </main>

    <StorefrontFooter />
  </div>
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import StorefrontHeader from '@/components/storefront/StorefrontHeader.vue'
import StorefrontFooter from '@/components/storefront/StorefrontFooter.vue'
</script>

<style scoped>
.public-layout {
  --public-header-height: 65px;
}
</style>
