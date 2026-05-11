<template>
  <NuxtLayout>
    <NuxtPage />
  </NuxtLayout>
  <GlobalLoading />
  <UiToast :items="toasts" @close="remove" />
</template>

<script setup lang="ts">
import GlobalLoading from '@/components/common/GlobalLoading.vue'
import { UiToast } from '@/components/ui'
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>
