<template>
  <div class="flex items-center justify-between gap-3">
    <span :class="strong ? 'font-black text-slate-950' : 'text-slate-500'">
      {{ label }}
    </span>
    <span
      :class="[
        strong ? 'text-lg font-black text-rose-600' : 'font-semibold text-slate-900',
        muted ? 'text-emerald-700' : '',
      ]"
    >
      {{ money(value) }}
    </span>
  </div>
</template>

<script setup lang="ts">
import { money } from '@/modules/shared/types'

withDefaults(
  defineProps<{
    label: string
    value?: number
    strong?: boolean
    muted?: boolean
  }>(),
  {
    value: 0,
    strong: false,
    muted: false,
  },
)
</script>
