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
      <div v-if="loading" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <div v-for="i in 6" :key="i" class="h-80 animate-pulse bg-black/10" />
      </div>

      <div v-else-if="rows.length" class="grid grid-cols-1 gap-5 md:grid-cols-2 xl:grid-cols-3">
        <RouterLink
          v-for="row in rows"
          :key="row.id"
          :to="`/blogs/${row.slug}`"
          class="group overflow-hidden bg-[#f7f7f5] text-black no-underline ring-1 ring-black/5 transition hover:ring-black/15"
        >
          <img
            :src="coverUrl(row) || '/assets/home.jpg'"
            :alt="row.title"
            class="aspect-[4/3] w-full object-cover grayscale transition duration-300 group-hover:scale-105 group-hover:grayscale-0"
          />

          <div class="p-5 md:p-6">
            <p class="text-sm font-semibold text-black/50">
              {{ formatDateTime(row.publishedAt || row.createdAt) }}
            </p>

            <h2 class="mt-3 line-clamp-2 text-xl leading-tight font-black md:text-2xl">
              {{ row.title }}
            </h2>

            <p class="mt-3 line-clamp-3 text-sm leading-6 text-black/65">
              {{ row.excerpt }}
            </p>
          </div>
        </RouterLink>
      </div>

      <div
        v-else
        class="border border-dashed border-black/20 bg-[#f7f7f5] p-12 text-center text-sm font-semibold text-black/60"
      >
        Không tìm thấy bài viết.
      </div>
    </StorefrontListingLayout>
  </section>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { RouterLink } from 'vue-router'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import StorefrontListingLayout from '@/components/storefront/StorefrontListingLayout.vue'
import { blogApi } from '@/modules/content/blog/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatDateTime } from '@/modules/shared/types'
import type { Blog } from '@/modules/content/blog/types'

// const router = useRouter()

const rows = ref<Blog[]>([])
const loading = ref(false)

const query = reactive({
  keyword: '',
  page: 1,
  limit: 20,
})

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
