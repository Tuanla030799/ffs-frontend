<template>
  <main>
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div v-if="error" class="mb-4 rounded-2xl bg-red-50 p-4 text-red-700">{{ error }}</div>
      <div class="grid gap-6 lg:grid-cols-[1.4fr_.6fr]">
        <div class="overflow-hidden rounded-[2rem] bg-slate-950 text-white shadow-xl">
          <img v-if="hero?.imageUrl" :src="hero.imageUrl" class="h-80 w-full object-cover opacity-80" alt="hero">
          <div class="p-8"><p class="text-sm font-bold uppercase tracking-widest text-sky-300">Fresh Shoes</p><h1 class="mt-3 max-w-2xl text-4xl font-black tracking-tight sm:text-6xl">{{ hero?.title || 'Giày đẹp, giá tốt, mua cực nhanh' }}</h1><p class="mt-4 max-w-xl text-slate-300">{{ hero?.subtitle || 'Storefront hiện đại kết nối trực tiếp API backend Spring Boot.' }}</p><RouterLink to="/products" class="mt-6 inline-flex rounded-full bg-white px-6 py-3 font-bold text-slate-950 no-underline">Mua ngay</RouterLink></div>
        </div>
        <div class="grid gap-4"><RouterLink v-for="category in categories.slice(0, 4)" :key="category.id" :to="`/products?categorySlug=${category.slug}`" class="rounded-3xl border border-slate-200 bg-white p-5 no-underline shadow-sm hover:shadow-md"><p class="text-xs font-bold uppercase text-slate-400">Category</p><h3 class="mt-1 text-xl font-black text-slate-950">{{ category.name }}</h3><p class="mt-2 line-clamp-2 text-sm text-slate-500">{{ category.description }}</p></RouterLink></div>
      </div>
    </section>
    <section class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8"><div class="mb-5 flex items-end justify-between"><div><p class="text-sm font-bold uppercase text-[var(--ui-primary)]">Featured</p><h2 class="text-3xl font-black">Sản phẩm nổi bật</h2></div><RouterLink to="/products" class="font-bold text-slate-700">Xem tất cả</RouterLink></div><div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><div v-for="i in 8" :key="i" class="h-80 animate-pulse rounded-3xl bg-slate-200" /></div><div v-else-if="featured.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><ProductCard v-for="product in featured" :key="product.id" :product="product" /></div><div v-else class="rounded-3xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-500">Chưa có sản phẩm nổi bật.</div></section>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProductCard from '@/components/storefront/ProductCard.vue'
import { productApi } from '@/modules/catalog/product/api'
import { categoryApi } from '@/modules/catalog/category/api'
import { bannerApi } from '@/modules/content/banner/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { Product } from '@/modules/catalog/product/types'
import type { Category } from '@/modules/catalog/category/types'
import type { LandingBanner } from '@/modules/content/banner/types'
const loading = ref(true); const error = ref(''); const featured = ref<Product[]>([]); const categories = ref<Category[]>([]); const banners = ref<LandingBanner[]>([])
const hero = computed(() => banners.value[0])
onMounted(async () => { try { const [bannerRows, categoryRows, productRows] = await Promise.all([bannerApi.publicList(), categoryApi.publicList(), productApi.featured(12)]); banners.value = bannerRows; categories.value = categoryRows; featured.value = productRows } catch (err) { error.value = getErrorMessage(err) } finally { loading.value = false } })
</script>
