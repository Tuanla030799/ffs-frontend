<template>
  <div class="mx-auto max-w-7xl overflow-x-hidden px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[{ label: 'Cửa hàng', to: '/products' }, { label: product?.name || 'Chi tiết' }]"
    />

    <div v-if="loading && !product" class="space-y-12">
      <section class="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <div class="grid min-w-0 gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
          <div
            class="order-2 flex gap-2 overflow-hidden md:order-1 md:flex-col md:overflow-visible"
          >
            <UiSkeleton v-for="i in 5" :key="i" variant="block" class="h-16 w-16 shrink-0" />
          </div>
          <UiSkeleton variant="block" class="order-1 aspect-square md:order-2" />
        </div>

        <aside class="min-w-0 space-y-7">
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
    <div
      v-else-if="error && !product"
      class="border border-red-200 bg-red-50 p-4 text-red-700"
      role="alert"
    >
      <p>{{ error }}</p>
      <UiButton class="mt-3" variant="secondary" size="sm" @click="refreshProduct()">
        Thử lại
      </UiButton>
    </div>
    <div v-else-if="product" class="space-y-12">
      <section class="grid min-w-0 gap-8 lg:grid-cols-[minmax(0,1.45fr)_minmax(360px,0.85fr)]">
        <div class="grid min-w-0 gap-4 md:grid-cols-[64px_minmax(0,1fr)]">
          <div
            class="order-2 flex max-w-full gap-2 overflow-x-auto pb-1 md:order-1 md:flex-col md:overflow-visible md:pb-0"
          >
            <button
              v-for="image in galleryImages"
              :key="image.url || image.fileId"
              type="button"
              class="h-16 w-16 shrink-0 overflow-hidden rounded-md border bg-[#f3f3f1] transition hover:border-black"
              :class="selectedImage === image.url ? 'border-black' : 'border-transparent'"
              :aria-label="`Xem ảnh ${galleryImages.indexOf(image) + 1}`"
              :aria-current="selectedImage === image.url ? 'true' : undefined"
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

          <div class="order-1 min-w-0 md:order-2">
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
                      <div class="grid h-full place-items-center text-black/40">Chưa có ảnh</div>
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
                  aria-label="Ảnh trước"
                  @click="goImage(-1)"
                >
                  <span aria-hidden="true">‹</span>
                </button>
                <button
                  class="pointer-events-auto grid h-11 w-11 place-items-center rounded-full bg-white text-2xl shadow-sm transition hover:bg-black hover:text-white"
                  type="button"
                  aria-label="Ảnh tiếp theo"
                  @click="goImage(1)"
                >
                  <span aria-hidden="true">›</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        <aside class="min-w-0 lg:sticky lg:top-[92px] lg:self-start">
          <section class="space-y-7 bg-white">
            <div>
              <h1 class="text-2xl leading-tight font-bold text-black md:text-3xl">
                {{ product.name }}
              </h1>
              <p class="mt-1 text-base text-black/60">
                {{ product.brandName || product.categoryName }}
              </p>
              <div class="mt-4 flex items-end gap-3">
                <strong class="text-lg font-bold text-black">Từ {{ money(currentPrice) }}</strong>
                <span v-if="currentOriginalPrice" class="text-sm text-black/35 line-through">
                  Từ {{ money(currentOriginalPrice) }}
                </span>
              </div>
            </div>

            <div v-if="variants.length">
              <p class="mb-3 text-sm font-bold">Màu sắc</p>
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
                  :aria-label="variant.colorName || variant.name"
                  :aria-pressed="selectedVariantKey === variantKey(variant)"
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
                <UiTag v-if="product.gender" variant="soft">
                  {{ productGenderLabel(product.gender) }}
                </UiTag>
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
                Thêm vào giỏ hàng
              </UiButton>
            </div>
          </section>
        </aside>
      </section>

      <section class="min-w-0 border-t border-black/10 pt-8 md:pt-10">
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
      <h1 class="text-lg font-black text-black">Không tìm thấy sản phẩm.</h1>
      <p class="mt-2 text-sm">Sản phẩm có thể đã ngừng bán hoặc đường dẫn không đúng.</p>
      <NuxtLink
        to="/products"
        class="mt-5 inline-flex bg-black px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-black/80"
      >
        Xem sản phẩm khác
      </NuxtLink>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useHead, useNuxtApp, useRoute, useRuntimeConfig } from '#imports'
import type { Swiper as SwiperInstance } from 'swiper'
import { Swiper, SwiperSlide } from 'swiper/vue'
import 'swiper/css'
import addCartIcon from '@/assets/icons/add-cart.svg'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import ProductPurchaseShippingInfo from '@/components/storefront/ProductPurchaseShippingInfo.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { UiButton, UiModal, UiSkeleton, UiTabs, UiTag } from '@/components/ui'
import { addToCart, getCartItemQuantity } from '@/composables/useCart'
import { useToast } from '@/composables/useToast'
import { resolveFileUrl } from '@/lib/fileUrl'
import { normalizeRichTextInput } from '@/lib/richText'
import { isNotFoundError, useNotFoundStatus } from '@/composables/useNotFoundStatus'
import {
  DEFAULT_OG_IMAGE_PATH,
  SITE_NAME,
  absoluteUrl,
  breadcrumbJsonLd,
  htmlToPlainText,
  jsonLdScript,
  metaDescription,
  ogImageOrDefault,
  publicSiteUrl,
} from '@/lib/seo'
import { productApi } from '@/modules/catalog/product/api'
import {
  isSellableStatus,
  productGenderLabel,
  skuEffectivePrice,
} from '@/modules/catalog/product/helpers'
import { getErrorMessage } from '@/modules/shared/hooks'
import { asArray, money } from '@/modules/shared/types'
import type { ProductSku, ProductVariant } from '@/modules/catalog/product/types'

const route = useRoute()
const toast = useToast()
// Chỉ làm mới dữ liệu (tồn kho) khi trang được hydrate từ HTML SSR, có thể là bản cache cũ vài
// phút; điều hướng phía client đã lấy dữ liệu mới qua useAsyncData.
const hydratedFromServer = import.meta.client && useNuxtApp().isHydrating
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
  () => `product-detail-${slug.value || 'pending'}`,
  () => (slug.value ? productApi.detail(slug.value) : Promise.resolve(null)),
  {
    deep: false,
    dedupe: 'defer',
    watch: [slug],
  },
)
useNotFoundStatus(product, productError)
const notFound = computed(
  () => !product.value && (!productError.value || isNotFoundError(productError.value)),
)
// BE trả 400 "... not found" cho slug sai: hiển thị trang "không tìm thấy" thay vì lỗi thô.
const error = computed(() =>
  productError.value && !isNotFoundError(productError.value)
    ? getErrorMessage(productError.value)
    : '',
)
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
  selectedSku.value = variantSkus.value.find((sku) => sku.stock > 0) || null
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
  const currentProduct = product.value
  const sku = selectedSku.value
  if (!currentProduct || !sku || sku.stock <= 0) return

  if (getCartItemQuantity(currentProduct, sku) >= sku.stock) {
    toast.push(`Giỏ hàng đã có đủ ${sku.stock} sản phẩm còn lại.`, 'warning', 'Không thể thêm')
    return
  }

  addToCart(currentProduct, sku)
  toast.push(currentProduct.name, 'success', 'Đã thêm vào giỏ hàng')
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
  if (hydratedFromServer) void refreshProduct()
})

const canonicalUrl = computed(() => `${siteUrl}/products/${encodeURIComponent(slug.value)}`)
// Phần lớn sản phẩm chưa có shortDescription: lấy đoạn đầu của mô tả, nếu trống thì tự ghép từ
// thương hiệu/danh mục/giá để mỗi trang có meta description riêng.
const seoDescription = computed(() => {
  const current = product.value
  if (!current) return 'Chi tiết sản phẩm tại The Pocket Shoes.'

  const prices = asArray(current.skus)
    .filter((sku) => isSellableStatus(sku.status))
    .map(skuEffectivePrice)
  const facts = [
    current.brandName && `thương hiệu ${current.brandName}`,
    current.categoryName && `dòng ${current.categoryName}`,
    prices.length && `giá từ ${money(Math.min(...prices))}`,
  ].filter(Boolean)
  // Các phiên bản màu thường dùng chung mô tả: mở đầu bằng tên sản phẩm (có màu) để mỗi trang
  // vẫn có description khác nhau.
  const descriptionText = htmlToPlainText(current.descriptionHtml)
  return metaDescription(
    current.shortDescription,
    descriptionText && `${current.name}: ${descriptionText}`,
    `${current.name} chính hãng tại ${SITE_NAME}${facts.length ? `, ${facts.join(', ')}` : ''}.`,
  )
})
const productJsonLd = computed(() => {
  const current = product.value
  if (!current) return null

  const sellableSkus = asArray(current.skus).filter((sku) => isSellableStatus(sku.status))
  const prices = sellableSkus.map(skuEffectivePrice)
  const inStock = sellableSkus.some((sku) => sku.stock > 0)
  const availability = `https://schema.org/${inStock ? 'InStock' : 'OutOfStock'}`
  const offers = prices.length
    ? sellableSkus.length === 1
      ? {
          '@type': 'Offer',
          url: canonicalUrl.value,
          priceCurrency: 'VND',
          price: prices[0],
          availability,
          itemCondition: 'https://schema.org/NewCondition',
          seller: { '@type': 'Organization', name: SITE_NAME },
        }
      : {
          '@type': 'AggregateOffer',
          url: canonicalUrl.value,
          priceCurrency: 'VND',
          lowPrice: Math.min(...prices),
          highPrice: Math.max(...prices),
          offerCount: sellableSkus.length,
          availability,
        }
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: current.name,
    description: seoDescription.value,
    url: canonicalUrl.value,
    image: galleryImages.value.map((image) => absoluteUrl(image.url, siteUrl)).slice(0, 10),
    sku: sellableSkus[0]?.skuCode || undefined,
    category: current.categoryName || undefined,
    brand: current.brandName ? { '@type': 'Brand', name: current.brandName } : undefined,
    offers,
  }
})

useHead({
  link: () => (product.value ? [{ rel: 'canonical', href: canonicalUrl.value }] : []),
  script: () =>
    product.value && productJsonLd.value
      ? [
          jsonLdScript(productJsonLd.value),
          jsonLdScript(
            breadcrumbJsonLd(siteUrl, [
              { name: 'Cửa hàng', path: '/products' },
              { name: product.value.name, path: `/products/${encodeURIComponent(slug.value)}` },
            ]),
          ),
        ]
      : [],
})

useSeoMeta({
  title: () =>
    product.value
      ? `${product.value.name} - The Pocket Shoes`
      : notFound.value
        ? 'Không tìm thấy sản phẩm - The Pocket Shoes'
        : 'Chi tiết sản phẩm - The Pocket Shoes',
  description: () => seoDescription.value,
  ogTitle: () => product.value?.name || 'The Pocket Shoes',
  ogDescription: () => seoDescription.value,
  ogUrl: () => (product.value ? canonicalUrl.value : undefined),
  ogImage: () => ogImageOrDefault(selectedImage.value, siteUrl),
  twitterTitle: () => product.value?.name || 'The Pocket Shoes',
  twitterDescription: () => seoDescription.value,
  twitterImage: () => ogImageOrDefault(selectedImage.value, siteUrl),
  robots: () => (notFound.value ? 'noindex, follow' : undefined),
})
</script>

<style scoped>
.product-gallery-swiper :deep(.swiper-wrapper),
.product-gallery-swiper :deep(.swiper-slide) {
  height: 100%;
}
</style>
