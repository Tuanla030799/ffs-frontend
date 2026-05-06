<template>
  <section class="mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 md:pb-10 lg:px-8">
    <PublicPageHeader
      sticky
      title="Thương hiệu"
      :breadcrumb-items="[{ label: 'Thương hiệu' }]"
      class="pt-6 md:pt-8"
    >
      <template #actions>
        <div class="w-full md:w-[360px]"></div>
      </template>
    </PublicPageHeader>

    <StorefrontListingLayout :show-sidebar="false">
      <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="i in 8" :key="i" class="h-48 animate-pulse bg-black/10" />
      </div>

      <div v-else-if="rows.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <RouterLink
          v-for="row in rows"
          :key="row.id"
          :to="`/products?brand=${row.slug}`"
          class="group bg-[#f7f7f5] p-5 text-black no-underline ring-1 ring-black/5 transition hover:-translate-y-1 hover:ring-black/15"
        >
          <div class="grid aspect-[4/3] place-items-center overflow-hidden bg-white">
            <img
              v-if="imageUrl(row)"
              :src="imageUrl(row)"
              :alt="row.name"
              class="h-full w-full object-contain p-5 grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
            />

            <span v-else class="text-4xl font-black">
              {{ row.name.slice(0, 1) }}
            </span>
          </div>

          <h2 class="mt-5 line-clamp-1 text-xl font-black">
            {{ row.name }}
          </h2>

          <p class="mt-2 line-clamp-2 text-sm leading-6 text-black/60">
            {{ row.description }}
          </p>
        </RouterLink>
      </div>

      <div
        v-else
        class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center text-sm font-semibold text-black/60"
      >
        Không tìm thấy thương hiệu.
      </div>
    </StorefrontListingLayout>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { RouterLink } from 'vue-router'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import { brandApi } from '@/modules/content/brand/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { Brand } from '@/modules/content/brand/types'

// const router = useRouter()

const rows = ref<Brand[]>([])
const loading = ref(false)
const keyword = ref('')

function imageUrl(row: Brand) {
  return resolveFileUrl(row.imageUrl || '')
}

async function load() {
  loading.value = true

  try {
    rows.value = await brandApi.list({
      keyword: keyword.value,
    })
  } finally {
    loading.value = false
  }
}

// function search() {
//   void router.replace({
//     query: {
//       keyword: keyword.value || undefined,
//     },
//   })

//   void load()
// }

onMounted(load)
</script>
