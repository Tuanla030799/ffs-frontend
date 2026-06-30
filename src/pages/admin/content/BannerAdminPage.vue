<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý landing banner"
    description="Banner hiển thị ở trang chủ, có thể lên lịch hiển thị theo ngày bắt đầu và kết thúc."
    :loading="loading"
    :error="error || masterError"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo banner' : 'Cập nhật banner'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa banner ${deleting?.title || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <UiForm as="form" class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <UiInput v-model="form.title" placeholder="Title" required label="Tiêu đề" />
        <UiInput v-model="form.subtitle" placeholder="Subtitle" label="Tiêu đề phụ" />
        <!-- <UiInput v-model="form.linkUrl" placeholder="Link URL" label="Link URL" />
        <UiInput v-model="form.fileId" placeholder="File ID" label="File ID" /> -->
        <UiSelect v-model="form.status" label="Trạng thái">
          <option v-for="status in commonStatuses" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </UiSelect>
        <UiInput v-model.number="form.sortOrder" placeholder="Sort" label="Sort" />
        <UiInput v-model="form.startsAt" type="datetime-local" label="Bắt đầu" />
        <UiInput v-model="form.endsAt" type="datetime-local" label="Kết thúc" />
        <div class="md:col-span-3">
          <FileUpload
            v-model="uploaded"
            scope="admin"
            accept="image/*"
            title="Upload banner image"
            @uploaded="(file) => (form.fileId = String(file.fileId))"
          />
        </div>
        <div class="flex justify-end gap-2 md:col-span-3">
          <UiButton native-type="button" variant="secondary" @click="editing = null">
            Cancel </UiButton
          ><UiButton native-type="submit" variant="dark"> Save </UiButton>
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
      min-width="min-w-[880px]"
      empty-text="Không có banner."
    >
      <template #cell-title="{ row }">
        <span class="font-black text-slate-950">{{ row.title }}</span>
        <div class="text-xs font-normal text-slate-500">
          {{ row.subtitle }}
        </div>
      </template>
      <template #cell-preview="{ row }">
        <ImagePreview
          class="w-20"
          v-if="resolveFileUrl(row.imageUrl)"
          :src="resolveFileUrl(row.imageUrl)"
          :title="row.title"
        />
        <span v-else>-</span>
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
      :page-size="Number(query.limit || 20)"
      @update:page="changePage"
    />
  </CrudShell>
</template>

<script setup lang="ts">
import { UiButton, UiDropdown, UiForm, UiInput, UiPagination, UiSelect, UiTable } from '@/components/ui'
import { computed, onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import { usePageQuery } from '@/composables/usePageQuery'
import { bannerApi } from '@/modules/content/banner/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import { toBackendDateTime, toDateTimeLocalInput } from '@/lib/dateTime'
import type { LandingBanner, LandingBannerPayload } from '@/modules/content/banner/types'
import type { UploadedFile } from '@/services/file.service'
import ImagePreview from '@/components/common/ImagePreview.vue'

const rows = ref<LandingBanner[]>([])
const pageQuery = usePageQuery()
const loading = ref(false)
const error = ref('')
const editing = ref<LandingBanner | 'new' | null>(null)
const deleting = ref<LandingBanner | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<LandingBannerPayload>({
  title: '',
  subtitle: '',
  linkUrl: '',
  fileId: '',
  status: 'ACTIVE',
  sortOrder: 0,
  startsAt: '',
  endsAt: '',
})
const { data: masterData, error: masterError, load: loadMasterData } = useMasterData('admin')
const commonStatuses = computed(
  () =>
    masterData.value?.commonStatuses || [
      { value: 'ACTIVE', label: 'ACTIVE' },
      { value: 'INACTIVE', label: 'INACTIVE' },
    ],
)
const columns = [
  { key: 'title', label: 'Tên', cellAlign: 'left', width: '260px' },
  { key: 'preview', label: 'Ảnh', cellAlign: 'center', width: '130px' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'sortOrder', label: 'Thứ tự', cellAlign: 'center', width: '120px' },
  { key: 'actions', label: 'Hành động', cellAlign: 'center', width: '120px' },
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
function fill(r?: LandingBanner) {
  Object.assign(form, {
    title: r?.title || '',
    subtitle: r?.subtitle || '',
    linkUrl: r?.linkUrl || '',
    fileId: r?.fileId || '',
    status: r?.status || 'ACTIVE',
    sortOrder: r?.sortOrder || 0,
    startsAt: toDateTimeLocalInput(r?.startsAt),
    endsAt: toDateTimeLocalInput(r?.endsAt),
  })
}
function openCreate() {
  editing.value = 'new'
  fill()
}
function openEdit(r: LandingBanner) {
  editing.value = r
  fill(r)
}
function handleRowAction(key: string, row: LandingBanner) {
  if (key === 'edit') {
    openEdit(row)
    return
  }
  if (key === 'delete') deleting.value = row
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await bannerApi.adminList(query)
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
  try {
    const payload = {
      ...form,
      startsAt: toBackendDateTime(form.startsAt || null) || undefined,
      endsAt: toBackendDateTime(form.endsAt || null) || undefined,
    }
    if (editing.value === 'new') await bannerApi.create(payload)
    else if (editing.value) await bannerApi.update(editing.value.id, payload)
    editing.value = null
    await load()
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  await bannerApi.remove(deleting.value.id)
  deleting.value = null
  await load()
}
onMounted(async () => {
  await Promise.allSettled([loadMasterData(), load()])
})
</script>
