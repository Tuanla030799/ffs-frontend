<template>
  <section class="mx-auto max-w-[1440px] px-4 pb-8 sm:px-6 md:pb-10 lg:px-8">
    <PublicPageHeader
      compact
      sticky
      title="Blog"
      eyebrow="Journal"
      :breadcrumb-items="[{ label: 'Blog' }]"
      class="pt-6 md:pt-8"
    >
      <template #actions>
        <div class="w-full md:w-[360px]"></div>
      </template>
    </PublicPageHeader>

    <StorefrontListingLayout :show-sidebar="false">
      <div
        v-if="error"
        class="mb-5 border border-red-200 bg-red-50 p-4 text-sm font-semibold text-red-700"
        role="alert"
      >
        {{ error }}
      </div>

      <div v-if="showSkeleton" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <UiSkeleton v-for="i in 6" :key="i" variant="card" class="h-80" :rows="4" />
      </div>

      <div v-else-if="rows.length" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <BlogCard v-for="row in rows" :key="row.id" :blog="row" />
      </div>

      <div
        v-else
        class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center text-sm font-semibold text-black/60"
      >
        Không tìm thấy bài viết.
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
import { computed, reactive, ref, shallowRef } from 'vue'
import { useAsyncData } from '#imports'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import BlogCard from '@/components/storefront/BlogCard.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import { UiPagination, UiSkeleton } from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { blogApi } from '@/modules/content/blog/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { Paginated } from '@/modules/shared/types'
import type { Blog } from '@/modules/content/blog/types'

const pageQuery = usePageQuery()

const query = reactive({
  page: pageQuery.value(),
  limit: 20,
})

// Trang đầu được lấy ngay khi SSR; chuyển trang sau đó tải phía client.
const {
  data: initialPage,
  pending: initialPending,
  error: initialError,
} = await useAsyncData(`blog-list:${query.page}:${query.limit}`, () => blogApi.list({ ...query }), {
  lazy: true,
  deep: false,
})

const loading = ref(false)
const loadError = ref('')
const localPage = shallowRef<Paginated<Blog> | null>(null)
const result = computed(() => localPage.value ?? initialPage.value ?? null)
const rows = computed(() => result.value?.items ?? [])
const total = computed(() => result.value?.total ?? 0)
const totalPages = computed(() => result.value?.totalPages ?? 0)
const page = computed(() => Number(query.page || 1))
const showSkeleton = computed(() => loading.value || (initialPending.value && !result.value))
const error = computed(
  () =>
    loadError.value ||
    (!localPage.value && initialError.value ? getErrorMessage(initialError.value) : ''),
)

async function load() {
  loading.value = true
  loadError.value = ''

  try {
    const data = await blogApi.list({ ...query })
    localPage.value = data
    query.page = data.page || query.page
    query.limit = data.limit || query.limit
  } catch (err) {
    loadError.value = getErrorMessage(err)
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
</script>
