<template>
  <component :is="as" :class="cardClass" v-bind="$attrs">
    <slot name="media" />
    <div v-if="$slots.default" :class="bodyClass">
      <slot />
    </div>
  </component>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    as?: string
    hover?: boolean
    bordered?: boolean
    padding?: 'none' | 'sm' | 'md' | 'lg'
    bodyClass?: string
  }>(),
  {
    as: 'article',
    hover: true,
    bordered: true,
    padding: 'md',
    bodyClass: '',
  },
)

const cardClass = computed(() =>
  cn(
    'group relative block cursor-pointer overflow-hidden rounded-[15px] bg-white text-black no-underline shadow-[0_5px_20px_rgba(0,0,0,0.1)] transition duration-300',
    props.bordered && 'border border-black/5',
    props.hover && 'hover:-translate-y-[5px] hover:shadow-[0_10px_25px_rgba(0,0,0,0.15)]',
  ),
)

const bodyClass = computed(() => {
  const paddings = {
    none: '',
    sm: 'p-3',
    md: 'p-4',
    lg: 'p-5 md:p-6',
  }

  return cn(paddings[props.padding], props.bodyClass)
})
</script>
