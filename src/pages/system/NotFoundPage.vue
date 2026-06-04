<template>
  <section class="ui-page flex min-h-screen items-center justify-center px-4 py-10">
    <div class="w-full max-w-lg">
      <UiCard padding="lg">
        <div class="text-center">
          <div
            class="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-[var(--ui-primary-soft)] text-2xl font-bold text-[var(--ui-primary)]"
          >
            404
          </div>
          <h1 class="mt-5 text-2xl font-bold text-[var(--ui-text)]">Trang không tồn tại</h1>
          <div class="mt-6 flex items-center justify-center gap-3">
            <RouterLink to="/" class="block no-underline">
              <UiButton block> Về trang chủ </UiButton>
            </RouterLink>
          </div>
        </div>
      </UiCard>
    </div>
  </section>
</template>

<script setup lang="ts">
import { RouterLink } from 'vue-router'
import { UiButton, UiCard } from '@/components/ui'
</script>
