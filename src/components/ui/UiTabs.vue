<template>
  <div class="space-y-4">
    <div class="flex items-end justify-start gap-1 border-b border-[var(--ui-border)]">
      <button
        v-for="item in items"
        :key="item.key"
        type="button"
        class="-mb-px w-auto rounded-t-[var(--ui-radius-md)] border border-transparent border-b-[var(--ui-border)] px-4 py-2.5 text-sm font-medium transition"
        :class="
          item.key === modelValue
            ? 'border-[var(--ui-border)] bg-[var(--ui-surface)] text-[var(--ui-primary)]'
            : 'text-[var(--ui-text-muted)] hover:bg-[var(--ui-surface-soft)] hover:text-[var(--ui-text)]'
        "
        @click="$emit('update:modelValue', item.key)"
      >
        {{ item.label }}
      </button>
    </div>
    <slot />
  </div>
</template>

<script setup lang="ts">
defineProps<{
  modelValue: string
  items: Array<{ key: string; label: string }>
}>()

defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>
