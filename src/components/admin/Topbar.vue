<template>
  <header class="sticky top-0 z-30 flex items-center justify-between border-b border-slate-200 bg-white px-4 py-3 sm:px-6">
    <div><h1 class="text-xl font-black text-slate-950">{{ title }}</h1><p class="text-sm text-slate-500">{{ description }}</p></div>
    <button class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold hover:bg-slate-50" @click="$emit('logout')">Logout</button>
  </header>
</template>
<script setup lang="ts">
defineProps<{ title: string; description: string }>()
defineEmits<{ logout: [] }>()
</script>
