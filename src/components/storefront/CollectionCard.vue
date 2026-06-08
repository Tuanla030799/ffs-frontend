<template>
  <StorefrontCard
    as="RouterLink"
    :to="`/collections/${collection.slug}`"
    padding="none"
    class="h-full"
  >
    <template #media>
      <div class="aspect-[4/3] overflow-hidden bg-[#ededeb]">
        <StorefrontImage
          :src="collection.coverUrl || collection.imageUrl"
          :alt="collection.name"
          class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
        />
      </div>
    </template>

    <div class="p-5 md:p-6">
      <p class="text-xs font-bold tracking-[0.16em] text-black/50 uppercase">
        {{ collection.productCount || collection.products?.length || 0 }} sản phẩm
      </p>
      <h2 class="mt-2 line-clamp-2 text-xl leading-tight font-black md:text-2xl">
        {{ collection.name }}
      </h2>
      <p class="mt-3 line-clamp-2 text-sm leading-6 text-black/65">
        {{ collection.excerpt }}
      </p>
      <span
        v-if="showArrow"
        class="mt-6 inline-block text-2xl transition group-hover:translate-x-2"
      >
        →
      </span>
    </div>
  </StorefrontCard>
</template>

<script setup lang="ts">
import StorefrontCard from '@/components/storefront/StorefrontCard.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import type { Collection, CollectionDetail } from '@/modules/content/collection/types'

withDefaults(
  defineProps<{
    collection: Collection | CollectionDetail
    showArrow?: boolean
  }>(),
  {
    showArrow: false,
  },
)
</script>
