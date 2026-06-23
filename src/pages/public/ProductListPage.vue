<template>
  <section class="mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 md:pb-10 lg:px-8">
    <PublicPageHeader
      sticky
      :title="pageTitle"
      :subtitle="`${total} sản phẩm`"
      :breadcrumb-items="[{ label: pageTitle }]"
      class="pt-6 md:pt-8"
    >
      <template #actions>
        <div class="flex w-full items-center gap-3 md:w-auto">
          <UiButton
            class="hidden lg:inline-flex"
            variant="ghost"
            size="sm"
            @click="showFilters = !showFilters"
          >
            {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
          </UiButton>

          <UiButton class="lg:hidden" variant="outline" size="sm" @click="mobileFiltersOpen = true">
            Filters
          </UiButton>

          <DropdownSelect v-model="sortBy" :options="sortOptions">
            <div class="flex items-center gap-2">
              <span class="block">Sort By: </span>
              <span class="block truncate">{{ selectedSortLabel }}</span>
            </div>
          </DropdownSelect>
        </div>
      </template>
    </PublicPageHeader>

    <div
      v-if="error"
      class="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
    >
      {{ error }}
    </div>

    <StorefrontListingLayout :show-sidebar="showFilters" sidebar-width="260px">
      <template #sidebar>
        <ProductFilterSidebar
          :category-id="query.categoryId"
          :brand-id="query.brandId"
          v-model:gender="query.gender"
          v-model:size="query.size"
          v-model:color="query.color"
          v-model:min-price="query.minPrice"
          v-model:max-price="query.maxPrice"
          :categories="masterData?.categories || []"
          :brands="masterData?.brands || []"
          :genders="masterData?.productGenders || []"
          :sizes="masterData?.sizes || []"
          :colors="masterData?.colors || []"
          @update:category-id="updateCategoryIds"
          @update:brand-id="updateBrandIds"
        />
      </template>

      <UiDrawer :open="mobileFiltersOpen" title="Filters" @close="mobileFiltersOpen = false">
        <ProductFilterSidebar
          :category-id="query.categoryId"
          :brand-id="query.brandId"
          v-model:gender="query.gender"
          v-model:size="query.size"
          v-model:color="query.color"
          v-model:min-price="query.minPrice"
          v-model:max-price="query.maxPrice"
          :categories="masterData?.categories || []"
          :brands="masterData?.brands || []"
          :genders="masterData?.productGenders || []"
          :sizes="masterData?.sizes || []"
          :colors="masterData?.colors || []"
          @update:category-id="updateCategoryIds"
          @update:brand-id="updateBrandIds"
        />
      </UiDrawer>

      <div
        v-if="initialLoading"
        class="grid gap-x-3 gap-y-9 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      >
        <UiSkeleton v-for="i in 12" :key="i" variant="card" media-class="aspect-square" :rows="4" />
      </div>

      <TransitionGroup
        v-else-if="products.length"
        tag="div"
        name="product-card"
        class="grid gap-x-3 gap-y-9 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      >
        <ProductCard v-for="product in sortedProducts" :key="product.id" :product="product" />
      </TransitionGroup>

      <div
        v-else
        class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-sm font-semibold text-black/60"
      >
        Không tìm thấy sản phẩm.
      </div>

      <div ref="loadMoreTarget" class="h-px" aria-hidden="true" />

      <div
        v-if="loading && products.length"
        class="mt-10 grid gap-x-3 gap-y-9 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      >
        <UiSkeleton v-for="i in 4" :key="i" variant="card" media-class="aspect-square" :rows="4" />
      </div>
    </StorefrontListingLayout>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, onMounted, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import DropdownSelect from '@/components/common/DropdownSelect.vue'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import ProductCard from '@/components/storefront/ProductCard.vue'
import ProductFilterSidebar from '@/components/storefront/ProductFilterSidebar.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import { UiButton, UiDrawer, UiSkeleton } from '@/components/ui'
import { useInfiniteScroll } from '@/composables/useInfiniteScroll'
import { productApi } from '@/modules/catalog/product/api'
import type { Product, PublicProductListQuery } from '@/modules/catalog/product/types'
import { getErrorMessage } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'

const route = useRoute()
const router = useRouter()

const loading = ref(false)
const error = ref('')
const products = ref<Product[]>([])
const total = ref(0)
const loadMoreTarget = ref<HTMLElement | null>(null)

const showFilters = ref(true)
const mobileFiltersOpen = ref(false)
const sortBy = ref('featured')
function queryValues(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && Boolean(item))
  }

  return typeof value === 'string' && value ? [value] : []
}

function queryValue(value: unknown) {
  return queryValues(value)[0] || ''
}

type ProductFilterQuery = Omit<
  PublicProductListQuery,
  'categoryId' | 'brandId' | 'gender' | 'size' | 'color'
> & {
  categoryId: string[]
  brandId: string[]
  gender: string[]
  size: string[]
  color: string[]
}

const query = reactive<ProductFilterQuery>({
  keyword: String(route.query.keyword || ''),
  categoryId: queryValues(route.query.categoryId),
  categorySlug: queryValue(route.query.categorySlug),
  brandId: queryValues(route.query.brandId),
  brandSlug: queryValue(route.query.brandSlug) || queryValue(route.query.brand),
  gender: queryValues(route.query.gender),
  size: queryValues(route.query.size),
  color: queryValues(route.query.color),
  minPrice: route.query.minPrice ? Number(route.query.minPrice) : undefined,
  maxPrice: route.query.maxPrice ? Number(route.query.maxPrice) : undefined,
  page: Number(route.query.page || 1),
  limit: 12,
})

const { data: masterData, error: masterError, load: loadMasterData } = useMasterData('public')

const page = computed(() => Number(query.page || 1))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / Number(query.limit || 12))))
const initialLoading = computed(() => loading.value && !products.value.length)

const hasMore = computed(() => {
  return products.value.length < total.value && page.value < totalPages.value
})

const currentCategory = computed(() => {
  if (query.categoryId.length === 1) {
    return masterData.value?.categories.find((category) => category.id === query.categoryId[0])
  }

  if (query.categoryId.length) return undefined
  return masterData.value?.categories.find((category) => category.slug === query.categorySlug)
})

const pageTitle = computed(() => currentCategory.value?.name || 'Cửa hàng')

const sortedProducts = computed(() => {
  const items = [...products.value]

  if (sortBy.value === 'price-asc') {
    return items.sort((a, b) => productPrice(a) - productPrice(b))
  }

  if (sortBy.value === 'price-desc') {
    return items.sort((a, b) => productPrice(b) - productPrice(a))
  }

  if (sortBy.value === 'name-asc') {
    return items.sort((a, b) => a.name.localeCompare(b.name))
  }

  return items
})

const sortOptions = [
  { label: 'Featured', value: 'featured' },
  { label: 'Price: Low-High', value: 'price-asc' },
  { label: 'Price: High-Low', value: 'price-desc' },
  { label: 'Name', value: 'name-asc' },
]
const selectedSortLabel = computed(
  () => sortOptions.find((option) => option.value === sortBy.value)?.label || 'Featured',
)

let searchTimer: ReturnType<typeof setTimeout> | undefined
let loadToken = 0
let suppressFilterApply = false

async function load(reset = false) {
  if (loading.value && !reset) return

  const token = ++loadToken
  loading.value = true
  error.value = masterError.value || ''

  try {
    const data = await productApi.list({
      ...query,
      categoryId: query.categoryId.length ? query.categoryId : undefined,
      categorySlug: query.categoryId.length ? undefined : query.categorySlug || undefined,
      brandId: query.brandId.length ? query.brandId : undefined,
      brandSlug: query.brandId.length ? undefined : query.brandSlug || undefined,
      gender: query.gender.length ? query.gender : undefined,
      size: query.size.length ? query.size : undefined,
      color: query.color.length ? query.color : undefined,
    })

    if (token !== loadToken) return

    products.value = reset ? data.items : [...products.value, ...data.items]
    total.value = data.total
  } catch (err) {
    if (token !== loadToken) return
    error.value = getErrorMessage(err)
  } finally {
    if (token === loadToken) {
      loading.value = false
    }
  }
}

function routeQuery() {
  return {
    ...query,
    categoryId: query.categoryId.length ? query.categoryId : undefined,
    categorySlug: query.categoryId.length ? undefined : query.categorySlug || undefined,
    brandId: query.brandId.length ? query.brandId : undefined,
    brandSlug: query.brandId.length ? undefined : query.brandSlug || undefined,
    brand: undefined,
    gender: query.gender.length ? query.gender : undefined,
    size: query.size.length ? query.size : undefined,
    color: query.color.length ? query.color : undefined,
  }
}

function applyFilters() {
  query.page = 1

  void router.replace({ query: routeQuery() })
  void load(true)
}

function loadNextPage() {
  if (loading.value || !hasMore.value) return

  query.page = page.value + 1

  void router.replace({ query: routeQuery() })
  void load()
}

function scheduleApplyFilters() {
  if (suppressFilterApply) return

  if (searchTimer) {
    clearTimeout(searchTimer)
  }

  searchTimer = setTimeout(applyFilters, 120)
}

function updateCategoryIds(value: string[]) {
  query.categoryId = value
  query.categorySlug = ''
}

function updateBrandIds(value: string[]) {
  query.brandId = value
  query.brandSlug = ''
}

function hydrateLegacyFilterIds() {
  if (!query.categoryId.length && query.categorySlug) {
    const category = masterData.value?.categories.find((item) => item.slug === query.categorySlug)
    if (category) {
      query.categoryId = [category.id]
      query.categorySlug = ''
    }
  }

  if (!query.brandId.length && query.brandSlug) {
    const brand = masterData.value?.brands.find((item) => item.slug === query.brandSlug)
    if (brand) {
      query.brandId = [brand.id]
      query.brandSlug = ''
    }
  }
}

watch(
  () => [
    query.categorySlug,
    query.categoryId,
    query.brandId,
    query.brandSlug,
    query.gender,
    query.size,
    query.color,
    query.minPrice,
    query.maxPrice,
  ],
  scheduleApplyFilters,
  { flush: 'sync' },
)

watch(
  () => route.query.keyword,
  (keyword) => {
    query.keyword = String(keyword || '')
    scheduleApplyFilters()
  },
)

watch(
  () => route.query.gender,
  (gender) => {
    const nextGenders = queryValues(gender)
    if (
      nextGenders.length === query.gender.length &&
      nextGenders.every((value) => query.gender.includes(value))
    ) {
      return
    }

    query.gender = nextGenders
  },
)

useInfiniteScroll({
  target: loadMoreTarget,
  canLoadMore: hasMore,
  loading,
  onLoadMore: loadNextPage,
})

onMounted(async () => {
  await loadMasterData().catch(() => null)
  suppressFilterApply = true
  hydrateLegacyFilterIds()
  suppressFilterApply = false
  await load(true)
})

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})

function productPrice(product: Product) {
  return product.salePrice || product.price || 0
}
</script>

<style scoped>
.product-card-enter-active {
  transition:
    opacity 240ms ease,
    transform 240ms ease;
}

.product-card-enter-from {
  opacity: 0;
  transform: translateY(18px);
}
</style>
