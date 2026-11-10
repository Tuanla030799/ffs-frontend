<template>
  <CrudShell
    v-model:status="query.status"
    title="Feedback khách hàng"
    description="Ảnh feedback của khách (ảnh chụp tin nhắn, ảnh khách mang giày) hiển thị ở mục “Khách hàng của The Pocket Shoes nói gì” trên trang chủ, sắp xếp theo thứ tự tăng dần."
    create-label="Thêm ảnh feedback"
    :searchable="false"
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Thêm ảnh feedback' : 'Cập nhật ảnh feedback'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa ảnh feedback${deleting?.customerName ? ` của ${deleting.customerName}` : ''}?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-4" @submit.prevent="save">
        <div class="space-y-3 md:col-span-4">
          <FileUpload
            v-model="uploaded"
            scope="admin"
            accept="image/*"
            title="Ảnh feedback (bắt buộc)"
            description="Ảnh chụp tin nhắn, đánh giá hoặc ảnh khách mang giày. Ảnh dọc hoặc vuông đều được."
            @uploaded="assignImage"
          />
          <div
            v-if="form.fileId && previewUrl && !uploaded"
            class="flex items-center gap-3 rounded-xl border border-slate-200 p-3"
          >
            <ImagePreview class="w-20" :src="resolveFileUrl(previewUrl)" title="Ảnh feedback" />
            <span class="flex-1 text-sm text-slate-600">
              Ảnh hiện tại (chọn file mới để thay)
            </span>
          </div>
          <p v-if="imageError" class="text-xs font-semibold text-red-600">{{ imageError }}</p>
        </div>
        <UiInput
          v-model="form.customerName"
          class="md:col-span-2"
          label="Tên khách (tuỳ chọn)"
          placeholder="VD: Chị Lan, Hà Nội"
          :maxlength="120"
        />
        <UiSelect v-model="form.status" label="Trạng thái">
          <option value="ACTIVE">ACTIVE</option>
          <option value="INACTIVE">INACTIVE</option>
        </UiSelect>
        <UiInput v-model.number="form.sortOrder" type="number" label="Thứ tự" />
        <UiTextarea
          v-model="form.description"
          class="md:col-span-4"
          label="Mô tả (tuỳ chọn)"
          placeholder="Lời nhận xét của khách, hiển thị dưới ảnh. Thường để trống."
          :rows="3"
          :maxlength="1000"
        />
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
      empty-text="Chưa có ảnh feedback."
    >
      <template #cell-preview="{ row }">
        <ImagePreview
          v-if="row.imageUrl"
          class="w-16"
          :src="resolveFileUrl(row.imageUrl)"
          :title="row.customerName || 'Ảnh feedback'"
        />
        <span v-else>-</span>
      </template>
      <template #cell-content="{ row }">
        <span class="font-black text-slate-950">{{ row.customerName || 'Không tên' }}</span>
        <div v-if="row.description" class="line-clamp-2 text-xs font-normal text-slate-500">
          {{ row.description }}
        </div>
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
import FileUpload from '@/components/common/FileUpload.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'
import {
  UiAlert,
  UiButton,
  UiDropdown,
  UiForm,
  UiInput,
  UiPagination,
  UiSelect,
  UiTable,
  UiTextarea,
} from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { useToast } from '@/composables/useToast'
import { resolveFileUrl } from '@/lib/fileUrl'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { customerFeedbackApi } from '@/modules/content/feedback/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { CustomerFeedback } from '@/modules/content/feedback/types'
import type { UploadedFile } from '@/services/file.service'

const toast = useToast()
const pageQuery = usePageQuery()
const rows = ref<CustomerFeedback[]>([])
const loading = ref(false)
const saving = ref(false)
const error = ref('')
const formError = ref('')
const imageError = ref('')
const editing = ref<CustomerFeedback | 'new' | null>(null)
const deleting = ref<CustomerFeedback | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const previewUrl = ref('')
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive({
  fileId: '',
  customerName: '',
  description: '',
  sortOrder: 0,
  status: 'ACTIVE',
})
const columns = [
  { key: 'preview', label: 'Ảnh', cellAlign: 'center', width: '110px' },
  { key: 'content', label: 'Khách / mô tả', cellAlign: 'left' },
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

function fill(row?: CustomerFeedback) {
  Object.assign(form, {
    fileId: row?.fileId || '',
    customerName: row?.customerName || '',
    description: row?.description || '',
    sortOrder: row?.sortOrder ?? nextSortOrder(),
    status: row?.status || 'ACTIVE',
  })
  // Ảnh đang lưu; reset ô upload để không còn hiện ảnh vừa chọn ở lần mở trước.
  previewUrl.value = row?.imageUrl || ''
  uploaded.value = null
  formError.value = ''
  imageError.value = ''
}

// Ảnh mới mặc định nằm cuối danh sách đang xem.
function nextSortOrder() {
  return rows.value.reduce((max, row) => Math.max(max, row.sortOrder), 0) + 10
}

function assignImage(file: UploadedFile) {
  form.fileId = String(file.fileId)
  previewUrl.value = file.url || file.path || ''
  imageError.value = ''
}

function openCreate() {
  editing.value = 'new'
  fill()
}

function handleRowAction(key: string, row: CustomerFeedback) {
  if (key === 'edit') {
    editing.value = row
    fill(row)
    return
  }
  if (key === 'delete') deleting.value = row
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await customerFeedbackApi.adminList(query)
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
  imageError.value = form.fileId ? '' : 'Vui lòng chọn ảnh feedback.'
  if (imageError.value || saving.value) return

  saving.value = true
  formError.value = ''
  try {
    const payload = {
      fileId: form.fileId,
      customerName: form.customerName.trim() || null,
      description: form.description.trim() || null,
      sortOrder: Number(form.sortOrder) || 0,
      status: form.status,
    }
    if (editing.value === 'new') await customerFeedbackApi.create(payload)
    else if (editing.value) await customerFeedbackApi.update(editing.value.id, payload)
    toast.push('Đã lưu ảnh feedback.', 'success', 'Thành công')
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
    await customerFeedbackApi.remove(deleting.value.id)
    toast.push('Đã xóa ảnh feedback.', 'success', 'Thành công')
    deleting.value = null
    await load()
  } catch (e) {
    deleting.value = null
    error.value = getErrorMessage(e)
  }
}

onMounted(load)
</script>
