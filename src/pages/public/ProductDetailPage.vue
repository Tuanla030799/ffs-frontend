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
              @click="selectedImage = image.url || ''"
            >
              <img
                v-if="image.url"
                :src="image.url"
                class="h-full w-full object-contain"
                :alt="image.altText || product.name"
              />
            </button>
          </div>

          <div class="order-1 md:order-2">
            <div class="relative aspect-square overflow-hidden rounded-lg bg-[#f3f3f1]">
              <img
                v-if="selectedImage"
                :src="selectedImage"
                class="h-full w-full object-contain p-8 md:p-12"
                :alt="product.name"
              />
              <div v-else class="grid h-full place-items-center text-black/40">No image</div>
              <div class="absolute right-6 bottom-6 hidden gap-3 md:flex">
                <button
                  class="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl shadow-sm transition hover:bg-black hover:text-white"
                  type="button"
                  @click="goImage(-1)"
                >
                  ‹
                </button>
                <button
                  class="grid h-11 w-11 place-items-center rounded-full bg-white text-2xl shadow-sm transition hover:bg-black hover:text-white"
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
                  <img
                    v-if="variant.imageUrl"
                    :src="resolveFileUrl(variant.imageUrl)"
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
              <div class="mb-3 flex items-center justify-between gap-3">
                <p class="text-sm font-bold">Select Size</p>
              </div>
              <div class="grid grid-cols-3 gap-2">
                <button
                  v-for="sku in inStockSkus"
                  :key="sku.id || sku.skuCode"
                  type="button"
                  class="min-h-12 rounded-md border px-2 text-sm font-semibold transition hover:border-black"
                  :class="selectedSku?.id === sku.id ? 'border-black' : 'border-black/20'"
                  @click="selectedSku = sku"
                >
                  {{ sku.size }}
                </button>
              </div>
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
        <h2 class="mb-5 text-2xl font-black">Mô tả sản phẩm</h2>
        <SafeHtmlContent :html="productDescriptionHtml" />
      </section>
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
import { computed, ref, watch } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useRoute } from 'vue-router'
import addCartIcon from '@/assets/icons/add-cart.svg'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import { UiButton, UiSkeleton, UiTag } from '@/components/ui'
import { addToCart } from '@/composables/useCart'
import { resolveFileUrl } from '@/lib/fileUrl'
import { normalizeRichTextInput } from '@/lib/richText'
import { DEFAULT_OG_IMAGE_PATH, ogImageOrDefault, publicSiteUrl } from '@/lib/seo'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { asArray, money } from '@/modules/shared/types'
import type { ProductSku, ProductVariant } from '@/modules/catalog/product/types'

const route = useRoute()
const siteUrl = publicSiteUrl(String(useRuntimeConfig().public.siteUrl || ''))
const selectedImage = ref('')
const selectedVariantKey = ref('')
const selectedSku = ref<ProductSku | null>(null)
const {
  data: product,
  pending: loading,
  error: productError,
} = await useAsyncData(`product-detail-${String(route.params.slug)}`, () =>
  productApi.detail(String(route.params.slug)),
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

function variantKey(variant: ProductVariant) {
  return variant.id || variant.clientId || variant.name
}
function skuVariantKey(sku: ProductSku) {
  return sku.variantId || sku.variantClientId || ''
}
function selectVariant(variant: ProductVariant) {
  selectedVariantKey.value = variantKey(variant)
  selectedImage.value = resolveFileUrl(variant.imageUrl || '') || selectedImage.value
  selectedSku.value = variantSkus.value.find((sku) => sku.stock > 0) || variantSkus.value[0] || null
}
function goImage(direction: number) {
  if (!galleryImages.value.length) return
  const currentIndex = galleryImages.value.findIndex((image) => image.url === selectedImage.value)
  const nextIndex =
    currentIndex < 0
      ? 0
      : (currentIndex + direction + galleryImages.value.length) % galleryImages.value.length
  selectedImage.value = galleryImages.value[nextIndex]?.url || selectedImage.value
}
function handleAddToCart() {
  if (!product.value || !selectedSku.value) return
  addToCart(product.value, selectedSku.value)
}

watch(
  product,
  () => {
    selectedImage.value = galleryImages.value[0]?.url || DEFAULT_OG_IMAGE_PATH
    if (variants.value[0]) selectVariant(variants.value[0])
    selectedSku.value = inStockSkus.value[0] || null
  },
  { immediate: true },
)

useSeoMeta({
  title: () => (product.value ? `${product.value.name} - Thepocketshoes` : 'Chi tiet san pham'),
  description: () => product.value?.shortDescription || 'Chi tiet san pham tai Thepocketshoes.',
  ogTitle: () => product.value?.name || 'Thepocketshoes',
  ogDescription: () => product.value?.shortDescription || 'Chi tiet san pham tai Thepocketshoes.',
  ogImage: () => ogImageOrDefault(selectedImage.value, siteUrl),
  twitterImage: () => ogImageOrDefault(selectedImage.value, siteUrl),
})
</script>
