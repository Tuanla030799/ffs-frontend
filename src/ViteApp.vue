<template>
  <RouterView />
  <GlobalLoading />
  <UiToast :items="toasts" @remove="remove" />
</template>

<script setup lang="ts">
import { RouterView } from 'vue-router'
import GlobalLoading from '@/components/common/GlobalLoading.vue'
import { UiToast } from '@/components/ui'
import { useToast } from '@/composables/useToast'

const { toasts, remove } = useToast()
</script>
