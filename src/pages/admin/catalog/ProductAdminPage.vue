<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý product"
    description="CRUD product, ảnh, variants, SKUs và mô tả Editor.js."
    :loading="loading"
    :error="error"
    :status-options="['ACTIVE', 'INACTIVE', 'DRAFT']"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo product' : 'Cập nhật product'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa product ${deleting?.name || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="load"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <form
        class="space-y-5"
        @submit.prevent="save"
      >
        <div class="grid gap-3 md:grid-cols-3">
          <input v-model="form.name" class="rounded-xl border border-slate-200 p-3" placeholder="Name" required>
          <input v-model="form.slug" class="rounded-xl border border-slate-200 p-3" placeholder="Slug" required>
          <input v-model="form.categoryId" class="rounded-xl border border-slate-200 p-3" placeholder="Category ID" required>
          <input v-model="form.shortDescription" class="rounded-xl border border-slate-200 p-3 md:col-span-2" placeholder="Short description">
          <select v-model="form.status" class="rounded-xl border border-slate-200 p-3">
            <option>ACTIVE</option>
            <option>INACTIVE</option>
            <option>DRAFT</option>
          </select>
          <label class="flex items-center gap-2 rounded-xl border border-slate-200 p-3 text-sm font-bold">
            <input v-model="form.isFeatured" type="checkbox">
            Featured
          </label>
          <input v-model.number="form.featuredOrder" class="rounded-xl border border-slate-200 p-3" placeholder="Featured order">
          <FileUpload v-model="uploaded" scope="admin" accept="image/*" title="Upload product image" @uploaded="addImage" />
        </div>

        <EditorJsField v-model="form.descriptionJson" />

        <section class="rounded-2xl border border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-black">Images</h3>
            <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" @click="addEmptyImage">+ Image</button>
          </div>
          <div class="grid gap-2 md:grid-cols-3">
            <div v-for="(image, i) in imageList" :key="i" class="rounded-xl border border-slate-200 p-3">
              <input v-model="image.fileId" class="mb-2 w-full rounded border border-slate-200 p-2" placeholder="fileId">
              <input v-model="image.altText" class="mb-2 w-full rounded border border-slate-200 p-2" placeholder="alt">
              <select v-model="image.imageType" class="mb-2 w-full rounded border border-slate-200 p-2">
                <option>MAIN</option>
                <option>GALLERY</option>
              </select>
              <label class="text-sm"><input v-model="image.isPrimary" type="checkbox"> Primary</label>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-black">Variants</h3>
            <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" @click="addVariant">+ Variant</button>
          </div>
          <div class="grid gap-2 md:grid-cols-2">
            <div v-for="variant in variantList" :key="variant.clientId || variant.id" class="grid gap-2 rounded-xl border border-slate-200 p-3">
              <input v-model="variant.name" class="rounded border border-slate-200 p-2" placeholder="Name">
              <input v-model="variant.colorName" class="rounded border border-slate-200 p-2" placeholder="Color name">
              <input v-model="variant.colorCode" class="rounded border border-slate-200 p-2" placeholder="#000000">
              <input v-model="variant.imageFileId" class="rounded border border-slate-200 p-2" placeholder="Image file ID">
              <select v-model="variant.status" class="rounded border border-slate-200 p-2">
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </select>
            </div>
          </div>
        </section>

        <section class="rounded-2xl border border-slate-200 p-4">
          <div class="mb-3 flex items-center justify-between">
            <h3 class="font-black">SKUs</h3>
            <button type="button" class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold" @click="addSku">+ SKU</button>
          </div>
          <div class="grid gap-2 md:grid-cols-2">
            <div v-for="sku in skuList" :key="sku.id || sku.skuCode" class="grid gap-2 rounded-xl border border-slate-200 p-3">
              <input v-model="sku.variantClientId" class="rounded border border-slate-200 p-2" placeholder="variantClientId">
              <input v-model="sku.variantId" class="rounded border border-slate-200 p-2" placeholder="variantId">
              <input v-model="sku.skuCode" class="rounded border border-slate-200 p-2" placeholder="SKU code">
              <input v-model="sku.size" class="rounded border border-slate-200 p-2" placeholder="Size">
              <input v-model.number="sku.price" class="rounded border border-slate-200 p-2" placeholder="Price">
              <input v-model.number="sku.salePrice" class="rounded border border-slate-200 p-2" placeholder="Sale price">
              <input v-model.number="sku.stock" class="rounded border border-slate-200 p-2" placeholder="Stock">
            </div>
          </div>
        </section>

        <div class="flex justify-end gap-2">
          <button type="button" class="rounded-xl border border-slate-200 px-4 py-2 font-bold" @click="editing = null">Cancel</button>
          <button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Save</button>
        </div>
      </form>
    </template>

    <table class="w-full min-w-[920px] text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500">
        <tr><th class="p-3">Name</th><th>Slug</th><th>Status</th><th>Featured</th><th>Stock</th><th>Price</th><th class="text-right">Actions</th></tr>
      </thead>
      <tbody>
        <tr v-if="!rows.length" class="border-t"><td colspan="7" class="p-8 text-center text-slate-500">Không có product.</td></tr>
        <tr v-for="row in rows" :key="row.id" class="border-t">
          <td class="p-3 font-bold text-slate-950">{{ row.name }}</td>
          <td>{{ row.slug }}</td>
          <td><span :class="badgeClass(row.status)">{{ row.status }}</span></td>
          <td>{{ row.isFeatured ? 'Yes' : 'No' }}</td>
          <td>{{ row.stock ?? '-' }}</td>
          <td>{{ money(row.salePrice || row.price) }}</td>
          <td class="space-x-3 text-right">
            <button class="font-bold text-slate-700" @click="openEdit(row.id)">Edit</button>
            <button class="font-bold text-red-600" @click="deleting = row">Delete</button>
          </td>
        </tr>
      </tbody>
    </table>
  </CrudShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import EditorJsField from '@/components/editor/EditorJsField.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { money } from '@/modules/shared/types'
import type { Product, ProductPayload } from '@/modules/catalog/product/types'
import type { UploadedFile } from '@/services/file.service'

const rows = ref<Product[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<Product | 'new' | null>(null)
const deleting = ref<Product | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<ProductPayload>({ categoryId: '', name: '', slug: '', shortDescription: '', descriptionJson: { time: Date.now(), blocks: [] }, status: 'ACTIVE', isFeatured: false, featuredOrder: 0, images: [], variants: [], skus: [] })

const imageList = computed(() => ensureImages())
const variantList = computed(() => ensureVariants())
const skuList = computed(() => ensureSkus())

function badgeClass(status: string) {
  if (status === 'ACTIVE') return 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
  if (status === 'DRAFT') return 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700'
  return 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}

function reset(row?: Product) {
  form.categoryId = row?.categoryId || ''
  form.name = row?.name || ''
  form.slug = row?.slug || ''
  form.shortDescription = row?.shortDescription || ''
  form.descriptionJson = row?.descriptionJson || { time: Date.now(), blocks: [] }
  form.status = row?.status || 'ACTIVE'
  form.isFeatured = !!row?.isFeatured
  form.featuredOrder = row?.featuredOrder || 0
  form.images = [...(row?.images || [])]
  form.variants = [...(row?.variants || [])]
  form.skus = [...(row?.skus || [])]
}

function openCreate() { editing.value = 'new'; reset() }
async function openEdit(id: string) { const row = await productApi.adminDetail(id); editing.value = row; reset(row) }
function ensureImages() { form.images ||= []; return form.images }
function ensureVariants() { form.variants ||= []; return form.variants }
function ensureSkus() { form.skus ||= []; return form.skus }
function addVariant() { const variants = ensureVariants(); const clientId = crypto.randomUUID(); variants.push({ clientId, name: '', colorName: '', colorCode: '#000000', status: 'ACTIVE', sortOrder: variants.length }) }
function addSku() { const variants = ensureVariants(); ensureSkus().push({ variantClientId: variants[0]?.clientId, skuCode: '', size: '', price: 0, salePrice: null, stock: 0, status: 'ACTIVE' }) }
function addImage(file: UploadedFile) { const images = ensureImages(); images.push({ fileId: String(file.fileId), altText: form.name, imageType: images.length ? 'GALLERY' : 'MAIN', sortOrder: images.length, isPrimary: images.length === 0 }) }
function addEmptyImage() { const images = ensureImages(); images.push({ imageType: 'GALLERY', sortOrder: images.length, isPrimary: false }) }

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (await productApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })).items
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    if (editing.value === 'new') await productApi.create(form)
    else if (editing.value) await productApi.update(editing.value.id, form)
    editing.value = null
    await load()
  } catch (err) {
    error.value = getErrorMessage(err)
  }
}

async function confirmRemove() {
  if (!deleting.value) return
  await productApi.remove(deleting.value.id)
  deleting.value = null
  await load()
}

onMounted(load)
</script>
