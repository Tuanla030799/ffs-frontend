<template>
  <button :type="nativeType" :disabled="disabled || loading" :class="classes" v-bind="$attrs">
    <span
      v-if="loading"
      class="h-4 w-4 animate-spin rounded-full border-2 border-current border-r-transparent"
    />
    <span
      v-if="$slots.icon && !loading"
      class="relative z-10 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-[-10deg]"
    >
      <slot name="icon" />
    </span>
    <span class="relative z-10">
      <slot />
    </span>
  </button>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { cn } from '@/utils/cn'

defineOptions({ inheritAttrs: false })

const props = withDefaults(
  defineProps<{
    variant?: 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost' | 'dark'
    size?: 'sm' | 'md' | 'lg'
    block?: boolean
    square?: boolean
    loading?: boolean
    disabled?: boolean
    nativeType?: 'button' | 'submit' | 'reset'
  }>(),
  {
    variant: 'primary',
    size: 'md',
    block: false,
    square: false,
    loading: false,
    disabled: false,
    nativeType: 'button',
  },
)

const classes = computed(() => {
  const variants = {
    primary: 'bg-[var(--ui-primary)] text-white hover:bg-[var(--ui-primary-hover)]',
    secondary:
      'border border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-text)] hover:bg-[var(--ui-surface-muted)]',
    outline:
      'border border-[var(--ui-border-strong)] bg-transparent text-[var(--ui-text)] hover:bg-[var(--ui-surface-soft)]',
    danger:
      'border border-red-200 bg-[var(--ui-danger-soft)] text-[var(--ui-danger)] hover:brightness-95',
    ghost: 'bg-transparent text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-soft)]',
    dark: 'bg-gradient-to-br from-[#18181B] to-[#27272A] text-white hover:from-[#27272A] hover:to-[#3F3F46]',
  }

  const sizes = {
    sm: props.square
      ? 'h-9 w-9 rounded-[var(--ui-radius-sm)] p-1 text-sm'
      : 'min-h-9 rounded-[var(--ui-radius-sm)] px-3 py-2 text-sm',
    md: props.square
      ? 'h-11 w-11 rounded-[var(--ui-radius-md)] p-1 text-sm'
      : 'min-h-11 rounded-[var(--ui-radius-md)] px-4 py-3 text-sm',
    lg: props.square
      ? 'h-12 w-12 rounded-[var(--ui-radius-md)] p-1 text-base'
      : 'min-h-12 rounded-[var(--ui-radius-md)] px-5 py-3.5 text-base',
  }

  return cn(
    'group inline-flex items-center justify-center gap-2 font-semibold transition focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-[var(--ui-primary-ring)] disabled:cursor-not-allowed disabled:opacity-50',
    variants[props.variant],
    sizes[props.size],
    'relative overflow-hidden shadow-[0_3px_10px_rgba(0,0,0,0.1)] before:absolute before:inset-y-0 before:-left-full before:w-full before:bg-gradient-to-r before:from-transparent before:via-white/10 before:to-transparent before:transition-all before:duration-500 hover:-translate-y-0.5 hover:shadow-[0_5px_15px_rgba(0,0,0,0.15)] hover:before:left-full',
    props.block && 'w-full',
  )
})
</script>
