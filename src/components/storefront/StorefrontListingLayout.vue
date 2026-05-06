<template>
  <section class="grid items-start gap-8" :class="layoutClass" :style="layoutStyle">
    <aside
      v-if="hasSidebar"
      v-show="showSidebar"
      class="hidden min-w-0 lg:sticky lg:block"
      :style="sidebarStyle"
    >
      <slot name="sidebar" />
    </aside>

    <div class="min-w-0">
      <slot />
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'

const props = withDefaults(
  defineProps<{
    showSidebar?: boolean
    sidebarWidth?: string
    stickyOffset?: string
  }>(),
  {
    showSidebar: true,
    sidebarWidth: '260px',
    stickyOffset: 'calc(var(--public-header-height, 65px) + 96px)',
  },
)

const slots = useSlots()

const hasSidebar = computed(() => Boolean(slots.sidebar))

const layoutClass = computed(() => {
  if (!hasSidebar.value || !props.showSidebar) {
    return 'lg:grid-cols-1'
  }

  return 'lg:grid-cols-[var(--storefront-sidebar-width)_minmax(0,1fr)]'
})

const layoutStyle = computed(() => ({
  '--storefront-sidebar-width': props.sidebarWidth,
}))

const sidebarStyle = computed(() => ({
  top: props.stickyOffset,
}))
</script>
