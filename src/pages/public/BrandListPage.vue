<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
    <header class="mb-7 flex flex-col gap-4 md:mb-10 sm:flex-row sm:items-end sm:justify-between">
      <div>
        <p class="text-sm font-bold uppercase tracking-[0.18em] text-black/50">Brands</p>
        <h1 class="mt-3 text-3xl font-black uppercase md:text-4xl">Thương hiệu</h1>
      </div>
      <form class="flex gap-2" @submit.prevent="search">
        <UiInput v-model="keyword" placeholder="Tìm brand"  label="Tìm brand"/>
        <UiButton native-type="submit">Tìm</UiButton>
      </form>
    </header>

    <div v-if="loading" class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <div v-for="i in 8" :key="i" class="h-48 animate-pulse bg-black/10" />
    </div>
    <div v-else-if="rows.length" class="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
      <RouterLink
        v-for="row in rows"
        :key="row.id"
        :to="`/products?brand=${row.slug}`"
        class="group bg-[#f7f7f5] p-6 text-black no-underline shadow-sm ring-1 ring-black/5 transition hover:-translate-y-1 hover:shadow-xl"
      >
        <div class="grid aspect-[4/3] place-items-center bg-white">
          <img v-if="imageUrl(row)" :src="imageUrl(row)" :alt="row.name" class="h-full w-full object-contain p-5 grayscale transition group-hover:grayscale-0">
          <span v-else class="text-4xl font-black">{{ row.name.slice(0, 1) }}</span>
        </div>
        <h2 class="mt-5 text-xl font-black">{{ row.name }}</h2>
        <p class="mt-2 line-clamp-2 text-sm text-black/60">{{ row.description }}</p>
      </RouterLink>
    </div>
    <div v-else class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center text-black/60">Không tìm thấy brand.</div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { UiButton, UiInput } from '@/components/ui'
import { brandApi } from '@/modules/content/brand/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { Brand } from '@/modules/content/brand/types'

const router = useRouter()
const rows = ref<Brand[]>([])
const loading = ref(false)
const keyword = ref('')

function imageUrl(row: Brand) { return resolveFileUrl(row.imageUrl || '') }
async function load() { loading.value = true; try { rows.value = await brandApi.list({ keyword: keyword.value }) } finally { loading.value = false } }
function search() { void router.replace({ query: { keyword: keyword.value || undefined } }); void load() }

onMounted(load)
</script>
