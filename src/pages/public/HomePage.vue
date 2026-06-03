<template>
  <main>
    <section class="pb-8">
      <div
        class="animate-hero-image relative min-h-[calc(100svh-128px)] w-full overflow-hidden bg-[#e8e8e5] shadow-[0_28px_80px_rgba(0,0,0,0.16)] md:min-h-[620px]"
      >
        <img
          v-if="heroImage"
          :src="heroImage"
          :alt="hero?.title || 'WALK banner'"
          class="absolute inset-0 h-full w-full object-cover grayscale"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-white/88 via-white/42 to-transparent" />
        <div
          class="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent"
        />
        <div
          class="relative z-10 flex min-h-[calc(100svh-128px)] flex-col justify-end px-4 py-10 md:min-h-[620px] md:justify-center md:px-10 lg:px-16"
        >
          <div
            class="animate-banner-copy max-w-[34rem] text-black drop-shadow-[0_10px_28px_rgba(255,255,255,0.75)]"
          >
            <p class="text-xs font-black tracking-[0.2em] uppercase md:text-sm">The Pocket Shoes</p>
            <h1
              class="mt-5 max-w-2xl text-4xl leading-[0.96] font-black tracking-tight sm:text-5xl lg:text-7xl"
            >
              {{ hero?.title || "SHOES YOU DIDN'T KNOW YOU NEED" }}
            </h1>
            <p
              class="mt-5 max-w-sm text-sm leading-6 font-medium text-black/75 md:mt-7 md:text-base md:leading-7"
            >
              {{ hero?.subtitle || 'We curate shoes you didn’t know you needed.' }}
            </p>
            <RouterLink
              :to="hero?.linkUrl || '/products'"
              class="mt-7 inline-flex w-fit bg-black px-6 py-3.5 text-xs font-black tracking-wide text-white uppercase no-underline shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-[0_22px_55px_rgba(0,0,0,0.35)] md:mt-8 md:px-7 md:py-4"
            >
              About us
            </RouterLink>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <SectionHeader title="Bộ sưu tập nổi bật?" to="/collections" label="Xem tất cả" />
      <CollectionSwiper :collections="collections" :loading="loading" />
    </section>

    <section class="mx-auto max-w-7xl px-4 pb-10 sm:px-6 md:pb-14 lg:px-8">
      <SectionHeader title="Sản phẩm nổi bật" to="/products" label="Xem tất cả" />
      <FeaturedProductSwiper :products="featured" :loading="loading" />
    </section>

    <section
      v-if="loading || randomBlog"
      class="mx-auto max-w-7xl px-4 pb-12 sm:px-6 md:pb-16 lg:px-8"
    >
      <SectionHeader title="Một bài blog hay" to="/blogs" label="Xem tất cả blog" />
      <UiSkeleton v-if="loading" variant="card" class="min-h-80" :rows="5" />
      <BlogCard v-else-if="randomBlog" :blog="randomBlog" layout="featured" />
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import CollectionSwiper from '@/components/home/CollectionSwiper.vue'
import FeaturedProductSwiper from '@/components/home/FeaturedProductSwiper.vue'
import BlogCard from '@/components/storefront/BlogCard.vue'
import { UiSkeleton } from '@/components/ui'
import { productApi } from '@/modules/catalog/product/api'
import { collectionApi } from '@/modules/content/collection/api'
import { blogApi } from '@/modules/content/blog/api'
import { bannerApi } from '@/modules/content/banner/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { ProductFeatured } from '@/modules/catalog/product/types'
import type { Collection } from '@/modules/content/collection/types'
import type { Blog } from '@/modules/content/blog/types'
import type { LandingBanner } from '@/modules/content/banner/types'

const loading = ref(true)
const featured = ref<ProductFeatured[]>([])
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
    return () =>
      h('div', { class: 'mb-8 flex items-center justify-between gap-4' }, [
        h('h2', { class: 'text-2xl font-black uppercase tracking-tight' }, props.title),
        h(
          RouterLink,
          { to: props.to, class: 'text-sm font-semibold text-black no-underline hover:opacity-60' },
          () => `${props.label} →`,
        ),
      ])
  },
})

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
