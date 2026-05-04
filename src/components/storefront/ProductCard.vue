<template>
  <RouterLink
    :to="`/products/${product.slug}`"
    class="group block border border-black/5 bg-[#f7f7f5] no-underline shadow-sm transition hover:-translate-y-1 hover:shadow-xl"
  >
    <div class="relative aspect-[4/3] bg-[#f4f4f2] p-5">
      <span class="absolute top-4 right-4 text-xl text-black/70">♡</span>
      <img
        v-if="image"
        :src="image"
        :alt="product.name"
        class="h-full w-full object-contain transition duration-300 group-hover:scale-105"
      >
      <div
        v-else
        class="flex h-full items-center justify-center text-sm text-slate-400"
      >
        No image
      </div>
    </div>
    <div class="space-y-2 p-5">
      <h3 class="line-clamp-2 text-sm font-bold text-black">
        {{ product.name }}
      </h3>
      <p class="line-clamp-2 min-h-9 text-xs text-black/70">
        {{ product.brandName || product.shortDescription || product.categoryName || 'Shoes' }}
      </p>
      <div class="flex items-end gap-2">
        <span class="text-sm font-extrabold text-black">{{ money(product.salePrice || product.price) }}</span>
        <span
          v-if="product.salePrice && product.price"
          class="text-sm text-slate-400 line-through"
        >{{
          money(product.price)
        }}</span>
      </div>
      <p class="text-xs text-black/60">
        ⊙ {{ product.stock ?? '6.3k' }} lượt xem
      </p>
    </div>
  </RouterLink>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { money } from '@/modules/shared/types'
import type { Product } from '@/modules/catalog/product/types'
const props = defineProps<{ product: Product }>()
const image = computed(
  () => props.product.images?.find((item) => item.isPrimary)?.url || props.product.images?.[0]?.url || '',
)
</script>
