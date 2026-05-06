<template>
  <div class="safe-html-content max-w-none" v-html="safeHtml" />
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { sanitizeHtml } from '@/lib/sanitizeHtml'

const props = defineProps<{ html?: string }>()
const safeHtml = computed(() => sanitizeHtml(props.html))
</script>

<style scoped>
.safe-html-content :deep(*) {
  max-width: 100%;
}

.safe-html-content :deep(p),
.safe-html-content :deep(li) {
  line-height: 1.8;
}

.safe-html-content :deep(h1),
.safe-html-content :deep(h2),
.safe-html-content :deep(h3),
.safe-html-content :deep(h4) {
  margin: 1.5em 0 0.6em;
  font-weight: 900;
  line-height: 1.2;
  color: #020617;
}

.safe-html-content :deep(h1) {
  font-size: 2rem;
}

.safe-html-content :deep(h2) {
  font-size: 1.5rem;
}

.safe-html-content :deep(h3) {
  font-size: 1.25rem;
}

.safe-html-content :deep(ul),
.safe-html-content :deep(ol) {
  margin: 1em 0;
  padding-left: 1.5rem;
}

.safe-html-content :deep(ul) {
  list-style: disc;
}

.safe-html-content :deep(ol) {
  list-style: decimal;
}

.safe-html-content :deep(blockquote) {
  margin: 1.5rem 0;
  border-left: 4px solid #020617;
  padding-left: 1rem;
  font-size: 1.125rem;
  font-weight: 700;
}

.safe-html-content :deep(a) {
  color: var(--ui-primary);
  text-decoration: underline;
}

.safe-html-content :deep(img) {
  margin: 1rem 0;
  border-radius: 1rem;
}

.safe-html-content :deep(table) {
  width: 100%;
  border-collapse: collapse;
  margin: 1rem 0;
}

.safe-html-content :deep(th),
.safe-html-content :deep(td) {
  border: 1px solid var(--ui-border);
  padding: 0.75rem;
  text-align: left;
}

.safe-html-content :deep(pre) {
  overflow: auto;
  border-radius: 0.75rem;
  background: #0f172a;
  padding: 1rem;
  color: white;
}
</style>
