<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
    <header class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
      <div>
        <p class="text-sm font-bold tracking-[0.18em] text-black/50 uppercase">Collections</p>
        <h1 class="mt-3 text-3xl font-black uppercase md:text-4xl">Bộ sưu tập</h1>
      </div>
      <FilterForm
        v-model:keyword="query.keyword"
        :card="false"
        class="flex gap-2"
        search-placeholder="Tìm bộ sưu tập"
        search-label="Tìm bộ sưu tập"
        submit-label="Tìm"
        @search="search"
      />
    </header>

    <div v-if="loading" class="grid gap-4 md:grid-cols-3 md:gap-6">
      <div v-for="i in 6" :key="i" class="h-80 animate-pulse bg-black/10" />
    </div>
    <div v-else-if="rows.length" class="grid gap-4 md:grid-cols-3 md:gap-6">
      <RouterLink
        v-for="row in rows"
        :key="row.id"
        :to="`/collections/${row.slug}`"
        class="group bg-[#f7f7f5] text-black no-underline shadow-sm ring-1 ring-black/5"
      >
        <div class="aspect-[4/3] bg-[#ededeb]">
          <img
            v-if="coverUrl(row)"
            :src="coverUrl(row)"
            :alt="row.name"
            class="h-full w-full object-cover grayscale transition group-hover:grayscale-0"
          />
        </div>
        <div class="p-6">
          <p class="text-xs font-bold tracking-[0.16em] text-black/50 uppercase">
            {{ row.productCount || 0 }} sản phẩm
          </p>
          <h2 class="mt-2 text-2xl font-black">{{ row.name }}</h2>
          <p class="mt-3 line-clamp-2 text-sm leading-6 text-black/65">{{ row.description }}</p>
        </div>
      </RouterLink>
    </div>
    <div
      v-else
      class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center text-black/60"
    >
      Không tìm thấy bộ sưu tập.
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import FilterForm from '@/components/common/FilterForm.vue'
import { collectionApi } from '@/modules/content/collection/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { Collection } from '@/modules/content/collection/types'

const router = useRouter()
const rows = ref<Collection[]>([])
const loading = ref(false)
const query = reactive({ keyword: '', page: 1, limit: 20 })

function coverUrl(row: Collection) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}

async function load() {
  loading.value = true
  try {
    rows.value = (await collectionApi.list(query)).items
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  void router.replace({ query: { keyword: query.keyword || undefined } })
  void load()
}

onMounted(load)
</script>
