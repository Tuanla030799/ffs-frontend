<template>
  <RouterLink
    :to="`/products/${product.slug}`"
    class="group block bg-white text-black no-underline"
  >
    <div class="relative aspect-[1/1] overflow-hidden bg-[#f6f6f4]">
      <span
        class="absolute top-3 right-3 z-10 grid h-9 w-9 place-items-center rounded-full bg-white/90 text-xl text-black/70 transition group-hover:bg-white"
        >♡</span
      >
      <img
        v-if="image"
        :src="image"
        :alt="product.name"
        class="h-full w-full object-contain p-6 transition duration-300 group-hover:scale-[1.035]"
      />
      <div v-else class="flex h-full items-center justify-center text-sm text-slate-400">
        No image
      </div>
    </div>
    <div class="space-y-1 pt-3">
      <p class="text-sm font-bold text-black/55">
        {{ product.brandName || 'Fresh Shoes' }}
      </p>
      <h3 class="line-clamp-2 text-base leading-6 font-bold text-black">
        {{ product.name }}
      </h3>
      <p class="line-clamp-2 min-h-10 text-sm leading-5 text-black/55">
        {{ product.shortDescription }}
      </p>
      <div class="flex items-end gap-2 pt-1">
        <span class="text-sm font-black text-black">{{ money(displayPrice) }}</span>
        <span v-if="originalPrice" class="text-sm text-slate-400 line-through">{{
          money(originalPrice)
        }}</span>
      </div>
    </div>
  </RouterLink>
</template>
<script setup lang="ts">
import { computed } from 'vue'
import { RouterLink } from 'vue-router'
import { money } from '@/modules/shared/types'
import type { Product, ProductFeatured } from '@/modules/catalog/product/types'
import { resolveFileUrl } from '@/lib/fileUrl'
const props = defineProps<{ product: Product | ProductFeatured }>()
const image = computed(() => resolveFileUrl(primaryImageUrl(props.product)))
const displayPrice = computed(() => productPrice(props.product))
const originalPrice = computed(() => productOriginalPrice(props.product))

function primaryImageUrl(product: Product | ProductFeatured) {
  if ('primaryImageUrl' in product) return product.primaryImageUrl
  const primaryImage =
    product.images?.find((image) => image.isPrimary || image.imageType === 'MAIN') ||
    product.images?.[0]
  return primaryImage?.imageUrl || primaryImage?.url || ''
}

function productPrice(product: Product | ProductFeatured) {
  if ('minSalePrice' in product) return product.minSalePrice || product.minPrice
  return product.salePrice || product.price
}

function productOriginalPrice(product: Product | ProductFeatured) {
  if ('minPrice' in product) return product.minPrice
  return product.salePrice ? product.price : undefined
}
</script>
