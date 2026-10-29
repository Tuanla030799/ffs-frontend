<template>
  <div>
    <section class="border-b border-black/10 bg-[#f4f4f1]">
      <div class="mx-auto max-w-7xl px-4 py-16 sm:px-6 md:py-24 lg:px-8">
        <BreadcrumbNav :items="[{ label: DEFAULT_TITLE }]" />
        <p class="mt-10 text-xs font-black tracking-[0.2em] uppercase md:text-sm">
          About The Pocket Shoes · Since {{ FOUNDING_YEAR }}
        </p>
        <h1
          class="mt-5 max-w-4xl text-4xl leading-[0.96] font-black tracking-tight sm:text-5xl lg:text-7xl"
        >
          {{ title }}
        </h1>
        <p
          v-if="page?.summary"
          class="mt-6 max-w-2xl text-base leading-7 font-medium text-black/70 md:text-lg md:leading-8"
        >
          {{ page.summary }}
        </p>
      </div>
    </section>

    <section class="mx-auto max-w-7xl px-4 py-14 sm:px-6 md:py-20 lg:px-8">
      <div class="max-w-3xl">
        <UiSkeleton v-if="loading" :rows="6" />
        <div
          v-else-if="errorMessage"
          class="border border-red-200 bg-red-50 p-6 text-red-700"
          role="alert"
        >
          <p class="font-semibold">{{ errorMessage }}</p>
          <UiButton class="mt-4" variant="secondary" size="sm" @click="refresh()">
            Tải lại
          </UiButton>
        </div>
        <SafeHtmlContent v-else-if="page?.contentHtml" :html="page.contentHtml" />
        <p v-else class="text-black/60">Nội dung đang được cập nhật.</p>
      </div>
    </section>

    <section
      id="lien-he"
      class="mx-auto max-w-7xl scroll-mt-24 px-4 pb-14 sm:px-6 md:pb-20 lg:px-8"
    >
      <div
        class="flex flex-col gap-4 border-y border-black/10 py-8 md:flex-row md:items-center md:justify-between"
      >
        <h2 class="text-xl font-black tracking-tight">Liên hệ & theo dõi The Pocket Shoes</h2>
        <div class="flex flex-wrap gap-3">
          <a
            v-for="link in SOCIAL_LINKS"
            :key="link.url"
            :href="link.url"
            target="_blank"
            rel="noopener noreferrer"
            class="inline-flex border border-black px-5 py-3 text-xs font-black tracking-wide text-black uppercase no-underline transition hover:bg-black hover:text-white"
          >
            {{ link.label }}
          </a>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useHead, useRuntimeConfig, useSeoMeta } from '#imports'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import { UiButton, UiSkeleton } from '@/components/ui'
import { FOUNDING_YEAR, SOCIAL_LINKS } from '@/config/brand'
import {
  SITE_NAME,
  breadcrumbJsonLd,
  defaultOgImage,
  htmlToPlainText,
  jsonLdScript,
  metaDescription,
  publicSiteUrl,
} from '@/lib/seo'
import { sitePageApi } from '@/modules/content/page/api'
import { getErrorMessage } from '@/modules/shared/hooks'

// Breadcrumb giữ tên cố định: tiêu đề admin đặt có thể là khẩu hiệu.
const DEFAULT_TITLE = 'Về chúng tôi'

// Nội dung trang do admin soạn ở "Site pages" (khoá `about`); khung hero và khối liên hệ cố định.
const {
  data: page,
  pending,
  error,
  refresh,
} = await useAsyncData('site-page:about', () => sitePageApi.detail('about'), { deep: false })

const loading = computed(() => pending.value && !page.value)
const errorMessage = computed(() => (error.value ? getErrorMessage(error.value) : ''))
const title = computed(() => page.value?.title || DEFAULT_TITLE)

const siteUrl = publicSiteUrl(String(useRuntimeConfig().public.siteUrl || ''))
const aboutUrl = `${siteUrl}/about`
const ogImage = defaultOgImage(siteUrl)
const seoTitle = computed(() => `${title.value} - ${SITE_NAME}`)
const seoDescription = computed(() =>
  metaDescription(
    page.value?.summary,
    htmlToPlainText(page.value?.contentHtml),
    'Câu chuyện và sứ mệnh của The Pocket Shoes, cửa hàng giày tuyển chọn cho nam và nữ.',
  ),
)

useHead({
  link: [{ rel: 'canonical', href: aboutUrl }],
  script: () => [
    jsonLdScript({
      '@context': 'https://schema.org',
      '@type': 'AboutPage',
      name: seoTitle.value,
      description: seoDescription.value,
      url: aboutUrl,
      inLanguage: 'vi-VN',
      mainEntity: {
        '@type': 'Organization',
        name: SITE_NAME,
        url: `${siteUrl}/`,
        logo: `${siteUrl}/logo.svg`,
        slogan: "Shoes you didn't know you need.",
        foundingDate: String(FOUNDING_YEAR),
        sameAs: SOCIAL_LINKS.map((link) => link.url),
      },
    }),
    jsonLdScript(breadcrumbJsonLd(siteUrl, [{ name: DEFAULT_TITLE, path: '/about' }])),
  ],
})

useSeoMeta({
  title: () => seoTitle.value,
  description: () => seoDescription.value,
  ogTitle: () => seoTitle.value,
  ogDescription: () => seoDescription.value,
  ogType: 'website',
  ogUrl: aboutUrl,
  ogSiteName: SITE_NAME,
  ogLocale: 'vi_VN',
  ogImage,
  twitterCard: 'summary_large_image',
  twitterTitle: () => seoTitle.value,
  twitterDescription: () => seoDescription.value,
  twitterImage: ogImage,
})
</script>
