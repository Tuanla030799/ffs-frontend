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
const title = 'The Pocket Shoes - Giay sneaker va thoi trang'
const description =
  'The Pocket Shoes mang den cac mau giay sneaker, bo suu tap va bai viet thoi trang moi.'
const ogTitle = 'The Pocket Shoes'
const ogDescription = 'Kham pha giay sneaker, bo suu tap noi bat va cam hung phoi do moi.'
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
