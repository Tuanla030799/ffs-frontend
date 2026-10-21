<template>
  <nav class="text-xs font-bold text-black/50" aria-label="Breadcrumb">
    <ol class="flex flex-wrap items-center gap-2">
      <li>
        <NuxtLink class="text-black/50 no-underline transition hover:text-black" to="/">
          Trang chủ
        </NuxtLink>
      </li>
      <li
        v-for="(item, index) in items"
        :key="`${item.label}-${index}`"
        class="flex items-center gap-2"
      >
        <span aria-hidden="true">/</span>
        <NuxtLink
          v-if="item.to"
          class="text-black/50 no-underline transition hover:text-black"
          :to="item.to"
        >
          {{ item.label }}
        </NuxtLink>
        <span v-else :aria-current="index === items.length - 1 ? 'page' : undefined">
          {{ item.label }}
        </span>
      </li>
    </ol>
  </nav>
</template>

<script setup lang="ts">
defineProps<{
  items: Array<{
    label: string
    to?: string
  }>
}>()
</script>
