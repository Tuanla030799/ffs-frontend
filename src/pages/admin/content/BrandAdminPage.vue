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
    @search="load"
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
        ><div class="space-x-3">
          <UiButton variant="ghost" @click="openEdit(row.id)">Edit</UiButton
          ><UiButton variant="danger" @click="deleting = row">Delete</UiButton>
        </div></template
      >
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import { UiButton, UiForm, UiInput, UiSelect, UiTable, UiTextarea } from '@/components/ui'
import { brandApi } from '@/modules/content/brand/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatLocalDateTime } from '@/lib/dateTime'
import { slugify, syncAutoSlug } from '@/lib/slug'
import type { Brand, BrandPayload } from '@/modules/content/brand/types'
import type { UploadedFile } from '@/services/file.service'

const rows = ref<Brand[]>([])
const loading = ref(false)
const error = ref('')
const notice = ref('')
const editing = ref<Brand | 'new' | null>(null)
const deleting = ref<Brand | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const uploadSizeGuide = ref<UploadedFile | null>(null)
const query = reactive({ keyword: '', status: '' })
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
  { key: 'name', label: 'Tên thương hiệu' },
  { key: 'logo', label: 'Logo' },
  { key: 'sizeGuide', label: 'sizeGuide' },
  { key: 'slug', label: 'Slug' },
  { key: 'status', label: 'Trạng thái' },
  { key: 'sortOrder', label: 'Thứ tự sắp xếp' },
  { key: 'createdAt', label: 'Ngày tạo' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

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
async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (await brandApi.adminList(query)).items
  } catch (e) {
    error.value = getErrorMessage(e)
  } finally {
    loading.value = false
  }
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
