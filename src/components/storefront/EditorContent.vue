<template>
  <SafeHtmlContent :html="normalizeRichTextInput(value)" />
</template>

<script setup lang="ts">
import SafeHtmlContent from '@/components/common/SafeHtmlContent.vue'
import { normalizeRichTextInput } from '@/lib/richText'

defineProps<{ value?: unknown }>()
</script>
