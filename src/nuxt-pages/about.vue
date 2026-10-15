<template>
  <AboutPage />
</template>

<script setup lang="ts">
import { useHead, useRuntimeConfig } from '#imports'
import AboutPage from '@/pages/public/AboutPage.vue'
import { defaultOgImage, publicSiteUrl } from '@/lib/seo'

definePageMeta({ layout: 'public', name: 'about' })

const runtimeConfig = useRuntimeConfig()
const siteUrl = publicSiteUrl(String(runtimeConfig.public.siteUrl || ''))
const aboutUrl = `${siteUrl}/about`
const title = 'Về chúng tôi - The Pocket Shoes'
const description =
  'Câu chuyện, sứ mệnh và lộ trình Pocket AI Stylist của The Pocket Shoes: tìm giày phù hợp từ ảnh, tính cách và phong cách của bạn.'
const ogImage = defaultOgImage(siteUrl)

useHead({
  link: [{ rel: 'canonical', href: aboutUrl }],
  script: [
    {
      type: 'application/ld+json',
      innerHTML: JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'AboutPage',
        name: title,
        description,
        url: aboutUrl,
        inLanguage: 'vi-VN',
        mainEntity: {
          '@type': 'Organization',
          name: 'The Pocket Shoes',
          url: `${siteUrl}/`,
          logo: `${siteUrl}/logo.svg`,
          slogan: "Shoes you didn't know you need.",
        },
      }),
    },
  ],
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: aboutUrl,
  ogSiteName: 'The Pocket Shoes',
  ogLocale: 'vi_VN',
  ogImage,
  twitterCard: 'summary_large_image',
  twitterTitle: title,
  twitterDescription: description,
  twitterImage: ogImage,
})
</script>
