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
          <UiInput
            v-model="form.name"
            placeholder="Name *"
            required
            @update:model-value="syncSlug"
            label="Name"
          />
          <UiInput v-model="form.slug" placeholder="Slug" label="Slug" />
          <UiSelect v-model="form.status" label="Trạng thái">
            <option v-for="status in commonStatuses" :key="status.value" :value="status.value">
              {{ status.label }}
            </option>
          </UiSelect>
          <UiInput v-model.number="form.sortOrder" placeholder="Sort order" label="Sort order" />
          <UiTextarea
            v-model="form.description"
            class="md:col-span-2"
            placeholder="Description"
            label="Description"
          />
          <div class="md:col-span-3">
            <FileUpload
              v-model="uploaded"
              scope="admin"
              accept="image/*"
              title="Upload cover"
              @uploaded="(file) => (form.fileId = String(file.fileId))"
            />
          </div>
        </div>

        <section class="rounded-2xl border border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-black">Products</h3>
            <UiButton native-type="button" variant="outline" size="sm" @click="addProduct"
              >+ Product</UiButton
            >
          </div>
          <div class="grid gap-2">
            <div
              v-for="(item, index) in form.products"
              :key="index"
              class="grid gap-2 rounded-xl border border-slate-200 p-3 md:grid-cols-[1fr_140px_auto]"
            >
              <UiSelect v-model="item.productId" placeholder="Chọn sản phẩm" label="Chọn sản phẩm">
                <option v-for="product in products" :key="product.id" :value="product.id">
                  {{ product.name }}
                </option>
              </UiSelect>
              <UiInput v-model.number="item.sortOrder" placeholder="Sort" label="Sort" />
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
      <template #cell-cover="{ row }"
        ><img
          v-if="coverUrl(row)"
          :src="coverUrl(row)"
          class="h-12 w-20 rounded-lg object-cover"
          :alt="row.name"
        /><span v-else>-</span></template
      >
      <template #cell-status="{ row }"
        ><span :class="badgeClass(row.status)">{{ row.status }}</span></template
      >
      <template #cell-productCount="{ row }">{{
        row.productCount || row.products?.length || 0
      }}</template>
      <template #cell-createdAt="{ row }">{{ formatDateTime(row.createdAt) }}</template>
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
import { computed, onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import { UiButton, UiForm, UiInput, UiSelect, UiTable, UiTextarea } from '@/components/ui'
import { collectionApi } from '@/modules/content/collection/api'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import { formatDateTime } from '@/modules/shared/types'
import type { Collection, CollectionPayload } from '@/modules/content/collection/types'
import type { Product } from '@/modules/catalog/product/types'
import type { UploadedFile } from '@/services/file.service'

const rows = ref<Collection[]>([])
const products = ref<Product[]>([])
const loading = ref(false)
const error = ref('')
const notice = ref('')
const editing = ref<Collection | 'new' | null>(null)
const deleting = ref<Collection | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const query = reactive({ keyword: '', status: '', page: 1, limit: 50 })
const form = reactive<CollectionPayload>({
  name: '',
  slug: '',
  description: '',
  descriptionJson: '{}',
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
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'cover', label: 'Cover' },
  { key: 'slug', label: 'Slug' },
  { key: 'status', label: 'Status' },
  { key: 'sortOrder', label: 'Sort' },
  { key: 'productCount', label: 'Products' },
  { key: 'createdAt', label: 'Created' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}
function syncSlug() {
  if (!form.slug) form.slug = slugify(form.name)
}
function badgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
    : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}
function coverUrl(row: Collection) {
  return resolveFileUrl(row.coverUrl || row.imageUrl || '')
}
async function ensureProductsLoaded() {
  if (products.value.length) return
  products.value = (await productApi.adminList({ limit: 200 })).items
}
async function addProduct() {
  await ensureProductsLoaded()
  form.products.push({ productId: '', sortOrder: form.products.length })
}
function fill(row?: Collection) {
  Object.assign(form, {
    name: row?.name || '',
    slug: row?.slug || '',
    description: row?.description || '',
    descriptionJson:
      typeof row?.descriptionJson === 'string'
        ? row.descriptionJson
        : JSON.stringify(row?.descriptionJson || {}),
    fileId: row?.fileId || '',
    status: row?.status || 'ACTIVE',
    sortOrder: row?.sortOrder || 0,
    products: (row?.products || []).map((item) => ({
      productId: item.productId || item.product?.id || '',
      sortOrder: item.sortOrder || 0,
    })),
  })
  uploaded.value = null
}
async function openCreate() {
  editing.value = 'new'
  fill()
  await ensureProductsLoaded()
}
async function openEdit(id: string) {
  const row = await collectionApi.adminDetail(id)
  editing.value = row
  fill(row)
  await ensureProductsLoaded()
}
async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (await collectionApi.adminList(query)).items
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
    const payload = {
      ...form,
      slug: form.slug || slugify(form.name),
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
