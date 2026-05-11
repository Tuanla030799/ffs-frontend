<template>
  <section class="rounded-2xl border border-slate-200 bg-white">
    <h4 class="border-b border-slate-200 px-4 py-3 font-black text-slate-950">
      {{ title }}
    </h4>
    <div class="p-4">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
defineProps<{
  title: string
}>()
</script>
