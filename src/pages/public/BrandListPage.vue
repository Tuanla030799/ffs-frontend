<template>
  <section class="mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 md:pb-10 lg:px-8">
    <PublicPageHeader
      sticky
      title="Thương hiệu"
      subtitle="Chọn thương hiệu bạn yêu thích và xem nhanh các mẫu đang có."
      :breadcrumb-items="[{ label: 'Thương hiệu' }]"
      class="pt-6 md:pt-8"
    >
      <template #actions>
        <form class="relative w-full md:w-[360px]" @submit.prevent="load">
          <svg
            class="pointer-events-none absolute top-1/2 left-4 z-10 h-5 w-5 -translate-y-1/2 text-black/40"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
          >
            <circle cx="11" cy="11" r="7" stroke-width="1.8" />
            <path d="m16.5 16.5 4 4" stroke-width="1.8" stroke-linecap="round" />
          </svg>
          <UiInput
            v-model="keyword"
            class="brand-search"
            placeholder="Tìm thương hiệu"
            aria-label="Tìm thương hiệu"
            @input="scheduleSearch"
          />
        </form>
      </template>
    </PublicPageHeader>

    <StorefrontListingLayout :show-sidebar="false">
      <div
        v-if="loading"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <UiSkeleton
          v-for="i in 8"
          :key="i"
          variant="card"
          class="min-h-[248px]"
          media-class="aspect-[5/3]"
          :rows="3"
        />
      </div>

      <div
        v-else-if="rows.length"
        class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      >
        <StorefrontCard
          v-for="row in rows"
          :key="row.id"
          as="RouterLink"
          :to="`/products?brand=${row.slug}`"
          padding="none"
          class="h-full min-h-[248px]"
          body-class="flex min-h-0 flex-1 flex-col p-5"
        >
          <template #media>
            <div
              class="grid aspect-[5/3] place-items-center overflow-hidden border-b border-black/10 bg-[#f6f6f3]"
            >
              <StorefrontImage
                :src="row.imageUrl"
                :alt="row.name"
                fit="cover"
                :fallback-src="null"
                class="h-full w-full object-cover transition duration-300 group-hover:scale-105"
              >
                <template #fallback>
                  <span
                    class="grid h-20 w-20 place-items-center rounded-full bg-black text-2xl font-black text-white"
                  >
                    {{ brandInitials(row.name) }}
                  </span>
                </template>
              </StorefrontImage>
            </div>
          </template>

          <div class="flex items-start justify-between gap-4">
            <h2 class="line-clamp-1 text-xl leading-tight font-black">
              {{ row.name }}
            </h2>
            <span
              class="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.06] text-lg leading-none transition group-hover:bg-black group-hover:text-white"
              aria-hidden="true"
            >
              →
            </span>
          </div>

          <p
            v-if="row.description"
            class="mt-3 line-clamp-2 min-h-11 text-sm leading-6 text-black/60"
          >
            {{ row.description }}
          </p>
          <p v-else class="mt-3 min-h-11 text-sm leading-6 text-black/45">
            Xem các sản phẩm từ {{ row.name }}.
          </p>

          <div
            class="mt-auto pt-5 text-sm font-bold text-black/45 transition group-hover:text-black"
          >
            Xem sản phẩm
          </div>
        </StorefrontCard>
      </div>

      <div v-else class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center">
        <p class="text-lg font-black text-black">Không tìm thấy thương hiệu.</p>
        <button
          v-if="keyword"
          type="button"
          class="mt-4 text-sm font-bold text-black/55 underline-offset-4 hover:text-black hover:underline"
          @click="clearSearch"
        >
          Xóa tìm kiếm
        </button>
      </div>
    </StorefrontListingLayout>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import StorefrontCard from '@/components/storefront/StorefrontCard.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { UiSkeleton } from '@/components/ui'
import { brandApi } from '@/modules/content/brand/api'
import type { Brand } from '@/modules/content/brand/types'

const rows = ref<Brand[]>([])
const loading = ref(false)
const keyword = ref('')
let searchTimer: ReturnType<typeof setTimeout> | undefined

async function load() {
  if (searchTimer) clearTimeout(searchTimer)
  loading.value = true

  try {
    rows.value = await brandApi.list({
      keyword: keyword.value,
    })
  } finally {
    loading.value = false
  }
}

function scheduleSearch() {
  if (searchTimer) clearTimeout(searchTimer)
  searchTimer = setTimeout(load, 160)
}

function clearSearch() {
  keyword.value = ''
  void load()
}

function brandInitials(value: string) {
  return value
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part.slice(0, 1).toUpperCase())
    .join('')
}

onMounted(load)
</script>

<style scoped>
:deep(.brand-search input) {
  border-color: rgba(0, 0, 0, 0.1);
  background: rgba(0, 0, 0, 0.04);
  padding-left: 2.75rem;
}

:deep(.brand-search input:focus) {
  border-color: rgba(0, 0, 0, 0.35);
  box-shadow: 0 0 0 4px rgba(0, 0, 0, 0.06);
}
</style>
