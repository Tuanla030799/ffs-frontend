<template>
  <section class="mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 md:pb-10 lg:px-8">
    <PublicPageHeader
      sticky
      :title="pageTitle"
      :subtitle="initialLoading ? 'Đang tải sản phẩm...' : `${total} sản phẩm`"
      :breadcrumb-items="[{ label: pageTitle }]"
      class="pt-6 md:pt-8"
    >
      <template #actions>
        <div class="flex w-full items-center gap-3 md:w-auto">
          <UiButton
            class="hidden lg:inline-flex"
            variant="ghost"
            size="sm"
            :aria-pressed="showFilters"
            @click="showFilters = !showFilters"
          >
            {{ showFilters ? 'Ẩn bộ lọc' : 'Hiện bộ lọc' }}
          </UiButton>

          <UiButton class="lg:hidden" variant="outline" size="sm" @click="mobileFiltersOpen = true">
            Bộ lọc<span v-if="activeFilterCount"> ({{ activeFilterCount }})</span>
          </UiButton>

          <DropdownSelect v-model="sortBy" :options="sortOptions">
            <template #default="{ open }">
              <button
                type="button"
                class="flex min-h-9 items-center gap-2 text-sm font-semibold"
                aria-haspopup="menu"
                :aria-expanded="open"
              >
                <span class="block text-black/55">Sắp xếp:</span>
                <span class="block truncate">{{ selectedSortLabel }}</span>
                <span aria-hidden="true">⌄</span>
              </button>
            </template>
          </DropdownSelect>
        </div>
      </template>
    </PublicPageHeader>

    <div
      v-if="error"
      class="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
      role="alert"
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

      <UiDrawer :open="mobileFiltersOpen" title="Bộ lọc" @close="mobileFiltersOpen = false">
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
        class="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
      >
        <UiSkeleton v-for="i in 12" :key="i" variant="card" media-class="aspect-square" :rows="4" />
      </div>

      <TransitionGroup
        v-else-if="products.length"
        tag="div"
        name="product-card"
        class="grid grid-cols-2 gap-x-3 gap-y-9 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3"
        :class="loading && 'opacity-60 transition-opacity'"
        :aria-busy="loading || undefined"
      >
        <ProductCard v-for="product in sortedProducts" :key="product.id" :product="product" />
      </TransitionGroup>

      <div
        v-else
        class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-sm font-semibold text-black/60"
      >
        <p>Không tìm thấy sản phẩm.</p>
        <button
          v-if="activeFilterCount"
          type="button"
          class="mt-4 text-sm font-bold text-black/55 underline-offset-4 hover:text-black hover:underline"
          @click="clearFilters"
        >
          Xóa bộ lọc
        </button>
      </div>

      <UiPagination
        v-if="totalPages > 1"
        class="mt-10"
        :page="page"
        :total="total"
        :total-pages="totalPages"
        :page-size="Number(query.limit || PAGE_SIZE)"
        @update:page="changePage"
      />
    </StorefrontListingLayout>
  </section>
</template>

<script setup lang="ts">
import { computed, onBeforeUnmount, reactive, ref, shallowRef, watch } from 'vue'
import { useAsyncData, useRoute } from '#imports'
import type { LocationQuery } from 'vue-router'
import DropdownSelect from '@/components/common/DropdownSelect.vue'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import ProductCard from '@/components/storefront/ProductCard.vue'
import ProductFilterSidebar from '@/components/storefront/ProductFilterSidebar.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import { UiButton, UiDrawer, UiPagination, UiSkeleton } from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { productApi } from '@/modules/catalog/product/api'
import { productListPrice } from '@/modules/catalog/product/helpers'
import type { Product, PublicProductListQuery } from '@/modules/catalog/product/types'
import { getErrorMessage } from '@/modules/shared/hooks'
import { masterDataApi } from '@/modules/shared/master-data/api'
import type { Paginated } from '@/modules/shared/types'

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

const PAGE_SIZE = 12
const sortOptions = [
  { label: 'Nổi bật', value: 'featured' },
  { label: 'Giá: thấp đến cao', value: 'price-asc' },
  { label: 'Giá: cao đến thấp', value: 'price-desc' },
  { label: 'Tên A-Z', value: 'name-asc' },
]

const route = useRoute()
const pageQuery = usePageQuery()

function queryValues(value: unknown) {
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string' && Boolean(item))
  }

  return typeof value === 'string' && value ? [value] : []
}

function queryValue(value: unknown) {
  return queryValues(value)[0] || ''
}

function queryNumber(value: unknown) {
  const text = queryValue(value)
  const number = Number(text)
  return text && Number.isFinite(number) ? number : undefined
}

function parseSort(value: unknown) {
  const sort = queryValue(value)
  return sortOptions.some((option) => option.value === sort) ? sort : 'featured'
}

function parseFilters(source: LocationQuery): ProductFilterQuery {
  const page = Math.trunc(Number(queryValue(source.page) || 1))
  return {
    keyword: queryValue(source.keyword),
    categoryId: queryValues(source.categoryId),
    categorySlug: queryValue(source.categorySlug),
    brandId: queryValues(source.brandId),
    brandSlug: queryValue(source.brandSlug) || queryValue(source.brand),
    gender: queryValues(source.gender),
    size: queryValues(source.size),
    color: queryValues(source.color),
    minPrice: queryNumber(source.minPrice),
    maxPrice: queryNumber(source.maxPrice),
    page: page > 0 ? page : 1,
    limit: PAGE_SIZE,
  }
}

// Chuỗi đại diện để so sánh bộ lọc hiện tại với URL (bỏ qua thứ tự phần tử).
function filterSignature(source: ProductFilterQuery) {
  return JSON.stringify([
    source.keyword || '',
    [...source.categoryId].sort(),
    source.categorySlug || '',
    [...source.brandId].sort(),
    source.brandSlug || '',
    [...source.gender].sort(),
    [...source.size].sort(),
    [...source.color].sort(),
    source.minPrice ?? null,
    source.maxPrice ?? null,
    Number(source.page || 1),
  ])
}

const showFilters = ref(true)
const mobileFiltersOpen = ref(false)
const sortBy = ref(parseSort(route.query.sort))
const query = reactive<ProductFilterQuery>(parseFilters(route.query))

function listParams(): PublicProductListQuery {
  return {
    keyword: query.keyword || undefined,
    categoryId: query.categoryId.length ? [...query.categoryId] : undefined,
    categorySlug: query.categoryId.length ? undefined : query.categorySlug || undefined,
    brandId: query.brandId.length ? [...query.brandId] : undefined,
    brandSlug: query.brandId.length ? undefined : query.brandSlug || undefined,
    gender: query.gender.length ? [...query.gender] : undefined,
    size: query.size.length ? [...query.size] : undefined,
    color: query.color.length ? [...query.color] : undefined,
    minPrice: query.minPrice,
    maxPrice: query.maxPrice,
    page: query.page,
    limit: query.limit,
  }
}

// Lần tải đầu chạy cả khi SSR (HTML có sẵn sản phẩm cho người dùng và công cụ tìm kiếm);
// `lazy` để điều hướng phía client không bị chặn mà hiện skeleton.
const initialParams = listParams()
const masterDataAsync = useAsyncData('master-data:public', () => masterDataApi.public(), {
  lazy: true,
  deep: false,
})
const initialListAsync = useAsyncData(
  `product-list:${JSON.stringify(initialParams)}`,
  () => productApi.list(initialParams),
  { lazy: true, deep: false },
)
await Promise.all([masterDataAsync, initialListAsync])
const { data: masterData } = masterDataAsync
const { data: initialList, pending: initialPending, error: initialError } = initialListAsync

const loading = ref(false)
const loadError = ref('')
const localList = shallowRef<Paginated<Product> | null>(null)
const listResult = computed(() => localList.value ?? initialList.value ?? null)
const products = computed(() => listResult.value?.items ?? [])
const total = computed(() => listResult.value?.total ?? 0)
const totalPages = computed(() => listResult.value?.totalPages ?? 0)
const page = computed(() => Number(query.page || 1))
const initialLoading = computed(
  () => !products.value.length && (loading.value || (initialPending.value && !localList.value)),
)
const error = computed(
  () =>
    loadError.value ||
    (!localList.value && initialError.value ? getErrorMessage(initialError.value) : ''),
)
const activeFilterCount = computed(
  () =>
    query.categoryId.length +
    query.brandId.length +
    query.gender.length +
    query.size.length +
    query.color.length +
    (query.categorySlug ? 1 : 0) +
    (query.brandSlug ? 1 : 0) +
    (query.minPrice !== undefined || query.maxPrice !== undefined ? 1 : 0),
)

const currentCategory = computed(() => {
  if (query.categoryId.length === 1) {
    return masterData.value?.categories.find((category) => category.id === query.categoryId[0])
  }

  if (query.categoryId.length) return undefined
  return masterData.value?.categories.find((category) => category.slug === query.categorySlug)
})

const pageTitle = computed(() => currentCategory.value?.name || 'Cửa hàng')

// API chưa hỗ trợ sắp xếp nên chỉ sắp xếp các sản phẩm của trang hiện tại; giá lấy theo
// minSalePrice/minPrice giống ProductCard.
const sortedProducts = computed(() => {
  const items = [...products.value]

  if (sortBy.value === 'price-asc') {
    return items.sort((a, b) => productListPrice(a) - productListPrice(b))
  }

  if (sortBy.value === 'price-desc') {
    return items.sort((a, b) => productListPrice(b) - productListPrice(a))
  }

  if (sortBy.value === 'name-asc') {
    return items.sort((a, b) => a.name.localeCompare(b.name, 'vi'))
  }

  return items
})

const selectedSortLabel = computed(
  () => sortOptions.find((option) => option.value === sortBy.value)?.label || 'Nổi bật',
)

let searchTimer: ReturnType<typeof setTimeout> | undefined
let loadToken = 0
let suppressFilterApply = false

function withFilterApplySuppressed(task: () => void) {
  suppressFilterApply = true
  try {
    task()
  } finally {
    suppressFilterApply = false
  }
}

async function load() {
  const token = ++loadToken
  loading.value = true
  loadError.value = ''

  try {
    const data = await productApi.list(listParams())
    if (token !== loadToken) return

    localList.value = data
    query.page = data.page || query.page
    query.limit = data.limit || query.limit
  } catch (err) {
    if (token !== loadToken) return
    loadError.value = getErrorMessage(err)
  } finally {
    if (token === loadToken) {
      loading.value = false
    }
  }
}

function routeQuery() {
  return {
    keyword: query.keyword || undefined,
    categoryId: query.categoryId.length ? query.categoryId : undefined,
    categorySlug: query.categoryId.length ? undefined : query.categorySlug || undefined,
    brandId: query.brandId.length ? query.brandId : undefined,
    brandSlug: query.brandId.length ? undefined : query.brandSlug || undefined,
    gender: query.gender.length ? query.gender : undefined,
    size: query.size.length ? query.size : undefined,
    color: query.color.length ? query.color : undefined,
    minPrice: query.minPrice !== undefined ? String(query.minPrice) : undefined,
    maxPrice: query.maxPrice !== undefined ? String(query.maxPrice) : undefined,
    sort: sortBy.value === 'featured' ? undefined : sortBy.value,
  }
}

function applyFilters() {
  query.page = 1

  void pageQuery.replace(query.page, routeQuery())
  void load()
}

function changePage(nextPage: number) {
  if (loading.value || nextPage === page.value) return

  query.page = nextPage

  void pageQuery.replace(query.page, routeQuery())
  void load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
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

function clearFilters() {
  query.categoryId = []
  query.categorySlug = ''
  query.brandId = []
  query.brandSlug = ''
  query.gender = []
  query.size = []
  query.color = []
  query.minPrice = undefined
  query.maxPrice = undefined
}

// Link cũ dùng slug (?categorySlug=, ?brand=): đổi sang id để bộ lọc bên trái được tick đúng.
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

withFilterApplySuppressed(hydrateLegacyFilterIds)
watch(masterData, () => withFilterApplySuppressed(hydrateLegacyFilterIds))

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

watch(sortBy, () => {
  void pageQuery.replace(query.page || 1, routeQuery())
})

// URL đổi từ bên ngoài (link Nam/Nữ ở header, ô tìm kiếm, nút back): đồng bộ lại bộ lọc.
// URL do chính trang ghi (applyFilters/changePage) cho ra cùng chữ ký nên được bỏ qua.
watch(
  () => route.query,
  (nextQuery) => {
    if (route.path !== '/products') return

    const nextSort = parseSort(nextQuery.sort)
    if (nextSort !== sortBy.value) sortBy.value = nextSort

    const nextFilters = parseFilters(nextQuery)
    if (filterSignature(nextFilters) === filterSignature(query)) return

    if (searchTimer) clearTimeout(searchTimer)
    withFilterApplySuppressed(() => {
      Object.assign(query, nextFilters)
      hydrateLegacyFilterIds()
    })
    void load()
  },
)

onBeforeUnmount(() => {
  if (searchTimer) {
    clearTimeout(searchTimer)
  }
})
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
