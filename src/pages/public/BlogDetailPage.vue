<template>
  <main class="mx-auto max-w-4xl px-4 py-8 sm:px-6 md:py-10 lg:px-8">
    <BreadcrumbNav
      class="mb-5"
      :items="[{ label: 'Blog', to: '/blogs' }, { label: blog?.title || 'Chi tiết' }]"
    />
    <article v-if="loading" class="bg-[#f7f7f5] shadow-sm ring-1 ring-black/5">
      <UiSkeleton variant="block" class="aspect-[16/9] rounded-none" />
      <div class="space-y-6 p-5 md:p-12">
        <UiSkeleton :rows="5" />
        <UiSkeleton class="pt-4" :rows="6" />
      </div>
    </article>

    <article v-else-if="blog" class="bg-[#f7f7f5] shadow-sm ring-1 ring-black/5">
      <StorefrontImage
        :src="blog.coverImageUrl || blog.coverUrl"
        :alt="blog.title"
        class="aspect-[16/9] w-full object-cover"
      />
      <div class="p-5 md:p-12">
        <p class="text-sm text-black/50">
          {{ formatLocalDateTime(blog.publishedAt || blog.createdAt) }}
        </p>
        <h1 class="mt-4 text-3xl leading-tight font-black md:text-5xl">{{ blog.title }}</h1>
        <p class="mt-5 text-lg leading-8 text-black/65">{{ blog.excerpt }}</p>
        <div class="mt-10">
          <SafeHtmlContent :html="blogContentHtml" />
        </div>
      </div>
    </article>
    <div
      v-else-if="errorMessage"
      class="border border-red-200 bg-red-50 p-6 text-red-700"
      role="alert"
    >
      <p class="font-semibold">Không tải được bài viết.</p>
      <p class="mt-1 text-sm">{{ errorMessage }}</p>
      <UiButton class="mt-4" variant="secondary" size="sm" @click="refreshBlog()">Thử lại</UiButton>
    </div>
    <div
      v-else
      class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-black/60"
    >
      <h1 class="text-lg font-black text-black">Không tìm thấy bài viết.</h1>
      <p class="mt-2 text-sm">Nội dung có thể đã bị gỡ hoặc đường dẫn không đúng.</p>
      <NuxtLink
        to="/blogs"
        class="mt-5 inline-flex bg-black px-5 py-3 text-sm font-bold text-white no-underline transition hover:bg-black/80"
      >
        Xem bài viết khác
      </NuxtLink>
    </div>
  </main>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRuntimeConfig } from '#imports'
import { useRoute } from 'vue-router'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { UiButton, UiSkeleton } from '@/components/ui'
import { blogApi } from '@/modules/content/blog/api'
import { resolveFileUrl } from '@/lib/fileUrl'
import { normalizeRichTextInput } from '@/lib/richText'
import { formatLocalDateTime } from '@/lib/dateTime'
import { isNotFoundError, useNotFoundStatus } from '@/composables/useNotFoundStatus'
import { getErrorMessage } from '@/modules/shared/hooks'
import { DEFAULT_OG_IMAGE_PATH, ogImageOrDefault, publicSiteUrl } from '@/lib/seo'
import type { Blog } from '@/modules/content/blog/types'

const route = useRoute()
const siteUrl = publicSiteUrl(String(useRuntimeConfig().public.siteUrl || ''))
const {
  data: blog,
  pending: loading,
  error: blogError,
  refresh: refreshBlog,
} = await useAsyncData(`blog-detail-${String(route.params.slug)}`, () =>
  blogApi.detail(String(route.params.slug)),
)
useNotFoundStatus(blog, blogError)
const notFound = computed(
  () => !blog.value && (!blogError.value || isNotFoundError(blogError.value)),
)
const errorMessage = computed(() =>
  blogError.value && !isNotFoundError(blogError.value) ? getErrorMessage(blogError.value) : '',
)
const blogContentHtml = computed(() =>
  normalizeRichTextInput(blog.value?.contentHtml || blog.value?.contentJson),
)

function coverUrl(row: Blog) {
  return resolveFileUrl(row.coverImageUrl || row.coverUrl || '') || DEFAULT_OG_IMAGE_PATH
}

useSeoMeta({
  title: () =>
    blog.value ? `${blog.value.title} - The Pocket Shoes Blog` : 'Blog - The Pocket Shoes',
  description: () => blog.value?.excerpt || 'Bài viết từ The Pocket Shoes.',
  ogTitle: () => blog.value?.title || 'The Pocket Shoes Blog',
  ogDescription: () => blog.value?.excerpt || 'Bài viết từ The Pocket Shoes.',
  ogImage: () => ogImageOrDefault(blog.value ? coverUrl(blog.value) : '', siteUrl),
  twitterImage: () => ogImageOrDefault(blog.value ? coverUrl(blog.value) : '', siteUrl),
  robots: () => (notFound.value && !loading.value ? 'noindex, follow' : undefined),
})
</script>
