<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
    <div class="mb-6"><h1 class="text-4xl font-black">Sản phẩm</h1><p class="mt-2 text-slate-500">Filter theo category, size, color, giá và keyword.</p></div>
    <form class="mb-6 grid gap-3 rounded-3xl border border-slate-200 bg-white p-4 md:grid-cols-6" @submit.prevent="search"><input v-model="query.keyword" class="rounded-xl border p-3 md:col-span-2" placeholder="Tìm giày"><select v-model="query.categorySlug" class="rounded-xl border p-3"><option value="">Tất cả category</option><option v-for="c in categories" :key="c.id" :value="c.slug">{{ c.name }}</option></select><input v-model="query.size" class="rounded-xl border p-3" placeholder="Size"><input v-model="query.color" class="rounded-xl border p-3" placeholder="Color"><button class="rounded-xl bg-slate-950 px-4 py-3 font-bold text-white">Lọc</button><input v-model.number="query.minPrice" class="rounded-xl border p-3" placeholder="Giá từ"><input v-model.number="query.maxPrice" class="rounded-xl border p-3" placeholder="Giá đến"></form>
    <div v-if="error" class="mb-4 rounded-2xl bg-red-50 p-4 text-red-700">{{ error }}</div>
    <div v-if="loading" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><div v-for="i in 8" :key="i" class="h-80 animate-pulse rounded-3xl bg-slate-200" /></div>
    <div v-else-if="products.length" class="grid gap-5 sm:grid-cols-2 lg:grid-cols-4"><ProductCard v-for="product in products" :key="product.id" :product="product" /></div>
    <div v-else class="rounded-3xl border border-dashed bg-white p-10 text-center text-slate-500">Không tìm thấy sản phẩm.</div>
    <div class="mt-8 flex justify-center gap-2"><button class="rounded-xl border px-4 py-2" :disabled="page <= 1" @click="go(page - 1)">Trước</button><span class="rounded-xl bg-white px-4 py-2 font-bold">{{ page }} / {{ totalPages }}</span><button class="rounded-xl border px-4 py-2" :disabled="page >= totalPages" @click="go(page + 1)">Sau</button></div>
  </main>
</template>
<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import ProductCard from '@/components/storefront/ProductCard.vue'
import { productApi } from '@/modules/catalog/product/api'
import { categoryApi } from '@/modules/catalog/category/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { Product, ProductListQuery } from '@/modules/catalog/product/types'
import type { Category } from '@/modules/catalog/category/types'
const route = useRoute(); const router = useRouter(); const loading = ref(false); const error = ref(''); const products = ref<Product[]>([]); const total = ref(0); const categories = ref<Category[]>([])
const query = reactive<ProductListQuery>({ keyword: String(route.query.keyword || ''), categorySlug: String(route.query.categorySlug || ''), size: '', color: '', page: Number(route.query.page || 1), limit: 12 })
const page = computed(() => Number(query.page || 1)); const totalPages = computed(() => Math.max(1, Math.ceil(total.value / Number(query.limit || 12))))
async function load() { loading.value = true; error.value = ''; try { const data = await productApi.list(query); products.value = data.items; total.value = data.total } catch (err) { error.value = getErrorMessage(err) } finally { loading.value = false } }
function search() { query.page = 1; void router.replace({ query: { ...query } }); void load() }
function go(next: number) { query.page = next; void router.replace({ query: { ...query } }); void load() }
onMounted(async () => { categories.value = await categoryApi.publicList().catch(() => []); await load() })
</script>
