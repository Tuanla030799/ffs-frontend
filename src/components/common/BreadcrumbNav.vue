<template>
  <nav class="flex flex-wrap items-center gap-2 text-xs font-bold text-black/50">
    <RouterLink class="text-black/50 no-underline transition hover:text-black" to="/"
      >Home</RouterLink
    >
    <template v-for="item in items" :key="item.label">
      <span>/</span>
      <RouterLink
        v-if="item.to"
        class="text-black/50 no-underline transition hover:text-black"
        :to="item.to"
      >
        {{ item.label }}
      </RouterLink>
      <span v-else>{{ item.label }}</span>
    </template>
  </nav>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'

defineProps<{
  items: Array<{
    label: string
    to?: string
  }>
}>()
</script>
