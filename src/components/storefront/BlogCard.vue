<template>
  <StorefrontCard
    as="RouterLink"
    :to="`/blogs/${blog.slug}`"
    padding="none"
    :class="layout === 'featured' ? 'animate-fade-up md:grid md:grid-cols-[1.15fr_1fr]' : 'h-full'"
  >
    <template #media>
      <div
        :class="
          layout === 'featured'
            ? 'h-64 overflow-hidden md:h-full md:min-h-72'
            : 'aspect-[4/3] overflow-hidden bg-[#eeeeeb]'
        "
      >
        <StorefrontImage
          :src="blog.coverImageUrl || blog.coverUrl"
          :alt="blog.title"
          :class="
            layout === 'featured'
              ? 'h-full w-full object-cover transition duration-500 group-hover:scale-105'
              : 'h-full w-full object-cover transition duration-300 group-hover:scale-105'
          "
        />
      </div>
    </template>

    <div :class="layout === 'featured' ? 'flex flex-col justify-center p-5 md:p-10' : 'p-5 md:p-6'">
      <p class="text-sm font-semibold text-black/50">
        {{ formatLocalDateTime(blog.publishedAt || blog.createdAt) }}
      </p>
      <h2
        :class="
          layout === 'featured'
            ? 'mt-5 max-w-md text-2xl leading-tight font-black md:text-3xl'
            : 'mt-3 line-clamp-2 text-xl leading-tight font-black md:text-2xl'
        "
      >
        {{ blog.title }}
      </h2>
      <p
        :class="
          layout === 'featured'
            ? 'mt-5 max-w-md text-sm leading-6 text-black/65'
            : 'mt-3 line-clamp-3 text-sm leading-6 text-black/65'
        "
      >
        {{ blog.excerpt }}
      </p>
      <span
        v-if="layout === 'featured'"
        class="mt-8 inline-flex w-fit bg-black px-6 py-3 text-xs font-black tracking-wide text-white uppercase"
      >
        Đọc ngay →
      </span>
    </div>
  </StorefrontCard>
</template>

<script setup lang="ts">
import StorefrontCard from '@/components/storefront/StorefrontCard.vue'
import StorefrontImage from '@/components/storefront/StorefrontImage.vue'
import { formatLocalDateTime } from '@/lib/dateTime'
import type { Blog } from '@/modules/content/blog/types'

withDefaults(
  defineProps<{
    blog: Blog
    layout?: 'default' | 'featured'
  }>(),
  {
    layout: 'default',
  },
)
</script>
