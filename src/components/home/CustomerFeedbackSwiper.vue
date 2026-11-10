<template>
  <div class="relative">
    <div
      v-if="loading"
      class="grid auto-cols-[82%] grid-flow-col gap-4 overflow-hidden sm:auto-cols-[48%] lg:auto-cols-[24%]"
    >
      <UiSkeleton v-for="index in 4" :key="index" variant="block" class="aspect-[3/4]" />
    </div>

    <Swiper
      v-else-if="feedbacks.length"
      class="home-swiper"
      :modules="modules"
      :slides-per-view="1.2"
      :space-between="16"
      :navigation="{ prevEl: '.feedback-swiper-prev', nextEl: '.feedback-swiper-next' }"
      :pagination="{ clickable: true }"
      :autoplay="{ delay: 3200, disableOnInteraction: true, pauseOnMouseEnter: true }"
      :breakpoints="breakpoints"
      :watch-overflow="true"
    >
      <SwiperSlide v-for="feedback in feedbacks" :key="feedback.id" class="!h-auto">
        <figure class="flex h-full w-full flex-col">
          <button
            type="button"
            class="group block w-full overflow-hidden rounded-lg bg-[#f3f3f1] focus-visible:ring-2 focus-visible:ring-black focus-visible:ring-offset-2 focus-visible:outline-none"
            :aria-label="`Xem ảnh feedback${feedback.customerName ? ` của ${feedback.customerName}` : ''}`"
            @click="selected = feedback"
          >
            <StorefrontImage
              :src="feedback.imageUrl || ''"
              :alt="feedbackAlt(feedback)"
              class="aspect-[3/4] h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </button>
          <figcaption
            v-if="feedback.customerName || feedback.description"
            class="mt-3 space-y-1 text-sm"
          >
            <p v-if="feedback.customerName" class="font-bold text-black">
              {{ feedback.customerName }}
            </p>
            <p v-if="feedback.description" class="line-clamp-3 leading-6 text-black/65">
              {{ feedback.description }}
            </p>
          </figcaption>
        </figure>
      </SwiperSlide>
    </Swiper>

    <button
      v-if="feedbacks.length"
      type="button"
      class="feedback-swiper-prev swiper-nav-button -left-3 md:-left-5 lg:-left-6"
      aria-label="Ảnh feedback trước"
    >
      ‹
    </button>
    <button
      v-if="feedbacks.length"
      type="button"
      class="feedback-swiper-next swiper-nav-button -right-3 md:-right-5 lg:-right-6"
      aria-label="Ảnh feedback tiếp theo"
    >
      ›
    </button>

    <UiModal
      :open="Boolean(selected)"
      :title="selected?.customerName || 'Feedback khách hàng'"
      :description="selected?.description || ''"
      max-width="xl"
      @close="selected = null"
    >
      <StorefrontImage
        v-if="selected"
        :src="selected.imageUrl || ''"
        fit="contain"
        class="max-h-[75vh] w-full object-contain"
        :alt="feedbackAlt(selected)"
      />
    </UiModal>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { Autoplay, Navigation, Pagination } from 'swiper/modules'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import 'swiper/css/navigation'
import 'swiper/css/pagination'
import 'swiper/css/autoplay'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { UiModal, UiSkeleton } from '@/components/ui'
import type { CustomerFeedback } from '@/modules/content/feedback/types'

defineProps<{
  feedbacks: CustomerFeedback[]
  loading?: boolean
}>()

const selected = ref<CustomerFeedback | null>(null)
const modules = [Navigation, Pagination, Autoplay]
const breakpoints = {
  480: { slidesPerView: 1.5, spaceBetween: 16 },
  768: { slidesPerView: 2.4, spaceBetween: 20 },
  1024: { slidesPerView: 3, spaceBetween: 20 },
  1280: { slidesPerView: 4, spaceBetween: 24 },
}

function feedbackAlt(feedback: CustomerFeedback) {
  return feedback.customerName
    ? `Feedback của khách hàng ${feedback.customerName}`
    : 'Feedback của khách hàng The Pocket Shoes'
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
  top: calc(50% - 42px);
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

/* Trước khi Swiper khởi tạo (HTML SSR), mô phỏng slidesPerView/spaceBetween để không giật layout.
   Kích thước card giữ giống FeaturedProductSwiper để card feedback to bằng card sản phẩm. */
.home-swiper:not(.swiper-initialized) :deep(.swiper-wrapper) {
  gap: 16px;
}

.home-swiper:not(.swiper-initialized) :deep(.swiper-slide) {
  width: calc((100% - 3.2px) / 1.2);
}

@media (min-width: 480px) {
  .home-swiper:not(.swiper-initialized) :deep(.swiper-slide) {
    width: calc((100% - 8px) / 1.5);
  }
}

@media (min-width: 768px) {
  .home-swiper:not(.swiper-initialized) :deep(.swiper-wrapper) {
    gap: 20px;
  }

  .home-swiper:not(.swiper-initialized) :deep(.swiper-slide) {
    width: calc((100% - 28px) / 2.4);
  }
}

@media (min-width: 1024px) {
  .home-swiper:not(.swiper-initialized) :deep(.swiper-slide) {
    width: calc((100% - 40px) / 3);
  }
}

@media (min-width: 1280px) {
  .home-swiper:not(.swiper-initialized) :deep(.swiper-wrapper) {
    gap: 24px;
  }

  .home-swiper:not(.swiper-initialized) :deep(.swiper-slide) {
    width: calc((100% - 72px) / 4);
  }
}

@media (min-width: 768px) {
  .swiper-nav-button {
    display: grid;
    place-items: center;
  }
}
</style>
