<template>
  <header
    class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6"
  >
    <div>
      <h1 class="text-xl font-black text-slate-950">{{ title }}</h1>
      <p class="text-sm text-slate-500">{{ description }}</p>
    </div>
    <UiButton variant="secondary" size="sm" @click="$emit('logout')"> Logout </UiButton>
  </header>
</template>
<script setup lang="ts">
import { UiButton } from '@/components/ui'
defineProps<{ title: string; description: string }>()
defineEmits<{ logout: [] }>()
</script>
