<template>
  <HomePage />
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from '#imports'
import HomePage from '@/pages/public/HomePage.vue'
import { defaultOgImage, publicSiteUrl } from '@/lib/seo'

definePageMeta({ layout: 'public', name: 'home' })

const runtimeConfig = useRuntimeConfig()
const siteUrl = publicSiteUrl(String(runtimeConfig.public.siteUrl || ''))
const homeUrl = `${siteUrl}/`
const title = 'The Pocket Shoes - Giày sneaker và thời trang'
const description =
  'The Pocket Shoes mang đến các mẫu giày sneaker, bộ sưu tập và bài viết thời trang mới.'
const ogTitle = 'The Pocket Shoes'
const ogDescription = 'Khám phá giày sneaker, bộ sưu tập nổi bật và cảm hứng phối đồ mới.'
const ogImage = defaultOgImage(siteUrl)

useHead({
  link: [{ rel: 'canonical', href: homeUrl }],
})

useSeoMeta({
  title,
  description,
  ogTitle,
  ogDescription,
  ogType: 'website',
  ogUrl: homeUrl,
  ogSiteName: 'The Pocket Shoes',
  ogLocale: 'vi_VN',
  ogImage,
  ogImageAlt: 'The Pocket Shoes',
  ogImageWidth: '1000',
  ogImageHeight: '1000',
  twitterCard: 'summary_large_image',
  twitterTitle: ogTitle,
  twitterDescription: ogDescription,
  twitterImage: ogImage,
  twitterImageAlt: 'The Pocket Shoes',
})
</script>
