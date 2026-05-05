<template>
  <component :is="as" v-bind="forwardedAttrs" :class="classes">
    <slot />
  </component>
</template>

<script setup lang="ts">
import { computed, useAttrs } from 'vue'
import { cn } from '@/utils/cn'

defineOptions({
  inheritAttrs: false,
})

const props = withDefaults(
  defineProps<{
    as?: 'div' | 'form'
    layout?: 'vertical' | 'inline'
  }>(),
  {
    as: 'div',
    layout: 'vertical',
  },
)

const attrs = useAttrs()
const forwardedAttrs = computed(() => {
  const rest = { ...attrs }
  delete rest.class
  return rest
})
const classes = computed(() =>
  cn(
    props.layout === 'inline' ? 'flex flex-wrap items-end gap-3' : 'space-y-4',
    attrs.class as string | undefined,
  ),
)
</script>
