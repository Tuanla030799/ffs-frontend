<template>
  <main class="mx-auto max-w-[1440px] px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <header
      class="sticky top-0 z-20 -mx-4 mb-6 border-b border-black/10 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8"
    >
      <div class="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 class="text-2xl font-black md:text-3xl">Cửa hàng</h1>
          <p class="mt-1 text-sm text-black/60">{{ total }} sản phẩm</p>
        </div>
        <div class="flex items-center gap-4 text-sm font-semibold">
          <button
            class="hidden hover:text-black/60 lg:inline-flex"
            type="button"
            @click="showFilters = !showFilters"
          >
            {{ showFilters ? 'Hide Filters' : 'Show Filters' }}
          </button>
          <button
            class="hover:text-black/60 lg:hidden"
            type="button"
            @click="mobileFiltersOpen = !mobileFiltersOpen"
          >
            Filters
          </button>
          <span class="text-black/40">Sort By</span>
        </div>
      </div>
    </header>

    <div v-if="error" class="mb-4 border border-red-200 bg-red-50 p-4 text-red-700">
      {{ error }}
    </div>

    <section class="grid gap-6 lg:grid-cols-[auto_minmax(0,1fr)]">
      <aside v-show="showFilters" class="hidden w-64 shrink-0 lg:block">
        <div class="sticky top-28 max-h-[calc(100vh-7rem)] overflow-y-auto pr-4">
          <ProductFilterSidebar
            v-model:keyword="query.keyword"
            v-model:category-slug="query.categorySlug"
            v-model:brand-slug="selectedBrandSlug"
            v-model:gender="query.gender"
            v-model:size="query.size"
            v-model:color="query.color"
            v-model:min-price="query.minPrice"
            v-model:max-price="query.maxPrice"
            :categories="masterData?.categories || []"
            :brands="masterData?.brands || []"
            :genders="masterData?.productGenders || []"
            @search="search"
            @reset="resetFilters"
          />
        </div>
      </aside>

      <div>
        <div v-if="mobileFiltersOpen" class="mb-5 border border-black/10 p-4 lg:hidden">
          <ProductFilterSidebar
            v-model:keyword="query.keyword"
            v-model:category-slug="query.categorySlug"
            v-model:brand-slug="selectedBrandSlug"
            v-model:gender="query.gender"
            v-model:size="query.size"
            v-model:color="query.color"
            v-model:min-price="query.minPrice"
            v-model:max-price="query.maxPrice"
            :categories="masterData?.categories || []"
            :brands="masterData?.brands || []"
            :genders="masterData?.productGenders || []"
            @search="search"
            @reset="resetFilters"
          />
        </div>

        <div v-if="loading" class="grid gap-x-4 gap-y-8 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="i in 9" :key="i" class="h-96 animate-pulse bg-black/10" />
        </div>
        <div
          v-else-if="products.length"
          class="grid gap-x-4 gap-y-10 sm:grid-cols-2 lg:grid-cols-3"
        >
          <ProductCard v-for="product in products" :key="product.id" :product="product" />
        </div>
        <div
          v-else
          class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-black/60"
        >
          Không tìm thấy sản phẩm.
        </div>
      </div>
    </section>

    <div class="mt-8 flex justify-center gap-2">
      <UiButton variant="outline" :disabled="page <= 1" @click="go(page - 1)">Trước</UiButton>
      <span class="bg-[#f7f7f5] px-4 py-3 text-sm font-bold">{{ page }} / {{ totalPages }}</span>
      <UiButton variant="outline" :disabled="page >= totalPages" @click="go(page + 1)"
        >Sau</UiButton
      >
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { UiButton } from '@/components/ui'
import ProductFilterSidebar from '@/components/storefront/ProductFilterSidebar.vue'
import ProductCard from '@/components/storefront/ProductCard.vue'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import type { Product, ProductListQuery } from '@/modules/catalog/product/types'

const route = useRoute()
const router = useRouter()
const loading = ref(false)
const error = ref('')
const products = ref<Product[]>([])
const total = ref(0)
const showFilters = ref(true)
const mobileFiltersOpen = ref(false)
const selectedBrandSlug = ref(String(route.query.brand || route.query.brandSlug || ''))
const query = reactive<ProductListQuery>({
  keyword: String(route.query.keyword || ''),
  categorySlug: String(route.query.categorySlug || ''),
  brandSlug: selectedBrandSlug.value,
  gender: String(route.query.gender || ''),
  size: '',
  color: '',
  page: Number(route.query.page || 1),
  limit: 12,
})
const { data: masterData, error: masterError, load: loadMasterData } = useMasterData('public')
const page = computed(() => Number(query.page || 1))
const totalPages = computed(() => Math.max(1, Math.ceil(total.value / Number(query.limit || 12))))

async function load() {
  loading.value = true
  error.value = masterError.value || ''
  try {
    const data = await productApi.list({
      ...query,
      brandSlug: selectedBrandSlug.value || undefined,
      gender: query.gender || undefined,
    })
    products.value = data.items
    total.value = data.total
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function routeQuery() {
  return { ...query, brand: selectedBrandSlug.value || undefined, brandSlug: undefined }
}

function search() {
  query.page = 1
  void router.replace({ query: routeQuery() })
  void load()
}
function resetFilters() {
  query.keyword = ''
  query.categorySlug = ''
  selectedBrandSlug.value = ''
  query.gender = ''
  query.size = ''
  query.color = ''
  query.minPrice = undefined
  query.maxPrice = undefined
  search()
}
function go(next: number) {
  query.page = next
  void router.replace({ query: routeQuery() })
  void load()
}

onMounted(async () => {
  await loadMasterData().catch(() => null)
  await load()
})
</script>
