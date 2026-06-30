<template>
  <div class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[{ label: 'Cửa hàng', to: '/products' }, { label: product?.name || 'Chi tiết' }]"
    />

    <div v-if="error" class="border border-red-200 bg-red-50 p-4 text-red-700">
      {{ error }}
    </div>
    <div v-else-if="loading" class="space-y-12">
      <section class="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <div class="grid gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
          <div
            class="order-2 flex gap-2 overflow-hidden md:order-1 md:flex-col md:overflow-visible"
          >
            <UiSkeleton v-for="i in 5" :key="i" variant="block" class="h-16 w-16 shrink-0" />
          </div>
          <UiSkeleton variant="block" class="order-1 aspect-square md:order-2" />
        </div>

        <aside class="space-y-7">
          <UiSkeleton :rows="4" />
          <div class="grid grid-cols-4 gap-3">
            <UiSkeleton v-for="i in 4" :key="i" variant="block" class="h-[70px]" />
          </div>
          <div class="grid grid-cols-3 gap-2">
            <UiSkeleton v-for="i in 6" :key="i" variant="block" class="h-12" />
          </div>
          <UiSkeleton variant="block" class="h-12" />
        </aside>
      </section>

      <section class="border-t border-black/10 pt-8 md:pt-10">
        <UiSkeleton class="max-w-3xl" :rows="5" />
      </section>
    </div>
    <div v-else-if="product" class="space-y-12">
      <section class="grid gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <div class="grid gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
          <div
            class="order-2 flex gap-2 overflow-x-auto md:order-1 md:flex-col md:overflow-visible"
          >
            <button
              v-for="image in galleryImages"
              :key="image.url || image.fileId"
              type="button"
              class="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-[#f3f3f1] transition hover:border-black"
              :class="selectedImage === image.url ? 'border-black' : 'border-transparent'"
              @click="selectImage(image.url || '')"
            >
              <StorefrontImage
                v-if="image.url"
                :src="image.url"
                :fallback-src="null"
                fit="contain"
                class="h-full w-full object-contain"
                :alt="image.altText || product.name"
              />
            </button>
          </div>

          <div class="order-1 md:order-2">
            <div class="relative aspect-square overflow-hidden rounded-lg bg-[#f3f3f1]">
              <Swiper
                class="product-gallery-swiper h-full w-full"
                :initial-slide="selectedImageIndex"
                :slides-per-view="1"
                :space-between="0"
                :watch-overflow="true"
                @swiper="setGallerySwiper"
                @slide-change="handleGallerySlideChange"
              >
                <SwiperSlide v-for="image in gallerySlides" :key="image.url" class="!h-full">
                  <StorefrontImage
                    :src="image.url"
                    fit="cover"
                    class="h-full w-full object-cover"
                    :alt="image.altText || product.name"
                  >
                    <template #fallback>
                      <div class="grid h-full place-items-center text-black/40">No image</div>
                    </template>
                  </StorefrontImage>
                </SwiperSlide>
              </Swiper>
              <div
                v-if="gallerySlides.length > 1"
                class="pointer-events-none absolute inset-y-0 right-4 left-4 z-10 hidden items-center justify-between md:flex"
              >
                <button
                  class="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white text-2xl shadow-sm transition hover:bg-black hover:text-white"
                  type="button"
                  @click="goImage(-1)"
                >
                  ‹
                </button>
                <button
                  class="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white text-2xl shadow-sm transition hover:bg-black hover:text-white"
                  type="button"
                  @click="goImage(1)"
                >
                  ›
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside class="lg:sticky lg:top-[92px] lg:self-start">
          <section class="space-y-7 bg-white">
            <div>
              <h1 class="text-2xl leading-tight font-bold text-black md:text-3xl">
                {{ product.name }}
              </h1>
              <p class="mt-1 text-base text-black/60">
                {{ product.brandName || product.categoryName }}
              </p>
              <div class="mt-4 flex items-end gap-3">
                <strong class="text-lg font-bold text-black">{{ money(currentPrice) }}</strong>
                <span v-if="currentOriginalPrice" class="text-sm text-black/35 line-through">
                  {{ money(currentOriginalPrice) }}
                </span>
              </div>
            </div>

            <div v-if="variants.length">
              <p class="mb-3 text-sm font-bold">Variants</p>
              <div class="flex flex-wrap gap-3">
                <button
                  v-for="variant in variants"
                  :key="variant.id || variant.clientId"
                  type="button"
                  class="grid h-[70px] w-[70px] place-items-center overflow-hidden rounded-md border bg-[#f6f6f4] transition hover:border-black"
                  :class="
                    selectedVariantKey === variantKey(variant)
                      ? 'border-black'
                      : 'border-transparent'
                  "
                  :title="variant.colorName || variant.name"
                  @click="selectVariant(variant)"
                >
                  <StorefrontImage
                    v-if="variant.imageUrl"
                    :src="variant.imageUrl"
                    :fallback-src="null"
                    fit="contain"
                    class="h-full w-full object-contain"
                    :alt="variant.name"
                  />
                  <span
                    v-else-if="variant.colorCode"
                    class="h-8 w-8 rounded-full border border-black/15"
                    :style="{ backgroundColor: variant.colorCode }"
                  />
                  <span v-else class="px-2 text-center text-xs font-bold">{{ variant.name }}</span>
                </button>
              </div>
            </div>

            <div>
              <button
                v-if="brandSizeGuideUrl"
                type="button"
                class="text-sm font-bold underline underline-offset-4 transition hover:text-black/60"
                @click="sizeGuideOpen = true"
              >
                Hướng dẫn chọn size
              </button>
              <p v-else class="text-sm font-bold text-black/40">Hướng dẫn chọn size</p>
              <p v-if="!inStockSkus.length" class="text-sm font-semibold text-black/50">
                Tạm thời hết hàng
              </p>
              <p class="mt-3 text-sm text-black/50">Tồn kho: {{ selectedSku?.stock ?? '-' }}</p>
              <div class="mt-3 flex flex-wrap gap-2">
                <UiTag v-if="product.categoryName" variant="soft">{{ product.categoryName }}</UiTag>
                <UiTag v-if="product.gender" variant="soft">{{ product.gender }}</UiTag>
              </div>
            </div>

            <div class="space-y-3">
              <UiButton
                native-type="button"
                variant="dark"
                block
                size="lg"
                :disabled="!selectedSku"
                @click="handleAddToCart"
              >
                <template #icon>
                  <img :src="addCartIcon" alt="" class="h-5 w-5" aria-hidden="true" />
                </template>
                Add to Cart
              </UiButton>
            </div>
          </section>
        </aside>
      </section>

      <section class="border-t border-black/10 pt-8 md:pt-10">
        <UiTabs v-model="activeInfoTab" :items="infoTabs">
          <div v-if="activeInfoTab === 'description'">
            <SafeHtmlContent :html="productDescriptionHtml" />
          </div>
          <ProductPurchaseShippingInfo v-else />
        </UiTabs>
      </section>

      <UiModal
        :open="sizeGuideOpen"
        title="Hướng dẫn chọn size"
        max-width="xl"
        @close="sizeGuideOpen = false"
      >
        <StorefrontImage
          :src="brandSizeGuideUrl"
          fit="contain"
          class="max-h-[75vh] w-full object-contain"
          :alt="`Hướng dẫn chọn size ${product.name}`"
        />
      </UiModal>
    </div>
    <div
      v-else
      class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-black/60"
    >
      Không tìm thấy sản phẩm.
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRuntimeConfig } from '#imports'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import addCartIcon from '@/assets/icons/add-cart.svg'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import ProductPurchaseShippingInfo from '@/components/storefront/ProductPurchaseShippingInfo.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { UiButton, UiModal, UiSkeleton, UiTabs, UiTag } from '@/components/ui'
import { addToCart } from '@/composables/useCart'
import { resolveFileUrl } from '@/lib/fileUrl'
import { normalizeRichTextInput } from '@/lib/richText'
import { DEFAULT_OG_IMAGE_PATH, ogImageOrDefault, publicSiteUrl } from '@/lib/seo'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { asArray, money } from '@/modules/shared/types'
import type { ProductSku, ProductVariant } from '@/modules/catalog/product/types'

const route = useRoute()
const slug = computed(() => String(route.params.slug || ''))
const siteUrl = publicSiteUrl(String(useRuntimeConfig().public.siteUrl || ''))
const selectedImage = ref('')
const selectedVariantKey = ref('')
const selectedSku = ref<ProductSku | null>(null)
const gallerySwiper = ref<SwiperInstance | null>(null)
const sizeGuideOpen = ref(false)
const activeInfoTab = ref('description')
const infoTabs = [
  { key: 'description', label: 'Mô tả sản phẩm' },
  { key: 'purchase-shipping', label: 'Cách mua hàng và hình thức vận chuyển' },
]
const {
  data: product,
  pending: loading,
  error: productError,
  refresh: refreshProduct,
} = await useAsyncData(
  () => `product-detail-${slug.value}`,
  () => productApi.detail(slug.value),
  {
    deep: false,
    dedupe: 'defer',
    watch: [slug],
  },
)
const error = computed(() => (productError.value ? getErrorMessage(productError.value) : ''))
const images = computed(() => asArray(product.value?.images))
const galleryImages = computed(() =>
  images.value
    .map((image) => ({
      ...image,
      url: resolveFileUrl(image.url || image.imageUrl || ''),
    }))
    .filter((image) => image.url),
)
const variants = computed(() => asArray(product.value?.variants))
const gallerySlides = computed(() => {
  if (galleryImages.value.length) {
    return galleryImages.value.map((image) => ({
      url: image.url,
      altText: image.altText || product.value?.name,
    }))
  }

  return [{ url: DEFAULT_OG_IMAGE_PATH, altText: product.value?.name }]
})
const selectedImageIndex = computed(() =>
  Math.max(
    gallerySlides.value.findIndex((image) => image.url === selectedImage.value),
    0,
  ),
)

const skus = computed(() => asArray(product.value?.skus))
const variantSkus = computed(() => {
  if (!selectedVariantKey.value) return skus.value
  return skus.value.filter((sku) => skuVariantKey(sku) === selectedVariantKey.value)
})
const inStockSkus = computed(() => variantSkus.value.filter((sku) => sku.stock > 0))
const currentPrice = computed(
  () =>
    selectedSku.value?.salePrice ||
    selectedSku.value?.price ||
    product.value?.salePrice ||
    product.value?.price,
)
const currentOriginalPrice = computed(() =>
  selectedSku.value?.salePrice || product.value?.salePrice
    ? selectedSku.value?.price || product.value?.price
    : undefined,
)
const productDescriptionHtml = computed(() =>
  normalizeRichTextInput(product.value?.descriptionHtml),
)
const brandSizeGuideUrl = computed(() => resolveFileUrl(product.value?.brandSizeGuideUrl || ''))

function variantKey(variant: ProductVariant) {
  return variant.id || variant.clientId || variant.name
}
function skuVariantKey(sku: ProductSku) {
  return sku.variantId || sku.variantClientId || ''
}
function gallerySlideIndex(url: string) {
  const resolvedUrl = resolveFileUrl(url)
  return gallerySlides.value.findIndex((image) => image.url === resolvedUrl)
}
function setGallerySwiper(swiper: SwiperInstance) {
  gallerySwiper.value = swiper
  slideGalleryToSelected({ animate: false })
}
function slideGalleryToSelected(options: { animate?: boolean } = {}) {
  const index = gallerySlideIndex(selectedImage.value)
  if (index < 0 || gallerySwiper.value?.activeIndex === index) return

  if (options.animate === false) {
    gallerySwiper.value?.slideTo(index, 0, false)
    return
  }

  gallerySwiper.value?.slideTo(index)
}
function selectImage(url: string, options: { animate?: boolean } = {}) {
  const index = gallerySlideIndex(url)
  if (index < 0) return

  selectedImage.value = gallerySlides.value[index]?.url || selectedImage.value
  void nextTick(() => slideGalleryToSelected(options))
}
function handleGallerySlideChange(swiper: SwiperInstance) {
  selectedImage.value = gallerySlides.value[swiper.activeIndex]?.url || selectedImage.value
}
function selectVariant(
  variant: ProductVariant,
  options: { animate?: boolean; updateImage?: boolean } = {},
) {
  selectedVariantKey.value = variantKey(variant)
  if (options.updateImage !== false && gallerySlideIndex(variant.imageUrl || '') >= 0) {
    selectImage(variant.imageUrl || selectedImage.value, options)
  }
  selectedSku.value = variantSkus.value.find((sku) => sku.stock > 0) || variantSkus.value[0] || null
}
function goImage(direction: number) {
  if (!gallerySlides.value.length) return

  const slideCount = gallerySlides.value.length
  const swiper = gallerySwiper.value
  if (!swiper) {
    const nextIndex = (selectedImageIndex.value + direction + slideCount) % slideCount
    selectImage(gallerySlides.value[nextIndex]?.url || selectedImage.value)
    return
  }

  swiper.update()

  const currentIndex = Math.max(swiper.activeIndex ?? selectedImageIndex.value, 0)
  const nextIndex = (currentIndex + direction + slideCount) % slideCount
  const isWrapping = Math.abs(nextIndex - currentIndex) > 1

  selectedImage.value = gallerySlides.value[nextIndex]?.url || selectedImage.value
  swiper.slideTo(nextIndex, isWrapping ? 0 : 300, !isWrapping)
}
function handleAddToCart() {
  if (!product.value || !selectedSku.value) return
  addToCart(product.value, selectedSku.value)
}

watch(
  product,
  () => {
    selectedImage.value = gallerySlides.value[0]?.url || DEFAULT_OG_IMAGE_PATH
    if (variants.value[0]) selectVariant(variants.value[0], { animate: false, updateImage: false })
    selectedSku.value = inStockSkus.value[0] || null
  },
  { immediate: true },
)

onMounted(() => {
  if (!product.value || productError.value) void refreshProduct()
})

useSeoMeta({
  title: () => (product.value ? `${product.value.name} - Thepocketshoes` : 'Chi tiet san pham'),
  description: () => product.value?.shortDescription || 'Chi tiet san pham tai Thepocketshoes.',
  ogTitle: () => product.value?.name || 'Thepocketshoes',
  ogDescription: () => product.value?.shortDescription || 'Chi tiet san pham tai Thepocketshoes.',
  ogImage: () => ogImageOrDefault(selectedImage.value, siteUrl),
  twitterImage: () => ogImageOrDefault(selectedImage.value, siteUrl),
})
</script>

<style scoped>
.product-gallery-swiper :deep(.swiper-wrapper),
.product-gallery-swiper :deep(.swiper-slide) {
  height: 100%;
}
</style>
