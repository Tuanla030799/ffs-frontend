<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý brands"
    description="Thương hiệu sản phẩm"
    :loading="loading"
    :error="error || masterError"
    :status-options="commonStatusValues"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo brand' : 'Cập nhật brand'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa brand ${deleting?.name || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="space-y-5" @submit.prevent="save">
        <p v-if="notice" class="rounded-xl bg-emerald-50 p-3 text-sm font-bold text-emerald-700">
          {{ notice }}
        </p>
        <div class="grid gap-3 md:grid-cols-3">
          <UiInput v-model="form.name" placeholder="Name *" required label="Tên thương hiệu" />
          <UiInput v-model="form.slug" placeholder="Slug" label="Slug" />
          <UiSelect v-model="form.status" label="Trạng thái">
            <option v-for="status in commonStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </UiSelect>
          <UiInput
            v-model.number="form.sortOrder"
            placeholder="Sort order"
            label="Thứ tự sắp xếp"
          />
          <UiTextarea
            v-model="form.description"
            class="md:col-span-2"
            placeholder="Description"
            label="Mô tả"
          />
          <div class="md:col-span-3">
            <ImageUpload
              v-model="uploaded"
              scope="admin"
              accept="image/*"
              title="Logo thương hiệu"
              :preview-alt="form.name || 'Logo thương hiệu'"
              :preview-title="form.name || 'Logo thương hiệu'"
              @uploaded="(file) => (form.fileId = String(file.fileId))"
              @update:model-value="(file) => !file && (form.fileId = '')"
            />
          </div>

          <div class="md:col-span-3">
            <ImageUpload
              v-model="uploadSizeGuide"
              scope="admin"
              accept="image/*"
              title="Bảng chọn size"
              :preview-alt="form.name ? `Bảng chọn size ${form.name}` : 'Bảng chọn size'"
              :preview-title="form.name ? `Bảng chọn size ${form.name}` : 'Bảng chọn size'"
              @uploaded="(file) => (form.fileSizeId = String(file.fileId))"
              @update:model-value="(file) => !file && (form.fileSizeId = '')"
            />
          </div>
        </div>
        <div class="flex justify-end gap-2">
          <UiButton native-type="button" variant="secondary" @click="editing = null"
            >Cancel</UiButton
          >
          <UiButton native-type="submit">Save</UiButton>
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
      min-width="min-w-[860px]"
      empty-text="Không có brand."
    >
      <template #cell-name="{ row }"
        ><span class="font-black text-slate-950">{{ row.name }}</span></template
      >
      <template #cell-logo="{ row }"
        ><img
          v-if="imageUrl(row)"
          :src="imageUrl(row)"
          class="h-12 w-20 rounded-lg object-cover"
          :alt="row.name"
        /><span v-else>-</span></template
      >
      <template #cell-status="{ row }"
        ><span :class="badgeClass(row.status)">{{ statusLabel(row.status) }}</span></template
      >
      <template #cell-createdAt="{ row }">{{ formatLocalDateTime(row.createdAt) }}</template>
      <template #cell-actions="{ row }"
        ><UiDropdown
          :items="actionItems"
          placement="right"
          @select="(key) => handleRowAction(key, row)"
        >
          <template #trigger>
            <UiButton variant="ghost">Thao tác</UiButton>
          </template>
        </UiDropdown></template
      >
    </UiTable>

    <UiPagination
      v-if="total > 0"
      :page="page"
      :total="total"
      :total-pages="totalPages"
      :page-size="Number(query.limit || 20)"
      @update:page="changePage"
    />
  </CrudShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { usePageQuery } from '@/composables/usePageQuery'
import {
  UiButton,
  UiDropdown,
  UiForm,
  UiInput,
  UiPagination,
  UiSelect,
  UiTable,
  UiTextarea,
} from '@/components/ui'
import { brandApi } from '@/modules/content/brand/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatLocalDateTime } from '@/lib/dateTime'
import { slugify, syncAutoSlug } from '@/lib/slug'
import type { Brand, BrandPayload } from '@/modules/content/brand/types'
import type { UploadedFile } from '@/services/file.service'

const rows = ref<Brand[]>([])
const pageQuery = usePageQuery()
const loading = ref(false)
const error = ref('')
const notice = ref('')
const editing = ref<Brand | 'new' | null>(null)
const deleting = ref<Brand | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const uploadSizeGuide = ref<UploadedFile | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<BrandPayload>({
  name: '',
  slug: '',
  description: '',
  fileId: '',
  status: 'ACTIVE',
  sortOrder: 0,
  fileSizeId: '',
})
const { data: masterData, error: masterError, load: loadMasterData } = useMasterData('admin')
const commonStatuses = computed(
  () =>
    masterData.value?.commonStatuses || [
      { value: 'ACTIVE', label: 'ACTIVE' },
      { value: 'INACTIVE', label: 'INACTIVE' },
    ],
)
const commonStatusValues = computed(() => commonStatuses.value.map((item) => item.value))
const columns = [
  { key: 'name', label: 'Tên thương hiệu', cellAlign: 'left', width: '220px' },
  { key: 'logo', label: 'Logo', cellAlign: 'center', width: '120px' },
  { key: 'sizeGuide', label: 'sizeGuide', cellAlign: 'center', width: '120px' },
  { key: 'slug', label: 'Slug', cellAlign: 'left', width: '180px' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'sortOrder', label: 'Thứ tự sắp xếp', cellAlign: 'center', width: '150px' },
  { key: 'createdAt', label: 'Ngày tạo', cellAlign: 'center', width: '180px' },
  { key: 'actions', label: 'Actions', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

function badgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
    : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}
function statusLabel(status: string) {
  return commonStatuses.value.find((item) => item.value === status)?.label || status
}
function imageUrl(row: Brand) {
  return resolveFileUrl(row.imageUrl || '')
}
function uploadedValue(fileId?: string | number | null, url?: string) {
  const previewUrl = resolveFileUrl(url || '')
  if (!fileId && !previewUrl) return null

  return {
    fileId: fileId || '',
    url: previewUrl,
    path: '',
  } satisfies UploadedFile
}
function fill(row?: Brand) {
  Object.assign(form, {
    name: row?.name || '',
    slug: row?.slug || '',
    description: row?.description || '',
    fileId: row?.fileId || '',
    status: row?.status || 'ACTIVE',
    sortOrder: row?.sortOrder || 0,
    fileSizeId: row?.fileSizeId || '',
  })
  uploaded.value = uploadedValue(row?.fileId, row?.imageUrl)
  uploadSizeGuide.value = uploadedValue(row?.fileSizeId, row?.sizeGuideImageUrl)
}
watch(
  () => form.name,
  (name, previousName) => {
    form.slug = syncAutoSlug(form.slug, previousName, name)
  },
)
function openCreate() {
  editing.value = 'new'
  fill()
}
async function openEdit(id: string) {
  const row = await brandApi.adminDetail(id)
  editing.value = row
  fill(row)
}
function handleRowAction(key: string, row: Brand) {
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
    const data = await brandApi.adminList(query)
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
  const msg = required(form.name, 'Name')
  if (msg) {
    error.value = msg
    return
  }
  try {
    const payload = { ...form, slug: form.slug || slugify(form.name) }
    if (editing.value === 'new') await brandApi.create(payload)
    else if (editing.value) await brandApi.update(editing.value.id, payload)
    notice.value = 'Lưu brand thành công.'
    editing.value = null
    await load()
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  try {
    await brandApi.remove(deleting.value.id)
    notice.value = 'Xóa brand thành công.'
    deleting.value = null
    await load()
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}

onMounted(async () => {
  await Promise.allSettled([loadMasterData(), load()])
})
</script>
