<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[
        { label: 'Bộ sưu tập', to: '/collections' },
        { label: collection?.name || 'Chi tiết' },
      ]"
    />
    <div v-if="loading" class="space-y-12">
      <section
        class="grid overflow-hidden bg-[#f7f7f5] shadow-sm ring-1 ring-black/5 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <UiSkeleton variant="block" class="min-h-80 rounded-none" />
        <div class="flex flex-col justify-center p-5 md:p-12">
          <UiSkeleton :rows="4" />
        </div>
      </section>
      <section>
        <UiSkeleton variant="block" class="mb-6 h-8 w-72" />
        <div class="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          <UiSkeleton
            v-for="i in 4"
            :key="i"
            variant="card"
            media-class="aspect-square"
            :rows="4"
          />
        </div>
      </section>
    </div>
    <div v-else-if="collection" class="space-y-12">
      <section
        class="grid overflow-hidden bg-[#f7f7f5] shadow-sm ring-1 ring-black/5 lg:grid-cols-[1.1fr_0.9fr]"
      >
        <img
          :src="coverUrl(collection) || '/assets/home.jpg'"
          :alt="collection.name"
          class="h-full min-h-80 w-full object-cover grayscale"
        />
        <div class="flex flex-col justify-center p-5 md:p-12">
          <p class="text-sm font-bold tracking-[0.18em] text-black/50 uppercase">Collection</p>
          <h1 class="mt-4 text-3xl leading-none font-black uppercase md:text-5xl">
            {{ collection.name }}
          </h1>
          <SafeHtmlContent
            v-if="collectionDescriptionHtml"
            class="mt-6"
            :html="collectionDescriptionHtml"
          />
          <p v-else class="mt-6 leading-7 text-black/65">{{ collection.excerpt }}</p>
        </div>
      </section>
      <section>
        <h2 class="mb-6 text-2xl font-black uppercase">Sản phẩm trong bộ sưu tập</h2>
        <div v-if="products.length" class="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
        <div
          v-else
          class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-black/60"
        >
          Collection này chưa có sản phẩm.
        </div>
      </section>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import ProductCard from '@/components/storefront/ProductCard.vue'
import { UiSkeleton } from '@/components/ui'
import { collectionApi } from '@/modules/content/collection/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import { normalizeRichTextInput } from '@/lib/richText'
import type { ProductFeatured } from '@/modules/catalog/product/types'
import type { CollectionDetail } from '@/modules/content/collection/types'

const route = useRoute()
const { data: collection, pending: loading } = await useAsyncData(
  `collection-detail-${String(route.params.slug)}`,
  () => collectionApi.detail(String(route.params.slug), { page: 1, limit: 40 }),
)
const products = computed<ProductFeatured[]>(() => collection.value?.products || [])
const collectionDescriptionHtml = computed(() =>
  normalizeRichTextInput(collection.value?.descriptionHtml || collection.value?.descriptionJson),
)

function coverUrl(row: CollectionDetail) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}

useSeoMeta({
  title: () => (collection.value ? `${collection.value.name} - Thepocketshoes` : 'Bo suu tap'),
  description: () =>
    collection.value?.excerpt || 'Kham pha bo suu tap giay duoc chon loc tai Thepocketshoes.',
  ogTitle: () => collection.value?.name || 'Bo suu tap Thepocketshoes',
  ogDescription: () =>
    collection.value?.excerpt || 'Kham pha bo suu tap giay duoc chon loc tai Thepocketshoes.',
  ogImage: () => (collection.value ? coverUrl(collection.value) || undefined : undefined),
})
</script>
