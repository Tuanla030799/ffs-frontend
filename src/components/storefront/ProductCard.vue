<template>
  <StorefrontCard as="RouterLink" :to="`/products/${product.slug}`" padding="none" class="h-full">
    <div
      v-if="product.isFeatured"
      class="absolute top-2.5 right-2.5 z-10 rounded-[10px] bg-gradient-to-r from-[#a90329] via-[#c44848] to-[#aa2238] px-2.5 py-1 text-[11px] font-semibold tracking-[1px] text-white uppercase shadow-[0_3px_10px_rgba(0,0,0,0.2)]"
    >
      Hot Sale
    </div>

    <template #media>
      <div class="overflow-hidden">
        <div class="h-[200px] overflow-hidden max-[400px]:h-[180px]">
          <StorefrontImage
            :src="primaryImageUrl(product)"
            :alt="product.name"
            class="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        </div>
      </div>
    </template>

    <div class="p-5">
      <div class="mb-[5px] text-[11px] font-semibold tracking-[1px] text-[#71717A] uppercase">
        {{ product.brandName || 'Thepocketshoes' }}
      </div>

      <h2
        class="mb-2.5 line-clamp-2 text-lg leading-tight font-bold tracking-[-0.5px] text-[#18181B]"
      >
        {{ product.name }}
      </h2>

      <!-- <p class="mb-3 line-clamp-2 min-h-9 text-[13px] leading-[1.4] text-[#52525B]">
        {{ product.shortDescription }}
      </p> -->

      <div class="mb-[15px] flex flex-wrap gap-1.5">
        <UiTag v-if="product.categoryName" variant="soft">{{ product.categoryName }}</UiTag>
        <UiTag v-if="product.gender" variant="soft">{{ product.gender }}</UiTag>
      </div>

      <div
        class="mb-3 flex items-center justify-between gap-3 max-[400px]:flex-col max-[400px]:items-start"
      >
        <div class="flex flex-col">
          <span
            v-if="originalPrice && discountPercentage"
            class="mb-0.5 text-[13px] text-[#A1A1AA] line-through"
          >
            {{ money(originalPrice) }}
          </span>
          <div class="flex flex-wrap items-center gap-2">
            <span class="text-xl font-bold text-[#18181B]">{{ money(displayPrice) }}</span>
            <span
              v-if="discountPercentage"
              class="rounded-md bg-[#FEE2E2] px-1.5 py-0.5 text-xs font-bold text-[#DC2626]"
              :aria-label="`Giảm ${discountPercentage} phần trăm`"
            >
              -{{ discountPercentage }}%
            </span>
          </div>
        </div>

        <!-- <UiButton
          native-type="button"
          variant="dark"
          size="sm"
          :disabled="!inStock"
          class="max-[400px]:w-full"
          @click.prevent.stop="handleAddToCart"
        >
          <template #icon>
            <img :src="addCartIcon" alt="" class="h-5 w-5" aria-hidden="true" />
          </template>
          <span>Add to Cart</span>
        </UiButton> -->
      </div>

      <!-- <div class="flex items-center justify-between border-t border-[#F4F4F5] pt-3">
        <div class="flex items-center gap-0.5">
          <svg
            v-for="index in 5"
            :key="index"
            class="h-4 w-4"
            viewBox="0 0 24 24"
            fill="#FFD700"
            stroke="#FFD700"
            stroke-width="0.5"
          >
            <polygon
              points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"
            />
          </svg>
          <span class="ml-1.5 text-[11px] text-[#71717A]">{{ reviewCount }} Reviews</span>
        </div>
        <div
          class="text-[11px] font-semibold"
          :class="inStock ? 'text-[#22C55E]' : 'text-[#A1A1AA]'"
        >
          {{ inStock ? 'In Stock' : 'Out of Stock' }}
        </div>
      </div> -->
    </div>
  </StorefrontCard>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import StorefrontCard from '@/components/storefront/StorefrontCard.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { UiTag } from '@/components/ui'
import type { Product, ProductFeatured } from '@/modules/catalog/product/types'
import { money } from '@/modules/shared/types'

const props = defineProps<{ product: Product | ProductFeatured }>()

const displayPrice = computed(() => productPrice(props.product))
const originalPrice = computed(() => productOriginalPrice(props.product))
const discountPercentage = computed(() => {
  const current = Number(displayPrice.value)
  const original = Number(originalPrice.value)

  if (
    !Number.isFinite(current) ||
    !Number.isFinite(original) ||
    original <= 0 ||
    current >= original
  ) {
    return 0
  }

  return Math.round(((original - current) / original) * 100)
})
// const inStock = computed(() => productStock(props.product) > 0)
// const reviewCount = computed(() => seededReviewCount(props.product.id || props.product.slug))

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

// function productStock(product: Product | ProductFeatured) {
//   if ('totalStock' in product) return product.totalStock || 0
//   return product.stock || 0
// }

// function seededReviewCount(seed: string) {
//   let hash = 0
//   for (const char of seed) {
//     hash = (hash * 31 + char.charCodeAt(0)) % 251
//   }
//   return hash
// }
</script>
