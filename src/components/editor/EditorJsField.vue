<template>
  <div class="rounded-2xl border border-slate-200 bg-white p-3">
    <div class="mb-2 flex items-center justify-between gap-2">
      <span class="text-sm font-bold text-slate-700">Editor.js descriptionJson</span>
      <button type="button" class="rounded-lg border px-3 py-1 text-xs font-bold" @click="insertParagraph">+ Paragraph block</button>
    </div>
    <textarea v-model="jsonText" class="min-h-72 w-full rounded-xl border border-slate-200 p-3 font-mono text-sm" @blur="emitJson" />
    <p v-if="error" class="mt-2 text-sm font-semibold text-red-600">{{ error }}</p>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from 'vue'
const props = defineProps<{ modelValue?: unknown }>()
const emit = defineEmits<{ 'update:modelValue': [value: unknown] }>()
const error = ref('')
const jsonText = ref(JSON.stringify(props.modelValue || { time: Date.now(), blocks: [] }, null, 2))
watch(() => props.modelValue, (next) => { jsonText.value = JSON.stringify(next || { time: Date.now(), blocks: [] }, null, 2) })
function emitJson() { try { emit('update:modelValue', JSON.parse(jsonText.value)); error.value = '' } catch { error.value = 'JSON không hợp lệ. Vui lòng kiểm tra lại descriptionJson.' } }
function insertParagraph() { const data = JSON.parse(jsonText.value || '{"blocks":[]}') as { blocks?: Array<Record<string, unknown>> }; data.blocks = data.blocks || []; data.blocks.push({ type: 'paragraph', data: { text: 'Nội dung mô tả sản phẩm...' } }); jsonText.value = JSON.stringify(data, null, 2); emit('update:modelValue', data) }
</script>
