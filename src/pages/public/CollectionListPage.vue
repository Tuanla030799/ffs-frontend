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
        <UiSkeleton v-for="i in 6" :key="i" variant="card" class="h-80" :rows="3" />
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

      <UiPagination
        v-if="totalPages > 1"
        class="mt-10"
        :page="page"
        :total="total"
        :total-pages="totalPages"
        :page-size="Number(query.limit || 20)"
        @update:page="changePage"
      />
    </StorefrontListingLayout>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import CollectionCard from '@/components/storefront/CollectionCard.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import { UiPagination, UiSkeleton } from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { collectionApi } from '@/modules/content/collection/api'
import type { Collection } from '@/modules/content/collection/types'

const pageQuery = usePageQuery()

const rows = ref<Collection[]>([])
const loading = ref(false)
const total = ref(0)
const totalPages = ref(0)

const query = reactive({
  keyword: '',
  page: pageQuery.value(),
  limit: 20,
})
const page = computed(() => Number(query.page || 1))

async function load() {
  loading.value = true

  try {
    const data = await collectionApi.list(query)
    rows.value = data.items
    total.value = data.total
    totalPages.value = data.totalPages
    query.page = data.page || query.page
    query.limit = data.limit || query.limit
  } finally {
    loading.value = false
  }
}

function changePage(nextPage: number) {
  if (loading.value || nextPage === page.value) return

  query.page = nextPage
  void pageQuery.replace(query.page)
  void load()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

onMounted(load)
</script>
