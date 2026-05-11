<template>
  <section class="mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 md:pb-10 lg:px-8">
    <PublicPageHeader
      compact
      sticky
      title="Bộ sưu tập"
      eyebrow="Collections"
      :breadcrumb-items="[{ label: 'Bộ sưu tập' }]"
      class="pt-6 md:pt-8"
    >
      <template #actions>
        <div class="w-full md:w-[360px]"></div>
      </template>
    </PublicPageHeader>

    <StorefrontListingLayout :show-sidebar="false">
      <div v-if="loading" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-80 animate-pulse bg-black/10" />
      </div>

      <div v-else-if="rows.length" class="grid grid-cols-1 gap-5 sm:grid-cols-2 xl:grid-cols-3">
        <CollectionCard v-for="row in rows" :key="row.id" :collection="row" />
      </div>

      <div
        v-else
        class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center text-sm font-semibold text-black/60"
      >
        Không tìm thấy bộ sưu tập.
      </div>
    </StorefrontListingLayout>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import CollectionCard from '@/components/storefront/CollectionCard.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import { collectionApi } from '@/modules/content/collection/api'
import type { Collection } from '@/modules/content/collection/types'

// const router = useRouter()

const rows = ref<Collection[]>([])
const loading = ref(false)

const query = reactive({
  keyword: '',
  page: 1,
  limit: 20,
})

async function load() {
  loading.value = true

  try {
    rows.value = (await collectionApi.list(query)).items
  } finally {
    loading.value = false
  }
}

// function search() {
//   query.page = 1

//   void router.replace({
//     query: {
//       keyword: query.keyword || undefined,
//     },
//   })

//   void load()
// }

onMounted(load)
</script>
