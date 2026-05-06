<template>
  <header :class="classes">
    <div class="public-page-header__inner">
      <div class="min-w-0">
        <BreadcrumbNav v-if="breadcrumbItems?.length" class="mb-2" :items="breadcrumbItems" />

        <h1 class="truncate leading-tight font-black">
          {{ title }}
        </h1>

        <p v-if="subtitle" class="mt-1 text-sm font-semibold text-black/55">
          {{ subtitle }}
        </p>
      </div>

      <div v-if="$slots.actions" class="public-page-header__actions">
        <slot name="actions" />
      </div>
    </div>

    <slot />
  </header>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import BreadcrumbNav from '@/components/common/BreadcrumbNav.vue'

const props = withDefaults(
  defineProps<{
    title: string
    subtitle?: string
    breadcrumbItems?: Array<{ label: string; to?: string }>
    sticky?: boolean
  }>(),
  {
    subtitle: '',
    breadcrumbItems: () => [],
    sticky: false,
  },
)

const classes = computed(() => [
  'public-page-header',
  '-mx-4 mb-6 border-b border-black/10 bg-white/95 px-4 py-4 backdrop-blur sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8',
  props.sticky && 'sticky top-[var(--public-header-height)] z-30',
])
</script>

<style scoped>
.public-page-header__inner {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24px;
}

.public-page-header__actions {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 767px) {
  .public-page-header__inner {
    align-items: flex-start;
    flex-direction: column;
    gap: 16px;
  }

  .public-page-header__actions {
    width: 100%;
    justify-content: stretch;
  }
}
</style>
