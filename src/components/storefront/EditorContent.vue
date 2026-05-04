<template>
  <div class="space-y-4 leading-7 text-slate-700">
    <template v-if="blocks.length">
      <div v-for="(block, index) in blocks" :key="index">
        <component
          :is="headerTag(block.data.level)"
          v-if="block.type === 'header'"
          :class="headerClass(block.data.level)"
        >
          {{ cleanText(block.data.text) }}
        </component>
        <p v-else-if="block.type === 'paragraph'">
          {{ cleanText(block.data.text) }}
        </p>
        <ul
          v-else-if="block.type === 'list' && block.data.style !== 'ordered'"
          class="list-disc pl-5"
        >
          <li
            v-for="(item, i) in block.data.items"
            :key="i"
          >
            {{ cleanText(item) }}
          </li>
        </ul>
        <ol
          v-else-if="block.type === 'list'"
          class="list-decimal pl-5"
        >
          <li
            v-for="(item, i) in block.data.items"
            :key="i"
          >
            {{ cleanText(item) }}
          </li>
        </ol>
        <blockquote
          v-else-if="block.type === 'quote'"
          class="border-l-4 border-slate-950 pl-5 text-xl font-semibold text-slate-950"
        >
          {{ cleanText(block.data.text) }}
          <cite
            v-if="block.data.caption"
            class="mt-2 block text-sm font-normal text-slate-500"
          >
            {{ cleanText(block.data.caption) }}
          </cite>
        </blockquote>
        <hr
          v-else-if="block.type === 'delimiter'"
          class="my-8 border-slate-200"
        >
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
  caption?: string
  items?: string[]
  style?: string
  level?: number
  file?: { url?: string }
  url?: string
}
interface EditorBlock { type: string; data: EditorBlockData }
const props = defineProps<{ value?: unknown }>()
const blocks = computed<EditorBlock[]>(() => {
  let raw: { blocks?: EditorBlock[] } | null | undefined
  try {
    raw = typeof props.value === 'string'
      ? JSON.parse(props.value || '{}') as { blocks?: EditorBlock[] }
      : props.value as { blocks?: EditorBlock[] } | null | undefined
  } catch {
    raw = null
  }
  return Array.isArray(raw?.blocks) ? raw.blocks : []
})

function cleanText(value?: string) {
  if (!value) return ''
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim()
}

function headerTag(level?: number) {
  return level === 1 ? 'h1' : level === 3 ? 'h3' : 'h2'
}

function headerClass(level?: number) {
  if (level === 1) return 'text-3xl font-black text-slate-950'
  if (level === 3) return 'text-lg font-bold text-slate-950'
  return 'text-2xl font-black text-slate-950'
}
</script>
