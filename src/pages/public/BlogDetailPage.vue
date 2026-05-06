<template>
  <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[{ label: 'Blog', to: '/blogs' }, { label: blog?.title || 'Chi tiết' }]"
    />
    <article v-if="blog" class="bg-[#f7f7f5] shadow-sm ring-1 ring-black/5">
      <img
        :src="coverUrl(blog) || '/assets/home.jpg'"
        :alt="blog.title"
        class="aspect-[16/9] w-full object-cover grayscale"
      />
      <div class="p-5 md:p-12">
        <p class="text-sm text-black/50">
          {{ formatDateTime(blog.publishedAt || blog.createdAt) }}
        </p>
        <h1 class="mt-4 text-3xl leading-tight font-black md:text-5xl">{{ blog.title }}</h1>
        <p class="mt-5 text-lg leading-8 text-black/65">{{ blog.excerpt }}</p>
        <div class="mt-10">
          <SafeHtmlContent :html="normalizeRichTextInput(blog.contentJson)" />
        </div>
      </div>
    </article>
  </main>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import { blogApi } from '@/modules/content/blog/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import { normalizeRichTextInput } from '@/lib/richText'
import { formatDateTime } from '@/modules/shared/types'
import type { Blog } from '@/modules/content/blog/types'

const route = useRoute()
const blog = ref<Blog | null>(null)

function coverUrl(row: Blog) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}

onMounted(async () => {
  blog.value = await blogApi.detail(String(route.params.slug))
})
</script>
