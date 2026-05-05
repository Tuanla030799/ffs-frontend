<template>
  <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 md:py-12 lg:px-8">
    <header class="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between md:mb-10">
      <div>
        <p class="text-sm font-bold tracking-[0.18em] text-black/50 uppercase">Journal</p>
        <h1 class="mt-3 text-3xl font-black uppercase md:text-4xl">Blog</h1>
      </div>
      <UiForm as="form" class="flex gap-2" @submit.prevent="search">
        <UiInput v-model="query.keyword" placeholder="Tìm bài viết" label="Tìm bài viết" />
        <UiButton native-type="submit">Tìm</UiButton>
      </UiForm>
    </header>

    <div v-if="loading" class="grid gap-4 md:grid-cols-3 md:gap-6">
      <div v-for="i in 6" :key="i" class="h-80 animate-pulse bg-black/10" />
    </div>
    <div v-else-if="rows.length" class="grid gap-4 md:grid-cols-3 md:gap-6">
      <RouterLink
        v-for="row in rows"
        :key="row.id"
        :to="`/blogs/${row.slug}`"
        class="group bg-[#f7f7f5] text-black no-underline shadow-sm ring-1 ring-black/5"
      >
        <img
          :src="coverUrl(row) || '/assets/home.jpg'"
          :alt="row.title"
          class="aspect-[4/3] w-full object-cover grayscale transition group-hover:grayscale-0"
        />
        <div class="p-6">
          <p class="text-sm text-black/50">
            {{ formatDateTime(row.publishedAt || row.createdAt) }}
          </p>
          <h2 class="mt-3 line-clamp-2 text-2xl leading-tight font-black">{{ row.title }}</h2>
          <p class="mt-3 line-clamp-3 text-sm leading-6 text-black/65">{{ row.excerpt }}</p>
        </div>
      </RouterLink>
    </div>
    <div
      v-else
      class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center text-black/60"
    >
      Không tìm thấy bài viết.
    </div>
  </main>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink, useRouter } from 'vue-router'
import { UiButton, UiForm, UiInput } from '@/components/ui'
import { blogApi } from '@/modules/content/blog/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatDateTime } from '@/modules/shared/types'
import type { Blog } from '@/modules/content/blog/types'

const router = useRouter()
const rows = ref<Blog[]>([])
const loading = ref(false)
const query = reactive({ keyword: '', page: 1, limit: 20 })

function coverUrl(row: Blog) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}

async function load() {
  loading.value = true
  try {
    rows.value = (await blogApi.list(query)).items
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
