<template>
  <section class="space-y-5">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <p class="text-sm font-bold text-slate-400 uppercase">Products</p>
        <h2 class="text-2xl font-black text-slate-950">
          {{ isEdit ? 'Cập nhật product' : 'Tạo product' }}
        </h2>
      </div>
      <div class="flex gap-2">
        <UiButton variant="secondary" @click="goBack">Quay lại</UiButton>
        <UiButton :loading="saving" @click="save">Lưu product</UiButton>
      </div>
    </div>

    <UiAlert v-if="error" variant="error">{{ error }}</UiAlert>

    <UiForm as="form" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_360px]" @submit.prevent="save">
      <div class="space-y-5">
        <UiCard title="Thông tin cơ bản" padding="md">
          <div class="grid gap-3 md:grid-cols-3">
            <UiInput v-model="form.name" placeholder="Name *" required label="Name" />
            <UiInput v-model="form.slug" placeholder="Slug *" required label="Slug" />
            <UiSelect v-model="form.categoryId" placeholder="Category *" label="Category">
              <option
                v-for="category in masterData?.categories || []"
                :key="category.id"
                :value="category.id"
              >
                {{ category.name }}
              </option>
            </UiSelect>
            <UiSelect v-model="form.brandId" placeholder="Không chọn brand" label="Thương hiệu">
              <option v-for="brand in masterData?.brands || []" :key="brand.id" :value="brand.id">
                {{ brand.name }}
              </option>
            </UiSelect>
            <UiSelect v-model="form.gender" placeholder="Gender" label="Gender">
              <option
                v-for="gender in masterData?.productGenders || []"
                :key="gender.value"
                :value="gender.value"
              >
                {{ gender.label }}
              </option>
            </UiSelect>
            <UiInput
              v-model="form.shortDescription"
              class="md:col-span-2"
              placeholder="Short description"
              label="Short description"
            />
            <UiSelect v-model="form.status" label="Trạng thái">
              <option
                v-for="status in masterData?.productStatuses || []"
                :key="status.value"
                :value="status.value"
              >
                {{ status.label }}
              </option>
            </UiSelect>
            <UiCheckbox v-model="form.isFeatured" label="Featured" />
            <UiInput
              v-model.number="form.featuredOrder"
              placeholder="Featured order"
              label="Featured order"
            />
          </div>
        </UiCard>

        <EditorJsField
          v-model="form.descriptionJson"
          title="Mô tả sản phẩm"
          description="Nội dung chi tiết hiển thị ở trang product detail."
          placeholder="Nhập mô tả sản phẩm..."
        />

        <UiCard title="Variants" padding="md">
          <template #extra>
            <UiButton native-type="button" variant="outline" size="sm" @click="addVariant"
              >+ Variant</UiButton
            >
          </template>
          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="variant in variantList"
              :key="variant.clientId || variant.id"
              class="grid gap-2 rounded-xl border border-slate-200 p-3"
            >
              <UiInput v-model="variant.name" placeholder="Name" label="Name" />
              <UiInput v-model="variant.colorName" placeholder="Color name" label="Color name" />
              <UiInput v-model="variant.colorCode" placeholder="#000000" label="Mã màu" />
              <UiInput
                v-model="variant.imageFileId"
                placeholder="Image file ID"
                label="Image file ID"
              />
              <UiSelect v-model="variant.status" label="Trạng thái">
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </UiSelect>
            </div>
          </div>
        </UiCard>

        <UiCard title="SKUs" padding="md">
          <template #extra>
            <UiButton native-type="button" variant="outline" size="sm" @click="addSku"
              >+ SKU</UiButton
            >
          </template>
          <div class="grid gap-3 md:grid-cols-2">
            <div
              v-for="sku in skuList"
              :key="sku.id || sku.skuCode"
              class="grid gap-2 rounded-xl border border-slate-200 p-3"
            >
              <UiInput
                v-model="sku.variantClientId"
                placeholder="variantClientId"
                label="Variant client ID"
              />
              <UiInput v-model="sku.variantId" placeholder="variantId" label="Variant ID" />
              <UiInput v-model="sku.skuCode" placeholder="SKU code" label="SKU code" />
              <UiInput v-model="sku.size" placeholder="Size" label="Size" />
              <UiInput v-model.number="sku.price" placeholder="Price" label="Price" />
              <UiInput v-model.number="sku.salePrice" placeholder="Sale price" label="Sale price" />
              <UiInput v-model.number="sku.stock" placeholder="Stock" label="Stock" />
            </div>
          </div>
        </UiCard>
      </div>

      <aside class="space-y-5">
        <UiCard title="Images" padding="md">
          <FileUpload
            v-model="uploaded"
            scope="admin"
            accept="image/*"
            title="Upload product image"
            @uploaded="addImage"
          />
          <div class="mt-3">
            <UiButton native-type="button" variant="outline" size="sm" @click="addEmptyImage"
              >+ Image row</UiButton
            >
          </div>
          <div class="mt-3 grid gap-2">
            <div
              v-for="(image, i) in imageList"
              :key="i"
              class="rounded-xl border border-slate-200 p-3"
            >
              <UiInput v-model="image.fileId" class="mb-2" placeholder="fileId" label="File ID" />
              <UiInput v-model="image.altText" class="mb-2" placeholder="alt" label="Alt text" />
              <UiSelect v-model="image.imageType" class="mb-2" label="Loại ảnh">
                <option>MAIN</option>
                <option>GALLERY</option>
              </UiSelect>
              <UiCheckbox v-model="image.isPrimary" label="Primary" />
            </div>
          </div>
        </UiCard>

        <UiCard title="Actions" padding="md">
          <p class="mt-1 text-sm text-slate-500">
            Form này tách route riêng để dễ nhập dữ liệu dài.
          </p>
          <div class="mt-4 grid gap-2">
            <UiButton native-type="submit" :loading="saving">Lưu product</UiButton>
            <UiButton native-type="button" variant="secondary" @click="goBack">Hủy</UiButton>
          </div>
        </UiCard>
      </aside>
    </UiForm>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import EditorJsField from '@/components/editor/EditorJsField.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import { UiAlert, UiButton, UiCard, UiCheckbox, UiForm, UiInput, UiSelect } from '@/components/ui'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import type { Product, ProductPayload } from '@/modules/catalog/product/types'
import type { UploadedFile } from '@/services/file.service'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const error = ref('')
const uploaded = ref<UploadedFile | null>(null)
const form = reactive<ProductPayload>({
  categoryId: '',
  brandId: null,
  gender: 'UNISEX',
  name: '',
  slug: '',
  shortDescription: '',
  descriptionJson: { time: Date.now(), blocks: [] },
  status: 'ACTIVE',
  isFeatured: false,
  featuredOrder: 0,
  images: [],
  variants: [],
  skus: [],
})
const { data: masterData, load: loadMasterData } = useMasterData('admin')
const imageList = computed(() => ensureImages())
const variantList = computed(() => ensureVariants())
const skuList = computed(() => ensureSkus())

function reset(row?: Product) {
  form.categoryId = row?.categoryId || ''
  form.brandId = row?.brandId || null
  form.gender = row?.gender || 'UNISEX'
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

function ensureImages() {
  form.images ||= []
  return form.images
}
function ensureVariants() {
  form.variants ||= []
  return form.variants
}
function ensureSkus() {
  form.skus ||= []
  return form.skus
}
function addVariant() {
  const variants = ensureVariants()
  const clientId = crypto.randomUUID()
  variants.push({
    clientId,
    name: '',
    colorName: '',
    colorCode: '#000000',
    status: 'ACTIVE',
    sortOrder: variants.length,
  })
}
function addSku() {
  const variants = ensureVariants()
  ensureSkus().push({
    variantClientId: variants[0]?.clientId,
    skuCode: '',
    size: '',
    price: 0,
    salePrice: null,
    stock: 0,
    status: 'ACTIVE',
  })
}
function addImage(file: UploadedFile) {
  const images = ensureImages()
  images.push({
    fileId: String(file.fileId),
    altText: form.name,
    imageType: images.length ? 'GALLERY' : 'MAIN',
    sortOrder: images.length,
    isPrimary: images.length === 0,
  })
}
function addEmptyImage() {
  const images = ensureImages()
  images.push({ imageType: 'GALLERY', sortOrder: images.length, isPrimary: false })
}
function goBack() {
  void router.push({ name: 'admin-products' })
}

async function save() {
  const msg =
    required(form.name, 'Name') ||
    required(form.slug, 'Slug') ||
    required(form.categoryId, 'Category ID')
  if (msg) {
    error.value = msg
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = { ...form, brandId: form.brandId || null, gender: form.gender || 'UNISEX' }
    if (isEdit.value) await productApi.update(String(route.params.id), payload)
    else await productApi.create(payload)
    goBack()
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    saving.value = false
  }
}

onMounted(async () => {
  await loadMasterData()
  if (isEdit.value) reset(await productApi.adminDetail(String(route.params.id)))
  else reset()
})
</script>
