<template>
  <section class="space-y-4"><div class="flex flex-wrap items-center justify-between gap-3"><h2 class="text-2xl font-black">{{ title }}</h2><div class="flex gap-2"><button class="rounded-xl border bg-white px-4 py-2 font-bold" @click="$emit('reload')">Reload</button><button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white" @click="$emit('create')">Create</button></div></div><slot name="form" /><p v-if="error" class="rounded-xl bg-red-50 p-3 text-red-700">{{ error }}</p><div class="overflow-x-auto rounded-3xl border border-slate-200 bg-white"><div v-if="loading" class="p-8 text-center text-slate-500">Loading...</div><slot v-else /></div></section>
</template>
<script setup lang="ts">
defineProps<{ title: string; loading?: boolean; error?: string }>()
defineEmits<{ create: []; reload: [] }>()
</script>
