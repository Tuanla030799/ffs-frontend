<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Câu hỏi thường gặp"
    description="Các câu hỏi hiển thị ở trang /faq, sắp xếp theo thứ tự tăng dần."
    create-label="Thêm câu hỏi"
    search-placeholder="Tìm theo câu hỏi..."
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Thêm câu hỏi' : 'Cập nhật câu hỏi'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa câu hỏi “${deleting?.question || ''}”?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-4" @submit.prevent="save">
        <UiInput
          v-model="form.question"
          class="md:col-span-2"
          required
          label="Câu hỏi"
          placeholder="Ví dụ: Bao lâu thì tôi nhận được hàng?"
          :maxlength="300"
        />
        <UiSelect v-model="form.status" label="Trạng thái">
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </UiSelect>
        <UiInput v-model.number="form.sortOrder" type="number" label="Thứ tự" />
        <div class="md:col-span-4">
          <RichTextEditorField
            v-model="form.answerHtml"
            title="Câu trả lời"
            placeholder="Viết câu trả lời..."
            :min-height="280"
            :error="answerError"
          />
        </div>
        <UiAlert v-if="formError" variant="error" class="md:col-span-4">{{ formError }}</UiAlert>
        <div class="flex justify-end gap-2 md:col-span-4">
          <UiButton native-type="button" variant="secondary" @click="editing = null">
            Hủy
          </UiButton>
          <UiButton native-type="submit" variant="dark" :loading="saving">Lưu</UiButton>
        </div>
      </UiForm>
    </template>

    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      density="sm"
      sticky-header
      striped
      row-key="id"
      min-width="min-w-[760px]"
      empty-text="Chưa có câu hỏi."
    >
      <template #cell-question="{ row }">
        <span class="font-black text-slate-950">{{ row.question }}</span>
      </template>
      <template #cell-status="{ row }">
        <span :class="badgeClass(row.status)">{{ row.status }}</span>
      </template>
      <template #cell-actions="{ row }">
        <UiDropdown
          :items="actionItems"
          placement="right"
          @select="(key) => handleRowAction(key, row)"
        >
          <template #trigger>
            <UiButton variant="ghost">Thao tác</UiButton>
          </template>
        </UiDropdown>
      </template>
    </UiTable>

    <UiPagination
      v-if="total > 0"
      :page="page"
      :total="total"
      :total-pages="totalPages"
      :page-size="Number(query.limit || 50)"
      @update:page="changePage"
    />
  </CrudShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'
import {
  UiAlert,
  UiButton,
  UiDropdown,
  UiForm,
  UiInput,
  UiPagination,
  UiSelect,
  UiTable,
} from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { useToast } from '@/composables/useToast'
import { htmlToPlainText } from '@/lib/seo'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { faqApi } from '@/modules/content/faq/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import type { Faq, FaqPayload } from '@/modules/content/faq/types'

const toast = useToast()
const pageQuery = usePageQuery()
const rows = ref<Faq[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const answerError = ref('')
const editing = ref<Faq | 'new' | null>(null)
const deleting = ref<Faq | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<FaqPayload>({ question: '', answerHtml: '', sortOrder: 0, status: 'ACTIVE' })
const columns = [
  { key: 'question', label: 'Câu hỏi', cellAlign: 'left' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'sortOrder', label: 'Thứ tự', cellAlign: 'center', width: '100px' },
  { key: 'actions', label: 'Hành động', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [
  { key: 'edit', label: 'Sửa' },
  { key: 'delete', label: 'Xóa' },
]

function badgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
    : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}

function fill(row?: Faq) {
  Object.assign(form, {
    question: row?.question || '',
    answerHtml: row?.answerHtml || '',
    sortOrder: row?.sortOrder ?? nextSortOrder(),
    status: row?.status || 'ACTIVE',
  })
  formError.value = ''
  answerError.value = ''
}

// Câu hỏi mới mặc định nằm cuối danh sách đang xem.
function nextSortOrder() {
  return rows.value.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 10
}

function openCreate() {
  editing.value = 'new'
  fill()
}

async function openEdit(id: string) {
  try {
    const row = await faqApi.adminDetail(id)
    editing.value = row
    fill(row)
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}

function handleRowAction(key: string, row: Faq) {
  if (key === 'edit') {
    void openEdit(row.id)
    return
  }
  if (key === 'delete') deleting.value = row
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await faqApi.adminList(query)
    rows.value = data.items
    total.value = data.total
    totalPages.value = data.totalPages
    query.page = data.page || query.page
    query.limit = data.limit || query.limit
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  void pageQuery.replace(query.page)
  void load()
}

function changePage(nextPage: number) {
  if (loading.value || nextPage === page.value) return
  query.page = nextPage
  void pageQuery.replace(query.page)
  void load()
}

async function save() {
  const answerHtml = sanitizeHtml(form.answerHtml || '')
  formError.value = required(form.question.trim(), 'Câu hỏi') || ''
  const hasAnswer = Boolean(htmlToPlainText(answerHtml)) || /<img\b/i.test(answerHtml)
  answerError.value = hasAnswer ? '' : 'Vui lòng nhập câu trả lời.'
  if (formError.value || answerError.value || saving.value) return

  saving.value = true
  try {
    const payload = {
      ...form,
      question: form.question.trim(),
      answerHtml,
      sortOrder: Number(form.sortOrder) || 0,
    }
    if (editing.value === 'new') await faqApi.create(payload)
    else if (editing.value) await faqApi.update(editing.value.id, payload)
    toast.push('Đã lưu câu hỏi.', 'success', 'Thành công')
    editing.value = null
    await load()
  } catch (e) {
    formError.value = getErrorMessage(e)
  } finally {
    saving.value = false
  }
}

async function confirmRemove() {
  if (!deleting.value) return
  try {
    await faqApi.remove(deleting.value.id)
    toast.push('Đã xóa câu hỏi.', 'success', 'Thành công')
    deleting.value = null
    await load()
  } catch (e) {
    deleting.value = null
    error.value = getErrorMessage(e)
  }
}

onMounted(load)
</script>
