<template>
  <div>
    <UiSkeleton v-if="pending && !page" :rows="4" />
    <p v-else-if="errorMessage" class="text-sm font-semibold text-red-600" role="alert">
      {{ errorMessage }}
    </p>
    <SafeHtmlContent v-else-if="page?.contentHtml" :html="page.contentHtml" />
    <p v-else class="text-sm text-black/60">Nội dung đang được cập nhật.</p>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useAsyncData } from '#imports'
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import { UiSkeleton } from '@/components/ui'
import { sitePageApi } from '@/modules/content/page/api'
import { getErrorMessage } from '@/modules/shared/hooks'

// Nội dung dùng chung cho mọi sản phẩm, admin soạn ở "Site pages". Tab chỉ mount khi khách mở,
// nên dữ liệu tải lúc đó; key cố định để mở lại tab hoặc sang sản phẩm khác không tải lại.
const {
  data: page,
  pending,
  error,
} = useAsyncData('site-page:purchase-shipping', () => sitePageApi.detail('purchase-shipping'), {
  lazy: true,
  deep: false,
})
const errorMessage = computed(() => (error.value ? getErrorMessage(error.value) : ''))
</script>
