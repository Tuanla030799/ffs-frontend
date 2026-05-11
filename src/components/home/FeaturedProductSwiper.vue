<template>
  <div class="relative">
    <div
      v-if="loading"
      class="grid auto-cols-[82%] grid-flow-col gap-4 overflow-hidden sm:auto-cols-[48%] lg:auto-cols-[24%]"
    >
      <UiSkeleton
        v-for="index in 4"
        :key="index"
        variant="card"
        class="h-80"
        media-class="aspect-square"
        :rows="4"
      />
    </div>

    <Swiper
      v-else-if="products.length"
      class="home-swiper"
      :modules="modules"
      :slides-per-view="1.2"
      :space-between="16"
      :navigation="{
        prevEl: '.featured-product-swiper-prev',
        nextEl: '.featured-product-swiper-next',
      }"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 3600, disableOnInteraction: true, pauseOnMouseEnter: true }"
      :breakpoints="breakpoints"
      :watch-overflow="true"
    >
      <SwiperSlide v-for="product in products" :key="product.id" class="!h-auto">
        <ProductCard :product="product" class="h-full w-full" />
      </SwiperSlide>
    </Swiper>

    <button
      v-if="products.length"
      type="button"
      class="featured-product-swiper-prev swiper-nav-button -left-3 md:-left-5 lg:-left-6"
      aria-label="Previous products"
    >
      ‹
    </button>
    <button
      v-if="products.length"
      type="button"
      class="featured-product-swiper-next swiper-nav-button -right-3 md:-right-5 lg:-right-6"
      aria-label="Next products"
    >
      ›
    </button>

    <div
      v-if="!products.length && !loading"
      class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-black/60"
    >
      Chưa có sản phẩm nổi bật.
    </div>
  </div>
</template>

<script setup lang="ts">
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import { UiSkeleton } from '@/components/ui'
import ProductCard from '@/components/storefront/ProductCard.vue'
import type { ProductFeatured } from '@/modules/catalog/product/types'

defineProps<{
  products: ProductFeatured[]
  loading?: boolean
}>()

const modules = [Navigation, Pagination, Autoplay]
const breakpoints = {
  480: { slidesPerView: 1.5, spaceBetween: 16 },
  768: { slidesPerView: 2.4, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 20 },
  1280: { slidesPerView: 4, spaceBetween: 24 },
}
</script>

<style scoped>
.home-swiper {
  --swiper-navigation-color: #000;
  --swiper-pagination-color: #000;
  --swiper-navigation-size: 22px;
  padding: 0 2px 42px;
}

.home-swiper :deep(.swiper-wrapper) {
  align-items: stretch;
}

.home-swiper :deep(.swiper-slide) {
  display: flex;
  width: 100%;
}

.home-swiper :deep(.swiper-slide > *) {
  width: 100%;
}

.swiper-nav-button {
  display: none;
  position: absolute;
  top: calc(50% - 21px);
  z-index: 30;
  width: 44px;
  height: 44px;
  border-radius: 9999px;
  background: #f1f1f1;
  color: #111;
  font-size: 30px;
  font-weight: 300;
  line-height: 1;
  box-shadow: none;
  pointer-events: auto;
  transition:
    opacity 150ms ease,
    transform 150ms ease;
}

.swiper-nav-button:hover {
  transform: translateY(-1px);
  background: #e7e7e7;
}

.swiper-nav-button.swiper-button-disabled {
  opacity: 0.28;
  cursor: not-allowed;
}

.swiper-nav-button.swiper-button-lock {
  display: none;
}

.home-swiper :deep(.swiper-pagination-bullet) {
  width: 8px;
  height: 8px;
  background: #000;
}

@media (min-width: 768px) {
  .swiper-nav-button {
    display: grid;
    place-items: center;
  }
}
</style>
