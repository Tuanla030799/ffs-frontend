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
            <UiInput v-model="form.name" placeholder="Name" required label="Name" />
            <UiInput v-model="form.slug" placeholder="Slug" required label="Slug" />
            <UiSelect v-model="form.categoryId" placeholder="Category" label="Category">
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

        <RichTextEditorField
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
              <SizeColorPicker
                v-model="variant.colorId"
                :options="masterData?.colors || []"
                title="Chọn màu"
                placeholder="Chọn màu"
                variant="color"
              />
              <ImageUpload
                :model-value="variantUploadValue(variant)"
                scope="admin"
                accept="image/*"
                title="Upload variant image"
                trigger-text="Chọn ảnh variant"
                :preview-alt="
                  variant.name || selectedColorLabel(variant.colorId) || 'Variant image'
                "
                :preview-title="
                  variant.name || selectedColorLabel(variant.colorId) || 'Variant image'
                "
                @uploaded="(file) => assignVariantImage(variant, file)"
                @update:model-value="(file) => !file && clearVariantImage(variant)"
              />
              <UiSelect v-model="variant.status" label="Trạng thái">
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </UiSelect>
              <UiInput
                v-model.number="variant.sortOrder"
                placeholder="Sort order"
                label="Sort order"
              />
              <UiButton
                native-type="button"
                variant="danger"
                size="sm"
                @click="removeVariant(variant)"
              >
                Xóa variant
              </UiButton>
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
              <UiSelect
                :model-value="skuVariantValue(sku)"
                placeholder="Chọn variant"
                label="Variant"
                @update:model-value="(value) => selectSkuVariant(sku, value)"
              >
                <option
                  v-for="option in skuVariantOptions"
                  :key="option.value"
                  :value="option.value"
                >
                  {{ option.label }}
                </option>
              </UiSelect>
              <UiInput v-model="sku.skuCode" placeholder="SKU code" label="SKU code" />
              <SizeColorPicker
                v-model="sku.sizeId"
                :options="masterData?.sizes || []"
                title="Chọn size"
                placeholder="Chọn size"
              />
              <UiInput v-model.number="sku.price" placeholder="Price" label="Price" />
              <UiInput v-model.number="sku.salePrice" placeholder="Sale price" label="Sale price" />
              <UiInput v-model.number="sku.stock" placeholder="Stock" label="Stock" />
              <UiSelect v-model="sku.status" label="Trạng thái">
                <option>ACTIVE</option>
                <option>INACTIVE</option>
              </UiSelect>
              <UiButton native-type="button" variant="danger" size="sm" @click="removeSku(sku)">
                Xóa SKU
              </UiButton>
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
            title="Thêm ảnh sản phẩm"
            description="Ảnh đầu tiên sẽ là ảnh chính, các ảnh sau là gallery."
            trigger-text="Thêm ảnh"
            @uploaded="addImage"
          />
          <div class="mt-3 grid gap-2">
            <div
              v-for="(image, i) in imageList"
              :key="i"
              class="grid gap-3 rounded-xl border border-slate-200 p-3 sm:grid-cols-[104px_minmax(0,1fr)]"
            >
              <ImagePreview
                :src="resolveFileUrl(image.imageUrl || image.url)"
                :alt="image.altText || form.name"
                :title="image.altText || form.name || 'Product image'"
              />
              <div class="space-y-2">
                <UiInput v-model="image.altText" placeholder="alt" label="Alt text" />
                <div class="flex items-center justify-between gap-3">
                  <UiCheckbox
                    :model-value="Boolean(image.isPrimary)"
                    label="Primary"
                    @update:model-value="(value) => setPrimaryImage(i, value)"
                  />
                  <UiButton native-type="button" variant="danger" size="sm" @click="removeImage(i)">
                    Xóa ảnh
                  </UiButton>
                </div>
              </div>
            </div>
          </div>
        </UiCard>
      </aside>
    </UiForm>
  </section>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import ImageUpload from '@/components/common/ImageUpload.vue'
import ImagePreview from '@/components/common/ImagePreview.vue'
import SizeColorPicker from '@/components/common/SizeColorPicker.vue'
import { UiAlert, UiButton, UiCard, UiCheckbox, UiForm, UiInput, UiSelect } from '@/components/ui'
import { resolveFileUrl } from '@/lib/fileUrl'
import { normalizeRichTextInput } from '@/lib/richText'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage, required } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import type {
  Product,
  ProductPayload,
  ProductSku,
  ProductVariant,
} from '@/modules/catalog/product/types'
import type { UploadedFile } from '@/services/file.service'

const route = useRoute()
const router = useRouter()
const isEdit = computed(() => Boolean(route.params.id))
const saving = ref(false)
const error = ref('')
const uploaded = ref<UploadedFile | null>(null)
type ProductForm = Omit<Product, 'id'>

const form = reactive<ProductForm>({
  categoryId: '',
  brandId: null,
  gender: 'UNISEX',
  name: '',
  slug: '',
  shortDescription: '',
  descriptionJson: '',
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
const skuVariantOptions = computed(() =>
  variantList.value.map((variant, index) => ({
    value: variantSelectValue(variant),
    label: variant.name || selectedColorLabel(variant.colorId) || `Variant ${index + 1}`,
  })),
)

function reset(row?: Product) {
  form.categoryId = row?.categoryId || ''
  form.brandId = row?.brandId || null
  form.gender = row?.gender || 'UNISEX'
  form.name = row?.name || ''
  form.slug = row?.slug || ''
  form.shortDescription = row?.shortDescription || ''
  form.descriptionJson = normalizeRichTextInput(row?.descriptionJson)
  form.status = row?.status || 'ACTIVE'
  form.isFeatured = !!row?.isFeatured
  form.featuredOrder = row?.featuredOrder || 0
  form.images = [...(row?.images || [])]
  form.variants = (row?.variants || []).map((variant, index) => ({
    ...variant,
    id: variant.id || undefined,
    clientId: variant.clientId || crypto.randomUUID(),
    name: variant.name || '',
    colorId: variant.colorId || '',
    imageFileId: variant.imageFileId || undefined,
    status: variant.status || 'ACTIVE',
    sortOrder: variant.sortOrder ?? index,
  }))
  form.skus = (row?.skus || []).map((sku) => ({
    ...sku,
    id: sku.id || undefined,
    variantId: sku.variantId || undefined,
    variantClientId: sku.variantClientId || undefined,
    skuCode: sku.skuCode || '',
    sizeId: sku.sizeId || '',
    size: sku.size || '',
    price: Number(sku.price || 0),
    salePrice: sku.salePrice ?? null,
    stock: Number(sku.stock || 0),
    status: sku.status || 'ACTIVE',
  }))
  normalizeImages()
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
    colorId: '',
    status: 'ACTIVE',
    sortOrder: variants.length,
  })
}
function removeVariant(variant: ProductVariant) {
  const variants = ensureVariants()
  const index = variants.indexOf(variant)
  if (index >= 0) variants.splice(index, 1)
  const value = variantSelectValue(variant)
  form.skus = ensureSkus().filter((sku) => skuVariantValue(sku) !== value)
}
function addSku() {
  const variants = ensureVariants()
  const firstVariant = variants[0]
  ensureSkus().push({
    variantId: firstVariant?.id,
    variantClientId: firstVariant?.id ? undefined : firstVariant?.clientId,
    skuCode: '',
    sizeId: '',
    size: '',
    price: 0,
    salePrice: null,
    stock: 0,
    status: 'ACTIVE',
  })
}
function removeSku(sku: ProductSku) {
  const skus = ensureSkus()
  const index = skus.indexOf(sku)
  if (index >= 0) skus.splice(index, 1)
}
function selectedColorLabel(colorId?: string) {
  const color = masterData.value?.colors.find((item) => item.id === colorId)
  return color?.label || color?.value || ''
}
function addImage(file: UploadedFile) {
  const images = ensureImages()
  images.push({
    fileId: String(file.fileId),
    url: file.url || file.path,
    altText: form.name,
    imageType: images.length ? 'GALLERY' : 'MAIN',
    sortOrder: images.length,
    isPrimary: images.length === 0,
  })
  uploaded.value = null
  normalizeImages()
}
function uploadedValue(fileId?: string | number | null, url?: string) {
  if (!fileId) return null
  return {
    fileId,
    url: resolveFileUrl(url || ''),
    path: '',
  } satisfies UploadedFile
}
function variantUploadValue(variant: ProductVariant) {
  return uploadedValue(variant.imageFileId, variant.imageUrl)
}
function assignVariantImage(variant: ProductVariant, file: UploadedFile) {
  variant.imageFileId = String(file.fileId)
  variant.imageUrl = file.url || file.path
}
function clearVariantImage(variant: ProductVariant) {
  variant.imageFileId = ''
  variant.imageUrl = ''
}
function removeImage(index: number) {
  const images = ensureImages()
  images.splice(index, 1)
  normalizeImages()
}
function setPrimaryImage(index: number, value: boolean) {
  const images = ensureImages()
  if (!value) {
    const image = images[index]
    if (image) image.isPrimary = false
    normalizeImages()
    return
  }

  images.forEach((image, imageIndex) => {
    image.isPrimary = imageIndex === index
  })
  normalizeImages()
}
function normalizeImages() {
  const images = ensureImages()
  const primaryIndex = images.findIndex((image) => image.isPrimary)
  images.forEach((image, index) => {
    image.sortOrder = index
    image.isPrimary = primaryIndex === -1 ? index === 0 : index === primaryIndex
    if (image.isPrimary) {
      image.imageType = 'MAIN'
    } else if (!image.imageType || image.imageType === 'MAIN') {
      image.imageType = 'GALLERY'
    }
  })
}
function variantSelectValue(variant: ProductVariant) {
  if (variant.id) return `id:${variant.id}`
  if (variant.clientId) return `client:${variant.clientId}`
  return ''
}
function skuVariantValue(sku: ProductSku) {
  if (sku.variantId) return `id:${sku.variantId}`
  if (sku.variantClientId) return `client:${sku.variantClientId}`
  return ''
}
function selectSkuVariant(sku: ProductSku, value: string) {
  sku.variantClientId = undefined
  sku.variantId = undefined

  if (value.startsWith('client:')) {
    sku.variantClientId = value.slice('client:'.length)
    return
  }

  if (value.startsWith('id:')) {
    sku.variantId = value.slice('id:'.length)
  }
}
function trimText(value?: string | null) {
  return (value || '').trim()
}
function numberOrZero(value: unknown) {
  const numericValue = Number(value)
  return Number.isFinite(numericValue) ? numericValue : 0
}
function validateProduct() {
  const msg =
    required(form.name, 'Name') ||
    required(form.slug, 'Slug') ||
    required(form.categoryId, 'Category ID')
  if (msg) return msg

  const skus = ensureSkus()
  if (!skus.length) return 'Cần có ít nhất 1 SKU.'

  for (const [index, variant] of variantList.value.entries()) {
    const label = `Variant #${index + 1}`
    if (!trimText(variant.name)) return `${label}: Name là bắt buộc.`
    if (!trimText(variant.colorId)) return `${label}: Color là bắt buộc.`
  }

  const skuCodes = new Set<string>()
  for (const [index, sku] of skus.entries()) {
    const label = `SKU #${index + 1}`
    const skuCode = trimText(sku.skuCode)
    const sizeId = trimText(sku.sizeId)
    const price = numberOrZero(sku.price)
    const stock = numberOrZero(sku.stock)
    const salePrice =
      sku.salePrice === null || sku.salePrice === undefined ? null : Number(sku.salePrice)

    if (!skuCode) return `${label}: SKU code là bắt buộc.`
    if (!sizeId) return `${label}: Size là bắt buộc.`
    if (variantList.value.length && !skuVariantValue(sku)) return `${label}: Variant là bắt buộc.`
    if (skuCodes.has(skuCode)) return `SKU code "${skuCode}" bị trùng.`
    if (price < 0) return `${label}: Price phải >= 0.`
    if (stock < 0) return `${label}: Stock phải >= 0.`
    if (salePrice !== null && salePrice > price) return `${label}: Sale price phải <= price.`
    skuCodes.add(skuCode)
  }

  if (ensureImages().filter((image) => image.isPrimary).length > 1) {
    return 'Chỉ được có một ảnh Primary.'
  }

  return ''
}
function buildPayload(): ProductPayload {
  normalizeImages()
  return {
    ...form,
    name: trimText(form.name),
    slug: trimText(form.slug),
    shortDescription: trimText(form.shortDescription),
    brandId: form.brandId || null,
    gender: form.gender || 'UNISEX',
    featuredOrder: numberOrZero(form.featuredOrder),
    images: ensureImages().map((image, index) => ({
      fileId: image.fileId,
      altText: trimText(image.altText),
      imageType: image.isPrimary ? 'MAIN' : 'GALLERY',
      sortOrder: index,
      isPrimary: Boolean(image.isPrimary),
    })),
    variants: ensureVariants().map((variant, index) => ({
      id: variant.id || null,
      clientId: variant.clientId || crypto.randomUUID(),
      name: trimText(variant.name),
      colorId: trimText(variant.colorId),
      imageFileId: variant.imageFileId || null,
      status: variant.status || 'ACTIVE',
      sortOrder: numberOrZero(variant.sortOrder ?? index),
    })),
    skus: ensureSkus().map((sku) => ({
      id: sku.id || null,
      variantId: sku.variantId || null,
      variantClientId: sku.variantClientId || null,
      skuCode: trimText(sku.skuCode),
      sizeId: trimText(sku.sizeId),
      price: numberOrZero(sku.price),
      salePrice:
        sku.salePrice === null || sku.salePrice === undefined ? null : Number(sku.salePrice),
      stock: numberOrZero(sku.stock),
      status: sku.status || 'ACTIVE',
    })),
  }
}
function goBack() {
  void router.push({ name: 'admin-products' })
}

async function save() {
  const msg = validateProduct()
  if (msg) {
    error.value = msg
    return
  }
  saving.value = true
  error.value = ''
  try {
    const payload = buildPayload()
    if (isEdit.value) await productApi.update(String(route.params.id), payload)
    else await productApi.create(payload)
    if (isEdit.value) reset(await productApi.adminDetail(String(route.params.id)))
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
