<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <div v-if="loading" class="h-96 animate-pulse bg-black/10" />
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
          <p class="mt-6 leading-7 text-black/65">{{ collection.description }}</p>
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
import { computed, onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import ProductCard from '@/components/storefront/ProductCard.vue'
import { collectionApi } from '@/modules/content/collection/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { Product } from '@/modules/catalog/product/types'
import type { Collection } from '@/modules/content/collection/types'

const route = useRoute()
const loading = ref(false)
const collection = ref<Collection | null>(null)
const products = computed<Product[]>(
  () =>
    (collection.value?.products?.map((item) => item.product).filter(Boolean) as Product[]) || [],
)

function coverUrl(row: Collection) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}

onMounted(async () => {
  loading.value = true
  try {
    collection.value = await collectionApi.detail(String(route.params.slug), { page: 1, limit: 40 })
  } finally {
    loading.value = false
  }
})
</script>
