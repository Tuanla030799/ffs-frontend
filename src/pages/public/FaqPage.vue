<template>
  <section class="mx-auto max-w-[1440px] px-4 pb-12 sm:px-6 md:pb-16 lg:px-8">
    <PublicPageHeader
      title="Câu hỏi thường gặp"
      subtitle="Giải đáp nhanh về đặt hàng, thanh toán, vận chuyển và chọn size."
      :breadcrumb-items="[{ label: 'Câu hỏi thường gặp' }]"
      class="pt-6 md:pt-8"
    />

    <div class="max-w-3xl">
      <div v-if="loading" class="space-y-4">
        <UiSkeleton v-for="i in 5" :key="i" :rows="2" />
      </div>

      <div
        v-else-if="errorMessage"
        class="border border-red-200 bg-red-50 p-6 text-red-700"
        role="alert"
      >
        <p class="font-semibold">{{ errorMessage }}</p>
        <UiButton class="mt-4" variant="secondary" size="sm" @click="refresh()">Tải lại</UiButton>
      </div>

      <div v-else-if="faqs.length" class="border-t border-black/10">
        <UiAccordion
          v-for="(faq, index) in faqs"
          :key="faq.id"
          :title="faq.question"
          :default-open="index === 0"
        >
          <SafeHtmlContent :html="faq.answerHtml" />
        </UiAccordion>
      </div>

      <div
        v-else
        class="border border-dashed border-black/20 bg-[#f7f7f5] p-10 text-center text-sm font-semibold text-black/60"
      >
        Chưa có câu hỏi nào.
      </div>

      <p class="mt-10 text-sm text-black/60">
        Chưa tìm thấy câu trả lời?
        <NuxtLink to="/about#lien-he" class="font-bold text-black underline underline-offset-4">
          Liên hệ với chúng tôi
        </NuxtLink>
      </p>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData, useHead, useNuxtApp, useRuntimeConfig, useSeoMeta } from '#imports'
import { NuxtLink } from '#components'
import PublicPageHeader from '@/components/common/PublicPageHeader.vue'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import { UiAccordion, UiButton, UiSkeleton } from '@/components/ui'
import {
  SITE_NAME,
  breadcrumbJsonLd,
  htmlToPlainText,
  jsonLdScript,
  publicSiteUrl,
} from '@/lib/seo'
import { faqApi } from '@/modules/content/faq/api'
import { getErrorMessage } from '@/modules/shared/hooks'

// BE giới hạn limit tối đa 100.
const PAGE_SIZE = 100

const nuxtApp = useNuxtApp()
const { data, pending, error, refresh } = await useAsyncData(
  'faq-list',
  async () => {
    const first = await faqApi.list({ page: 1, limit: PAGE_SIZE })
    const restPages = Array.from({ length: Math.max(first.totalPages - 1, 0) }, (_, i) => i + 2)
    // Sau `await` đã mất Nuxt context, nên gọi các trang sau trong runWithContext để interceptor
    // Axios vẫn đọc được runtime config và origin của request khi SSR.
    const rest = await Promise.all(
      restPages.map((page) =>
        nuxtApp.runWithContext(() => faqApi.list({ page, limit: PAGE_SIZE })),
      ),
    )
    return [first, ...rest].flatMap((result) => result.items)
  },
  { deep: false },
)

const faqs = computed(() => data.value ?? [])
const loading = computed(() => pending.value && !data.value)
const errorMessage = computed(() => (error.value ? getErrorMessage(error.value) : ''))

const siteUrl = publicSiteUrl(String(useRuntimeConfig().public.siteUrl || ''))
const faqUrl = `${siteUrl}/faq`
const title = `Câu hỏi thường gặp - ${SITE_NAME}`
const description =
  'Giải đáp các câu hỏi thường gặp về đặt hàng, thanh toán, vận chuyển và chọn size tại The Pocket Shoes.'

useHead({
  link: [{ rel: 'canonical', href: faqUrl }],
  script: () => [
    ...(faqs.value.length
      ? [
          jsonLdScript({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            url: faqUrl,
            inLanguage: 'vi-VN',
            mainEntity: faqs.value.map((faq) => ({
              '@type': 'Question',
              name: faq.question,
              acceptedAnswer: { '@type': 'Answer', text: htmlToPlainText(faq.answerHtml) },
            })),
          }),
        ]
      : []),
    jsonLdScript(breadcrumbJsonLd(siteUrl, [{ name: 'Câu hỏi thường gặp', path: '/faq' }])),
  ],
})

useSeoMeta({
  title,
  description,
  ogTitle: title,
  ogDescription: description,
  ogType: 'website',
  ogUrl: faqUrl,
  twitterTitle: title,
  twitterDescription: description,
})
</script>
