<template>
  <div>
    <p class="text-xs font-bold text-slate-400 uppercase">
      {{ label }}
    </p>
    <p class="mt-1 text-sm font-semibold break-words text-slate-800">
      {{ value || '-' }}
    </p>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  label: string
  value?: string | number
}>()
</script>
