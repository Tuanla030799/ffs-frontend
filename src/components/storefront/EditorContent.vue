<template>
  <div class="space-y-4 leading-7 text-slate-700">
    <template v-if="blocks.length">
      <div v-for="(block, index) in blocks" :key="index">
        <h2 v-if="block.type === 'header'" class="text-xl font-bold text-slate-950" v-html="block.data.text" />
        <p v-else-if="block.type === 'paragraph'" v-html="block.data.text" />
        <ul v-else-if="block.type === 'list'" class="list-disc pl-5"><li v-for="(item, i) in block.data.items" :key="i" v-html="item" /></ul>
        <img v-else-if="block.type === 'image'" :src="block.data.file?.url || block.data.url" class="rounded-2xl border border-slate-200" alt="product content">
      </div>
    </template>
    <p v-else class="text-slate-500">Chưa có mô tả chi tiết.</p>
  </div>
</template>
<script setup lang="ts">
import { computed } from 'vue'
interface EditorBlockData {
  text?: string
  items?: string[]
  file?: { url?: string }
  url?: string
}
interface EditorBlock { type: string; data: EditorBlockData }
const props = defineProps<{ value?: unknown }>()
const blocks = computed<EditorBlock[]>(() => {
  const raw = typeof props.value === 'string'
    ? JSON.parse(props.value || '{}') as { blocks?: EditorBlock[] }
    : props.value as { blocks?: EditorBlock[] } | null | undefined
  return Array.isArray(raw?.blocks) ? raw.blocks : []
})
</script>
