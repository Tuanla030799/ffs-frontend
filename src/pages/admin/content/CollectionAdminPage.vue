<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý collections"
    description="Bộ sưu tập sản phẩm hiển thị trên storefront."
    :loading="loading"
    :error="error || masterError"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo collection' : 'Cập nhật collection'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa collection ${deleting?.name || ''}?`"
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
          <UiInput v-model="form.name" placeholder="Name *" required label="Tên" />
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
            v-model="form.excerpt"
            class="md:col-span-2"
            placeholder="Excerpt"
            label="Mô tả ngắn"
          />
          <div class="md:col-span-3">
            <RichTextEditorField
              v-model="form.descriptionHtml"
              title="Nội dung collection"
              description="Nội dung chi tiết về collection, có thể bao gồm text, hình ảnh,..."
              placeholder="Viết mô tả collection..."
            />
          </div>
          <div class="md:col-span-3">
            <FileUpload
              v-model="uploaded"
              scope="admin"
              accept="image/*"
              title="Thêm ảnh bìa"
              description="Ảnh đại diện cho collection, hiển thị ở trang danh sách và chi tiết collection."
              trigger-text="Thêm ảnh"
              @uploaded="assignCoverImage"
            />
            <div
              v-if="form.fileId || coverPreviewUrl"
              class="mt-3 grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[104px_minmax(0,1fr)]"
            >
              <ImagePreview
                :src="coverPreviewUrl"
                :alt="form.name || 'Collection cover'"
                :title="form.name || 'Collection cover'"
              />
              <div class="space-y-2">
                <UiInput :model-value="form.fileId" label="File ID" readonly />
                <div class="flex justify-end">
                  <UiButton
                    native-type="button"
                    variant="danger"
                    size="sm"
                    @click="clearCoverImage"
                  >
                    Xóa
                  </UiButton>
                </div>
              </div>
            </div>
          </div>
        </div>

        <section class="rounded-2xl border border-slate-200 p-4">
          <div class="mb-3 flex flex-wrap items-center justify-between gap-3">
            <h3 class="font-black">Sản phẩm</h3>
            <UiButton native-type="button" variant="outline" size="sm" @click="addProduct">
              + Thêm sản phẩm
            </UiButton>
          </div>
          <div class="grid gap-2">
            <div
              v-for="(item, index) in form.products"
              :key="index"
              class="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_140px_auto]"
            >
              <AsyncSelect
                v-model="item.productId"
                label="Chọn sản phẩm"
                placeholder="Chọn sản phẩm"
                search-placeholder="Tìm kiếm product..."
                :page-size="20"
                :selected-options="selectedProductOptions"
                :fetch-options="fetchProductOptions"
                @selected="rememberSelectedProduct"
              />
              <UiInput v-model.number="item.sortOrder" placeholder="Sort" label="Thứ tự sắp xếp" />
              <UiButton
                native-type="button"
                variant="danger"
                @click="form.products.splice(index, 1)"
                >Xóa</UiButton
              >
            </div>
          </div>
        </section>

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
      min-width="min-w-[940px]"
      empty-text="Không có collection."
    >
      <template #cell-name="{ row }"
        ><span class="font-black text-slate-950">{{ row.name }}</span></template
      >
      <template #cell-cover="{ row }">
        <ImagePreview class="w-20" v-if="coverUrl(row)" :src="coverUrl(row)" :title="row.name" />
        <span v-else>-</span></template
      >
      <template #cell-status="{ row }"
        ><span :class="badgeClass(row.status)">{{ row.status }}</span></template
      >
      <template #cell-productCount="{ row }">{{
        row.productCount || row.products?.length || 0
      }}</template>
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
import AsyncSelect, { type AsyncSelectOption } from '@/components/common/AsyncSelect.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'
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
import { collectionApi } from '@/modules/content/collection/api'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import { isEditorJsContent, normalizeRichTextInput } from '@/lib/richText'
import { sanitizeHtml } from '@/lib/sanitizeHtml'
import { formatLocalDateTime } from '@/lib/dateTime'
import { slugify, syncAutoSlug } from '@/lib/slug'
import type {
  Collection,
  CollectionDetail,
  CollectionPayload,
} from '@/modules/content/collection/types'
import type { Product } from '@/modules/catalog/product/types'
import type { UploadedFile } from '@/services/file.service'
import ImagePreview from '@/components/common/ImagePreview.vue'

const rows = ref<Collection[]>([])
const pageQuery = usePageQuery()
const selectedProducts = ref<Record<string, Product>>({})
const loading = ref(false)
const error = ref('')
const notice = ref('')
const editing = ref<Collection | 'new' | null>(null)
const deleting = ref<Collection | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const coverPreviewUrl = ref('')
const hasLegacyDescription = ref(false)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({ keyword: '', status: '', page: pageQuery.value(), limit: 50 })
const page = computed(() => Number(query.page || 1))
const form = reactive<CollectionPayload>({
  name: '',
  slug: '',
  excerpt: '',
  descriptionHtml: '',
  descriptionJson: null,
  fileId: '',
  status: 'ACTIVE',
  sortOrder: 0,
  products: [],
})
const { data: masterData, error: masterError, load: loadMasterData } = useMasterData('admin')
const commonStatuses = computed(
  () =>
    masterData.value?.commonStatuses || [
      { value: 'ACTIVE', label: 'ACTIVE' },
      { value: 'INACTIVE', label: 'INACTIVE' },
    ],
)
const selectedProductOptions = computed(() =>
  Object.values(selectedProducts.value).map(productToOption),
)
const columns = [
  { key: 'name', label: 'Tên', cellAlign: 'left', width: '220px' },
  { key: 'cover', label: 'Ảnh bìa', cellAlign: 'center', width: '130px' },
  { key: 'slug', label: 'Slug', cellAlign: 'left', width: '180px' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '140px' },
  { key: 'sortOrder', label: 'Sắp xếp', cellAlign: 'center', width: '120px' },
  { key: 'productCount', label: 'Sản phẩm', cellAlign: 'center', width: '120px' },
  { key: 'createdAt', label: 'Ngày tạo', cellAlign: 'center', width: '180px' },
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
function coverUrl(row: Collection) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}
function addProduct() {
  form.products.push({ productId: '', sortOrder: form.products.length })
}
function productToOption(product: Product): AsyncSelectOption {
  return { value: product.id, label: product.name, raw: product }
}
async function fetchProductOptions(params: { keyword: string; page: number; limit: number }) {
  const result = await productApi.adminList(params)
  return {
    items: result.items.map(productToOption),
    total: result.total,
    page: result.page,
  }
}
function rememberSelectedProduct(option: AsyncSelectOption) {
  const product = option.raw as Product | undefined
  if (product?.id) selectedProducts.value[product.id] = product
}
function fill(row?: CollectionDetail) {
  selectedProducts.value = {}
  const collectionProducts = row?.products || []
  collectionProducts.forEach((product) => {
    if (product.id) selectedProducts.value[product.id] = product
  })
  Object.assign(form, {
    name: row?.name || '',
    slug: row?.slug || '',
    excerpt: row?.excerpt || '',
    descriptionHtml: normalizeRichTextInput(row?.descriptionHtml),
    descriptionJson: null,
    fileId: row?.fileId || '',
    status: row?.status || 'ACTIVE',
    sortOrder: row?.sortOrder || 0,
    products: (row?.products || []).map((product, index) => ({
      productId: product.id || '',
      sortOrder: index,
    })),
  })
  coverPreviewUrl.value = row ? coverUrl(row) : ''
  hasLegacyDescription.value = !form.descriptionHtml && isEditorJsContent(row?.descriptionJson)
  uploaded.value = null
}
watch(
  () => form.name,
  (name, previousName) => {
    form.slug = syncAutoSlug(form.slug, previousName, name)
  },
)
function assignCoverImage(file: UploadedFile) {
  form.fileId = String(file.fileId)
  coverPreviewUrl.value = file.url || file.path || ''
  uploaded.value = null
}
function clearCoverImage() {
  form.fileId = ''
  coverPreviewUrl.value = ''
  uploaded.value = null
}
function openCreate() {
  editing.value = 'new'
  fill()
}
async function openEdit(id: string) {
  const row = await collectionApi.adminDetail(id)
  editing.value = row
  fill(row)
}
function handleRowAction(key: string, row: Collection) {
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
    const data = await collectionApi.adminList(query)
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
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
      descriptionHtml: sanitizeHtml(form.descriptionHtml || ''),
      descriptionJson: null,
      products: form.products.filter((item) => item.productId),
    }
    if (editing.value === 'new') await collectionApi.create(payload)
    else if (editing.value) await collectionApi.update(editing.value.id, payload)
    notice.value = 'Lưu collection thành công.'
    editing.value = null
    await load()
  } catch (e) {
    error.value = getErrorMessage(e)
  }
}
async function confirmRemove() {
  if (!deleting.value) return
  try {
    await collectionApi.remove(deleting.value.id)
    notice.value = 'Xóa collection thành công.'
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
