<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
    <header class="mb-7 md:mb-10">
      <p class="text-sm font-bold tracking-[0.18em] text-black/50 uppercase">Shop</p>
      <h1 class="mt-3 text-3xl font-black uppercase md:text-4xl">Cửa hàng</h1>
      <p class="mt-3 max-w-xl text-black/65">Filter theo category, size, color, giá và keyword.</p>
    </header>

    <form
      class="mb-7 grid gap-3 border border-black/10 bg-[#f7f7f5] p-3 md:mb-8 md:grid-cols-6 md:p-4"
      @submit.prevent="search"
    >
      <UiInput
        v-model="query.keyword"
        class="md:col-span-2"
        placeholder="Tìm giày"
        label="Tìm giày"
      />
      <UiSelect v-model="query.categorySlug" label="Danh mục">
        <option value="">Tất cả category</option>
        <option v-for="c in masterData?.categories || []" :key="c.id" :value="c.slug">
          {{ c.name }}
        </option>
      </UiSelect>
      <UiSelect v-model="selectedBrandSlug" label="Thương hiệu">
        <option value="">Tất cả brand</option>
        <option v-for="brand in masterData?.brands || []" :key="brand.id" :value="brand.slug">
          {{ brand.name }}
        </option>
      </UiSelect>
      <UiSelect v-model="query.gender" label="Giới tính">
        <option value="">Tất cả gender</option>
        <option
          v-for="gender in masterData?.productGenders || []"
          :key="gender.value"
          :value="gender.value"
        >
          {{ gender.label }}
        </option>
      </UiSelect>
      <UiInput v-model="query.size" placeholder="Size" label="Size" />
      <UiInput v-model="query.color" placeholder="Color" label="Color" />
      <UiButton native-type="submit">Lọc</UiButton>
      <UiInput v-model.number="query.minPrice" placeholder="Giá từ" label="Giá từ" />
      <UiInput v-model.number="query.maxPrice" placeholder="Giá đến" label="Giá đến" />
    </form>

    <div v-if="error" class="mb-4 border border-red-200 bg-red-50 p-4 text-red-700">
      {{ error }}
    </div>
    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
      <div v-for="i in 8" :key="i" class="h-80 animate-pulse bg-black/10" />
    </div>
    <div v-else-if="products.length" class="grid gap-4 sm:grid-cols-2 md:gap-5 lg:grid-cols-4">
      <ProductCard v-for="product in products" :key="product.id" :product="product" />
    </div>
    <div
      v-else
      class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-black/60"
    >
      Không tìm thấy sản phẩm.
    </div>

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
import { UiButton, UiInput, UiSelect } from '@/components/ui'
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
