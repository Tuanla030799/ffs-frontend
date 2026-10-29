<template>
  <main>
    <section class="pb-8">
      <div
        class="animate-hero-image relative w-full overflow-hidden shadow-[0_28px_80px_rgba(0,0,0,0.16)] md:min-h-[620px] md:bg-[#e8e8e5]"
        :class="heroMobileImageUrl ? 'bg-[#e8e8e5]' : 'bg-white'"
      >
        <!-- Desktop: ảnh phủ toàn khung, chữ đè bên trái. Mobile có ảnh riêng (9:16, chừa chỗ
             phía dưới): chữ đè lên phần dưới ảnh. Mobile chỉ có ảnh desktop: ảnh cắt lấp kín khung
             nên chữ xếp xuống dưới ảnh để không che sản phẩm. -->
        <div
          class="bg-[#e8e8e5] md:absolute md:inset-0 md:aspect-auto"
          :class="heroMobileImageUrl ? 'absolute inset-0' : 'relative aspect-[5/4]'"
        >
          <!-- Trình duyệt chỉ tải một ảnh theo độ rộng màn hình; HTML giống nhau mọi thiết bị
               nên cache edge vẫn dùng chung. -->
          <picture>
            <source
              v-if="heroMobileImageUrl"
              media="(max-width: 767px)"
              :srcset="heroMobileImageUrl"
            />
            <!-- Không có ảnh mobile: banner desktop thường đặt sản phẩm ở nửa phải (nửa trái
                 chừa chỗ cho chữ), nên khung mobile lấy nét về bên phải. -->
            <StorefrontImage
              :src="hero?.imageUrl"
              :alt="hero?.title || 'WALK banner'"
              :fallback-src="null"
              loading="eager"
              fetchpriority="high"
              class="absolute inset-0 h-full w-full object-cover md:object-center"
              :class="heroMobileImageUrl ? 'object-center' : 'object-[95%_center]'"
            />
          </picture>
        </div>
        <div
          class="absolute inset-0 hidden bg-gradient-to-t from-black/20 via-transparent to-transparent md:block"
        />
        <div
          class="relative z-10 flex flex-col px-4 pt-6 pb-8 md:min-h-[620px] md:justify-center md:px-10 md:py-10 lg:px-16"
          :class="heroMobileImageUrl ? 'aspect-[9/16] justify-end md:aspect-auto' : ''"
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
            <NuxtLink
              :to="hero?.linkUrl || '/about'"
              class="mt-7 inline-flex w-fit bg-black px-6 py-3.5 text-xs font-black tracking-wide text-white uppercase no-underline shadow-[0_18px_45px_rgba(0,0,0,0.28)] transition hover:-translate-y-0.5 hover:bg-black/80 hover:shadow-[0_22px_55px_rgba(0,0,0,0.35)] md:mt-8 md:px-7 md:py-4"
            >
              {{ hero?.linkUrl ? 'Khám phá ngay' : 'Về chúng tôi' }}
            </NuxtLink>
          </div>
        </div>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-10 sm:px-6 md:py-14 lg:px-8">
      <SectionHeader title="Bộ sưu tập nổi bật" to="/collections" label="Xem tất cả" />
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
import { computed, defineComponent, h } from 'vue'
import { useAsyncData, useRequestEvent } from '#imports'
import { NuxtLink } from '#components'
import CollectionSwiper from '@/components/home/CollectionSwiper.vue'
import FeaturedProductSwiper from '@/components/home/FeaturedProductSwiper.vue'
import BlogCard from '@/components/storefront/BlogCard.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { UiSkeleton } from '@/components/ui'
import { resolveFileUrl } from '@/lib/fileUrl'
import { productApi } from '@/modules/catalog/product/api'
import { collectionApi } from '@/modules/content/collection/api'
import { blogApi } from '@/modules/content/blog/api'
import { bannerApi } from '@/modules/content/banner/api'

const requestEvent = import.meta.server ? useRequestEvent() : undefined

// Tải song song và chịu lỗi từng phần: một API lỗi không làm trống cả trang chủ. Dữ liệu
// được lấy ngay khi SSR; `lazy` để điều hướng phía client hiện skeleton thay vì chờ.
const { data: home, pending } = await useAsyncData(
  'home-page',
  async () => {
    const [bannerResult, featuredResult, collectionResult, blogResult] = await Promise.allSettled([
      bannerApi.publicList(),
      productApi.featured(10),
      collectionApi.list({ page: 1, limit: 8 }),
      blogApi.list({ page: 1, limit: 12 }),
    ])
    const results = [bannerResult, featuredResult, collectionResult, blogResult]
    // Có phần lỗi thì không lưu HTML vào cache edge (xem server/plugins/edge-cache.ts).
    if (requestEvent && results.some((result) => result.status === 'rejected')) {
      requestEvent.context.skipEdgeCache = true
    }

    const blogs = blogResult.status === 'fulfilled' ? blogResult.value.items : []
    return {
      hero: bannerResult.status === 'fulfilled' ? bannerResult.value[0] || null : null,
      featured: featuredResult.status === 'fulfilled' ? featuredResult.value : [],
      collections: collectionResult.status === 'fulfilled' ? collectionResult.value.items : [],
      randomBlog: blogs.length ? blogs[Math.floor(Math.random() * blogs.length)] || null : null,
    }
  },
  { lazy: true, deep: false },
)

const loading = computed(() => pending.value && !home.value)
const hero = computed(() => home.value?.hero || null)
const heroMobileImageUrl = computed(() => resolveFileUrl(hero.value?.mobileImageUrl || ''))
const featured = computed(() => home.value?.featured || [])
const collections = computed(() => home.value?.collections || [])
const randomBlog = computed(() => home.value?.randomBlog || null)

const SectionHeader = defineComponent({
  props: {
    title: { type: String, required: true },
    to: { type: String, required: true },
    label: { type: String, default: 'Xem tất cả' },
  },
  setup(props) {
    return () =>
      h('div', { class: 'mb-8 flex items-center justify-between gap-4' }, [
        h('h2', { class: 'text-2xl font-black tracking-tight' }, props.title),
        h(
          NuxtLink,
          { to: props.to, class: 'text-sm font-semibold text-black no-underline hover:opacity-60' },
          () => `${props.label} →`,
        ),
      ])
  },
})
</script>
