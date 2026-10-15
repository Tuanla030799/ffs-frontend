<template>
  <NotFoundPage />
</template>

<script setup lang="ts">
import { setResponseStatus, useRequestEvent } from '#imports'
import NotFoundPage from '@/pages/system/NotFoundPage.vue'

definePageMeta({ layout: 'public', name: 'not-found' })

if (import.meta.server) {
  const event = useRequestEvent()
  if (event) setResponseStatus(event, 404)
}

useSeoMeta({ title: 'Không tìm thấy trang - The Pocket Shoes', robots: 'noindex, nofollow' })
</script>
