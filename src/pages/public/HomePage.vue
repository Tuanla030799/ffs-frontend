<template>
  <main>
    <section class="pb-8">
      <div class="animate-hero-image relative min-h-[calc(100svh-128px)] w-full overflow-hidden bg-[#e8e8e5] shadow-[0_28px_80px_rgba(0,0,0,0.16)] md:min-h-[620px]">
        <img
          v-if="heroImage"
          :src="heroImage"
          :alt="hero?.title || 'WALK banner'"
          class="absolute inset-0 h-full w-full object-cover grayscale"
        >
        <div class="absolute inset-0 bg-gradient-to-r from-white/88 via-white/42 to-transparent" />
        <div class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
        <div class="relative z-10 flex min-h-[calc(100svh-128px)] flex-col justify-end px-4 py-10 md:min-h-[620px] md:justify-center md:px-10 lg:px-16">
          <div class="animate-banner-copy max-w-[34rem] text-black drop-shadow-[0_10px_28px_rgba(255,255,255,0.75)]">
            <p class="text-xs font-black uppercase tracking-[0.2em] md:text-sm">{{ hero?.title ? 'Walk story' : 'We find' }}</p>
            <h1 class="mt-5 max-w-2xl text-4xl font-black leading-[0.96] tracking-tight sm:text-5xl lg:text-7xl">
              {{ hero?.title || "SHOES YOU DIDN'T KNOW YOU NEED" }}
            </h1>
            <p class="mt-5 max-w-sm text-sm font-medium leading-6 text-black/75 md:mt-7 md:text-base md:leading-7">
              {{ hero?.subtitle || 'Một đôi giày phù hợp sẽ đưa bạn đến những nơi tuyệt vời.' }}
            </p>
            <RouterLink
              :to="hero?.linkUrl || '/products'"
              class="mt-7 inline-flex w-fit bg-black px-6 py-3.5 text-xs font-black uppercase tracking-wide text-white no-underline shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-[0_22px_55px_rgba(0,0,0,0.35)] md:mt-8 md:px-7 md:py-4"
            >
              Khám phá ngay
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section v-if="collections.length" class="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <SectionHeader title="Bạn đang tìm?" to="/products" label="Xem tất cả" />
      <div class="grid gap-4 sm:grid-cols-2 md:gap-6 lg:grid-cols-4">
        <RouterLink
          v-for="(collection, index) in collections.slice(0, 4)"
          :key="collection.id"
          :to="`/collections/${collection.slug}`"
          class="animate-fade-up group overflow-hidden bg-[#f7f7f5] text-black no-underline shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
          :style="{ animationDelay: `${index * 80}ms` }"
        >
          <div class="aspect-[4/3] bg-[#eeeeeb]">
            <img
              v-if="coverUrl(collection)"
              :src="coverUrl(collection)"
              :alt="collection.name"
              class="h-full w-full object-cover grayscale transition duration-500 group-hover:scale-105 group-hover:grayscale-0"
            >
          </div>
          <div class="p-5 md:p-6">
            <h3 class="font-black">{{ collection.name }}</h3>
            <p class="mt-2 line-clamp-2 text-sm text-black/65">{{ collection.description || `${collection.productCount || 0} sản phẩm` }}</p>
            <span class="mt-6 inline-block text-2xl transition group-hover:translate-x-2">→</span>
          </div>
        </RouterLink>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:pb-14 lg:px-8">
      <SectionHeader title="Sản phẩm nổi bật" to="/products" label="Xem tất cả" />
      <div v-if="loading" class="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-5">
        <div v-for="i in 5" :key="i" class="h-80 animate-pulse bg-black/10" />
      </div>
      <div v-else-if="featured.length" class="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-5">
        <ProductCard
          v-for="(product, index) in featured.slice(0, 5)"
          :key="product.id"
          :product="product"
          class="animate-fade-up"
          :style="{ animationDelay: `${index * 70}ms` }"
        />
      </div>
      <div v-else class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-black/60">
        Chưa có sản phẩm nổi bật.
      </div>
    </section>

    <section v-if="randomBlog" class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 md:pb-16 lg:px-8">
      <SectionHeader title="Một bài blog hay" to="/blogs" label="Xem tất cả blog" />
      <RouterLink
        :to="`/blogs/${randomBlog.slug}`"
        class="animate-fade-up grid bg-[#f7f7f5] text-black no-underline shadow-sm ring-1 ring-black/5 md:grid-cols-[1.15fr_1fr]"
      >
        <img
          v-if="coverUrl(randomBlog)"
          :src="coverUrl(randomBlog)"
          :alt="randomBlog.title"
          class="h-64 w-full object-cover grayscale transition duration-500 hover:grayscale-0 md:h-full md:min-h-72"
        >
        <div v-else class="min-h-72 bg-[#e8e8e5]" />
        <div class="flex flex-col justify-center p-5 md:p-10">
          <p class="text-sm font-semibold">{{ formatDateTime(randomBlog.publishedAt || randomBlog.createdAt) }}</p>
          <h2 class="mt-5 max-w-md text-2xl font-black leading-tight md:text-3xl">{{ randomBlog.title }}</h2>
          <p class="mt-5 max-w-md text-sm leading-6 text-black/65">{{ randomBlog.excerpt }}</p>
          <span class="mt-8 inline-flex w-fit bg-black px-6 py-3 text-xs font-black uppercase tracking-wide text-white">
            Đọc ngay →
          </span>
        </div>
      </RouterLink>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import ProductCard from '@/components/storefront/ProductCard.vue'
import { productApi } from '@/modules/catalog/product/api'
import { collectionApi } from '@/modules/content/collection/api'
import { blogApi } from '@/modules/content/blog/api'
import { bannerApi } from '@/modules/content/banner/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatDateTime } from '@/modules/shared/types'
import type { Product } from '@/modules/catalog/product/types'
import type { Collection } from '@/modules/content/collection/types'
import type { Blog } from '@/modules/content/blog/types'
import type { LandingBanner } from '@/modules/content/banner/types'

const loading = ref(true)
const featured = ref<Product[]>([])
const collections = ref<Collection[]>([])
const banners = ref<LandingBanner[]>([])
const randomBlog = ref<Blog | null>(null)
const hero = computed(() => banners.value[0])
const heroImage = computed(() => resolveFileUrl(hero.value?.imageUrl || ''))

const SectionHeader = defineComponent({
  props: {
    title: { type: String, required: true },
    to: { type: String, required: true },
    label: { type: String, default: 'Xem tất cả' },
  },
  setup(props) {
    return () => h('div', { class: 'mb-8 flex items-center justify-between gap-4' }, [
      h('h2', { class: 'text-2xl font-black uppercase tracking-tight' }, props.title),
      h(RouterLink, { to: props.to, class: 'text-sm font-semibold text-black no-underline hover:opacity-60' }, () => `${props.label} →`),
    ])
  },
})

function coverUrl(row: { coverUrl?: string; imageUrl?: string }) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}

onMounted(async () => {
  try {
    const [bannerRows, productRows, collectionRows, blogRows] = await Promise.all([
      bannerApi.publicList(),
      productApi.featured(10),
      collectionApi.list({ page: 1, limit: 8 }),
      blogApi.list({ page: 1, limit: 20 }),
    ])
    banners.value = bannerRows
    featured.value = productRows
    collections.value = collectionRows.items
    const availableBlogs = blogRows.items
    const randomIndex = Math.floor(Math.random() * availableBlogs.length)
    randomBlog.value = availableBlogs.length ? availableBlogs[randomIndex] || null : null
  } finally {
    loading.value = false
  }
})
</script>
