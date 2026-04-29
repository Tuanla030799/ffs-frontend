<template>
  <RouterLink :to="`/products/${product.slug}`" class="group block overflow-hidden rounded-3xl border border-[var(--ui-border)] bg-white no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-xl">
    <div class="aspect-square bg-slate-100">
      <img v-if="image" :src="image" :alt="product.name" class="h-full w-full object-cover transition duration-300 group-hover:scale-105">
      <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">No image</div>
    </div>
    <div class="space-y-2 p-4">
      <p class="text-xs font-semibold uppercase tracking-wide text-[var(--ui-primary)]">{{ product.categoryName || 'Shoes' }}</p>
      <h3 class="line-clamp-2 text-base font-bold text-slate-950">{{ product.name }}</h3>
      <p class="line-clamp-2 min-h-10 text-sm text-slate-500">{{ product.shortDescription }}</p>
      <div class="flex items-end gap-2">
        <span class="text-lg font-extrabold text-rose-600">{{ money(product.salePrice || product.price) }}</span>
        <span v-if="product.salePrice && product.price" class="text-sm text-slate-400 line-through">{{ money(product.price) }}</span>
      </div>
    </div>
  </RouterLink>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { money } from '@/modules/shared/types'
import type { Product } from '@/modules/catalog/product/types'
const props = defineProps<{ product: Product }>()
const image = computed(() => props.product.images?.find((item) => item.isPrimary)?.url || props.product.images?.[0]?.url || '')
</script>
