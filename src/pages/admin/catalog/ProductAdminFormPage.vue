<template>
  <section class="space-y-5">
    <div class="flex flex-wrap items-end justify-between gap-3">
      <div class="min-w-0">
        <NuxtLink
          to="/admin/products"
          class="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 no-underline hover:text-slate-900"
        >
          <span aria-hidden="true">←</span> Danh sách sản phẩm
        </NuxtLink>
        <h2 class="mt-1 text-2xl font-black break-words text-slate-950">{{ pageTitle }}</h2>
      </div>
      <a
        v-if="isEdit && savedSlug"
        :href="`/products/${savedSlug}`"
        target="_blank"
        rel="noopener noreferrer"
        class="text-sm font-semibold text-[var(--ui-primary)] hover:underline"
      >
        Xem trên cửa hàng ↗
      </a>
    </div>

    <UiAlert v-if="masterError" variant="warning">
      Không tải được danh mục, thương hiệu và màu: {{ masterError }}
    </UiAlert>

    <div v-if="loadingDetail" class="grid gap-5 xl:grid-cols-[minmax(0,1fr)_380px]">
      <div class="space-y-5">
        <UiSkeleton variant="block" class="h-72" />
        <UiSkeleton variant="block" class="h-80" />
      </div>
      <UiSkeleton variant="block" class="h-96" />
    </div>

    <UiAlert v-else-if="loadError" variant="error">
      <div class="flex flex-wrap items-center justify-between gap-3">
        <span>Không tải được sản phẩm: {{ loadError }}</span>
        <UiButton variant="secondary" size="sm" @click="loadDetail">Thử lại</UiButton>
      </div>
    </UiAlert>

    <form
      v-else
      novalidate
      class="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_380px]"
      @submit.prevent="save()"
    >
      <div
        v-if="serverError || errorEntries.length"
        data-field="form-errors"
        tabindex="-1"
        class="rounded-[var(--ui-radius-md)] border border-red-200 bg-[var(--ui-danger-soft)] px-4 py-3 text-sm text-[var(--ui-danger)] outline-none xl:col-span-2"
        role="alert"
      >
        <p class="font-semibold">
          {{ serverError || `Còn ${errorEntries.length} thông tin cần sửa trước khi lưu:` }}
        </p>
        <ul v-if="!serverError" class="mt-1 space-y-0.5">
          <li v-for="[key, message] in errorEntries.slice(0, 6)" :key="key">
            <button
              type="button"
              class="text-left underline-offset-2 hover:underline focus-visible:underline focus-visible:outline-none"
              @click="focusField(key)"
            >
              {{ errorLabel(key) }}: {{ message }}
            </button>
          </li>
          <li v-if="errorEntries.length > 6">và {{ errorEntries.length - 6 }} mục khác.</li>
        </ul>
      </div>

      <div class="min-w-0 space-y-5">
        <UiCard title="Thông tin sản phẩm">
          <div class="grid gap-4 md:grid-cols-2">
            <div data-field="name" class="md:col-span-2">
              <UiInput
                v-model="draft.name"
                label="Tên sản phẩm"
                required
                placeholder="VD: PANE No-gi Trainer Wolf Moon"
                :maxlength="200"
                :aria-invalid="invalid('name')"
              />
              <p v-if="fieldError('name')" :class="errorClass">{{ fieldError('name') }}</p>
            </div>

            <div data-field="categoryId">
              <UiSelect
                v-model="draft.categoryId"
                label="Danh mục"
                required
                placeholder="Chọn danh mục"
                :options="categoryOptions"
                :aria-invalid="invalid('categoryId')"
              />
              <p v-if="fieldError('categoryId')" :class="errorClass">
                {{ fieldError('categoryId') }}
              </p>
            </div>

            <div data-field="brandId">
              <UiSelect
                v-model="draft.brandId"
                label="Thương hiệu"
                placeholder="Không có thương hiệu"
                :options="brandOptions"
              />
            </div>

            <div class="md:col-span-2">
              <UiRadio v-model="draft.gender" label="Giới tính" :options="genderOptions" />
            </div>

            <div data-field="slug" class="md:col-span-2">
              <UiInput
                v-model="draft.slug"
                label="Đường dẫn"
                required
                placeholder="tu-dong-tao-theo-ten"
                :maxlength="200"
                spellcheck="false"
                :aria-invalid="invalid('slug')"
              />
              <p v-if="fieldError('slug')" :class="errorClass">{{ fieldError('slug') }}</p>
              <p v-else class="mt-1 text-xs break-all text-slate-500">
                thepocketshoes.store/products/<strong class="text-slate-700">{{
                  draft.slug || '...'
                }}</strong>
                · Tự tạo theo tên, có thể sửa.
              </p>
            </div>
          </div>
        </UiCard>

        <UiCard
          title="Màu sắc, giá và tồn kho"
          :description="
            draft.variants.length > 1
              ? 'Mỗi màu có giá và tồn kho riêng. Màu đầu tiên được chọn sẵn trên trang sản phẩm.'
              : 'Mỗi màu có giá và tồn kho riêng. Đa số sản phẩm chỉ cần một màu.'
          "
        >
          <template #extra>
            <UiButton native-type="button" variant="outline" size="sm" @click="addVariant">
              + Thêm màu
            </UiButton>
          </template>

          <p v-if="fieldError('variants')" data-field="variants" :class="errorClass">
            {{ fieldError('variants') }}
          </p>

          <div class="space-y-4">
            <article
              v-for="(variant, index) in draft.variants"
              :key="variant.key"
              :data-variant-key="variant.key"
              class="rounded-xl border border-slate-200 p-4"
              :aria-label="variantTitle(index)"
            >
              <header class="mb-4 flex flex-wrap items-center justify-between gap-3">
                <h3 class="text-sm font-bold text-slate-950">{{ variantTitle(index) }}</h3>
                <div class="flex flex-wrap items-center gap-2">
                  <UiSwitch
                    :model-value="variantActive(variant)"
                    label="Đang bán"
                    @update:model-value="(active) => setVariantActive(variant, active)"
                  />
                  <template v-if="draft.variants.length > 1">
                    <UiButton
                      native-type="button"
                      variant="ghost"
                      size="sm"
                      square
                      data-move="-1"
                      :aria-label="`Đưa ${variantTitle(index)} lên trước`"
                      title="Đưa lên trước"
                      :disabled="index === 0"
                      @click="moveVariant(index, -1)"
                    >
                      <span aria-hidden="true">↑</span>
                    </UiButton>
                    <UiButton
                      native-type="button"
                      variant="ghost"
                      size="sm"
                      square
                      data-move="1"
                      :aria-label="`Đưa ${variantTitle(index)} ra sau`"
                      title="Đưa ra sau"
                      :disabled="index === draft.variants.length - 1"
                      @click="moveVariant(index, 1)"
                    >
                      <span aria-hidden="true">↓</span>
                    </UiButton>
                    <UiButton
                      native-type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeVariant(variant)"
                    >
                      Xoá màu
                    </UiButton>
                  </template>
                </div>
              </header>

              <div class="space-y-4">
                <div :data-field="variantErrorKey(variant, 'colorId')">
                  <p class="mb-1.5 text-sm font-semibold text-[var(--ui-text)]">
                    Màu <span class="text-[var(--ui-danger)]" aria-hidden="true">*</span>
                  </p>
                  <ColorSwatchSelect
                    v-model="variant.colorId"
                    :options="colors"
                    :label="`Chọn màu cho ${variantTitle(index)}`"
                    :invalid="Boolean(fieldError(variantErrorKey(variant, 'colorId')))"
                  />
                  <p v-if="fieldError(variantErrorKey(variant, 'colorId'))" :class="errorClass">
                    {{ fieldError(variantErrorKey(variant, 'colorId')) }}
                  </p>
                </div>

                <div>
                  <UiInput
                    v-model="variant.name"
                    label="Tên phân loại"
                    :placeholder="colorLabel(variant.colorId) || 'VD: Wolf Moon, Mule 101 Black'"
                    :maxlength="120"
                  />
                  <p class="mt-1 text-xs text-slate-500">
                    Tên riêng của màu này (VD: Wolf Moon). Để trống sẽ dùng tên màu.
                  </p>
                </div>

                <div
                  v-for="sku in variant.skus"
                  :key="sku.key"
                  class="space-y-2"
                  :class="variant.skus.length > 1 && 'rounded-lg bg-slate-50 p-3'"
                >
                  <div
                    v-if="variant.skus.length > 1"
                    class="flex items-center justify-between gap-2 text-xs font-semibold text-slate-600"
                  >
                    <span>Size {{ sku.size || 'mặc định' }}</span>
                    <UiButton
                      native-type="button"
                      variant="ghost"
                      size="sm"
                      @click="removeSku(variant, sku)"
                    >
                      Xoá SKU
                    </UiButton>
                  </div>
                  <ProductSkuFields
                    :sku="sku"
                    :errors="errors"
                    :suggested-code="suggestedSkuCode(variant)"
                    @update="(field, value) => updateSku(sku, field, value)"
                  />
                </div>

                <div
                  v-if="!variant.skus.length"
                  :data-field="variantErrorKey(variant, 'skus')"
                  class="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-dashed border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-800"
                >
                  <span>Màu này chưa có giá bán và tồn kho.</span>
                  <UiButton
                    native-type="button"
                    variant="secondary"
                    size="sm"
                    @click="addSku(variant)"
                  >
                    Thêm giá và tồn kho
                  </UiButton>
                </div>

                <div>
                  <p class="mb-1.5 text-sm font-semibold text-[var(--ui-text)]">Ảnh của màu</p>
                  <VariantImageField
                    v-model="variant.image"
                    :product-images="draft.images"
                    :preview-alt="variant.name || colorLabel(variant.colorId) || 'Ảnh màu'"
                  />
                </div>
              </div>
            </article>

            <article
              v-if="draft.unassignedSkus.length"
              class="rounded-xl border border-amber-200 bg-amber-50/50 p-4"
            >
              <h3 class="text-sm font-bold text-slate-950">SKU chưa gắn màu</h3>
              <p class="mt-1 mb-3 text-xs text-slate-600">
                Dữ liệu cũ: các SKU này không thuộc màu nào nhưng vẫn được giữ khi lưu.
              </p>
              <div v-for="sku in draft.unassignedSkus" :key="sku.key" class="mt-3">
                <ProductSkuFields
                  :sku="sku"
                  :errors="errors"
                  @update="(field, value) => updateSku(sku, field, value)"
                />
              </div>
            </article>
          </div>
        </UiCard>

        <UiCard title="Mô tả">
          <UiTextarea
            v-model="draft.shortDescription"
            label="Mô tả ngắn"
            :rows="3"
            :maxlength="500"
            placeholder="1–2 câu giới thiệu điểm nổi bật của sản phẩm"
          />
          <div class="mt-1 flex items-start justify-between gap-3 text-xs text-slate-500">
            <span>
              Hiển thị trên Google và khi chia sẻ link. Để trống sẽ lấy đoạn đầu của mô tả chi tiết.
            </span>
            <span
              class="shrink-0 tabular-nums"
              :class="
                draft.shortDescription.length > SHORT_DESCRIPTION_RECOMMENDED_LENGTH &&
                'font-semibold text-amber-700'
              "
            >
              {{ draft.shortDescription.length }}/{{ SHORT_DESCRIPTION_RECOMMENDED_LENGTH }}
            </span>
          </div>
        </UiCard>

        <RichTextEditorField
          v-model="draft.descriptionHtml"
          title="Mô tả chi tiết"
          description="Nội dung hiển thị ở tab Mô tả sản phẩm trên trang sản phẩm."
          placeholder="Nhập mô tả sản phẩm..."
        />
      </div>

      <aside class="min-w-0 space-y-5">
        <UiCard title="Ảnh sản phẩm">
          <ProductImagesManager
            v-model:images="draft.images"
            v-model:uploading="imagesUploading"
            :product-name="draft.name"
          />
        </UiCard>

        <UiCard title="Hiển thị">
          <div class="space-y-4">
            <div>
              <UiSelect v-model="draft.status" label="Trạng thái" :options="statusOptions" />
              <p class="mt-1 text-xs text-slate-500">{{ statusHint }}</p>
            </div>
            <UiSwitch
              v-model="draft.isFeatured"
              label="Sản phẩm nổi bật"
              description="Hiển thị trong mục Sản phẩm nổi bật ở trang chủ."
            />
            <div v-if="draft.isFeatured" data-field="featuredOrder">
              <UiInput
                :model-value="draft.featuredOrder"
                type="currency"
                label="Thứ tự nổi bật"
                placeholder="0"
                :aria-invalid="invalid('featuredOrder')"
                @update:model-value="(value) => (draft.featuredOrder = toNumberOrNull(value))"
              />
              <p v-if="fieldError('featuredOrder')" :class="errorClass">
                {{ fieldError('featuredOrder') }}
              </p>
              <p v-else class="mt-1 text-xs text-slate-500">Số nhỏ hơn hiển thị trước.</p>
            </div>
          </div>
        </UiCard>
      </aside>

      <!-- Vùng cuộn admin có padding (p-4/sm:p-6) và sticky tính từ mép trong padding: kéo thanh
        xuống đúng bằng padding để dính sát đáy, không lộ nội dung đang cuộn bên dưới. -->
      <div
        class="sticky -bottom-4 z-20 -mx-4 border-t border-slate-200 bg-white/95 px-4 py-3 backdrop-blur sm:-bottom-6 sm:-mx-6 sm:px-6 xl:col-span-2"
      >
        <div class="flex flex-wrap items-center justify-between gap-x-3 gap-y-2">
          <p
            class="w-full text-xs sm:w-auto sm:text-sm"
            :class="actionStatus.className"
            aria-live="polite"
          >
            {{ actionStatus.text }}
          </p>
          <div class="flex w-full gap-2 sm:w-auto">
            <!-- Mobile đã có link "Danh sách sản phẩm" ở đầu trang: bỏ nút Huỷ cho thanh gọn. -->
            <div class="hidden sm:block">
              <UiButton native-type="button" variant="secondary" @click="goBack">Huỷ</UiButton>
            </div>
            <UiButton
              v-if="!isEdit"
              native-type="button"
              variant="outline"
              class="flex-1 sm:flex-none"
              :disabled="saving || imagesUploading"
              @click="save({ addAnother: true })"
            >
              Lưu &amp; thêm tiếp
            </UiButton>
            <UiButton
              native-type="submit"
              class="flex-1 sm:flex-none"
              :loading="saving"
              :disabled="imagesUploading"
              title="Ctrl/⌘ + S"
            >
              {{ isEdit ? 'Lưu thay đổi' : 'Lưu sản phẩm' }}
            </UiButton>
          </div>
        </div>
      </div>
    </form>
  </section>
</template>

<script setup lang="ts">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router'
import ColorSwatchSelect from '@/components/admin/product/ColorSwatchSelect.vue'
import ProductImagesManager from '@/components/admin/product/ProductImagesManager.vue'
import ProductSkuFields from '@/components/admin/product/ProductSkuFields.vue'
import VariantImageField from '@/components/admin/product/VariantImageField.vue'
import RichTextEditorField from '@/components/common/RichTextEditorField.vue'
import {
  UiAlert,
  UiButton,
  UiCard,
  UiInput,
  UiRadio,
  UiSelect,
  UiSkeleton,
  UiSwitch,
  UiTextarea,
} from '@/components/ui'
import { useToast } from '@/composables/useToast'
import { syncAutoSlug } from '@/lib/slug'
import { productApi } from '@/modules/catalog/product/api'
import {
  SHORT_DESCRIPTION_RECOMMENDED_LENGTH,
  createProductDraft,
  createSkuDraft,
  createVariantDraft,
  draftToPayload,
  productToDraft,
  suggestSkuCode,
  validateProductDraft,
  variantErrorKey,
  type ProductDraft,
  type ProductSkuDraft,
  type ProductVariantDraft,
} from '@/modules/catalog/product/form'
import { getErrorMessage } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import { ApiError } from '@/types/http'

const FIELD_LABELS: Record<string, string> = {
  name: 'Tên sản phẩm',
  categoryId: 'Danh mục',
  slug: 'Đường dẫn',
  variants: 'Màu sắc, giá và tồn kho',
  featuredOrder: 'Thứ tự nổi bật',
}
const SKU_FIELD_LABELS: Record<string, string> = {
  skuCode: 'Mã SKU',
  price: 'Giá bán',
  salePrice: 'Giá khuyến mãi',
  stock: 'Tồn kho',
}
const STATUS_HINTS: Record<string, string> = {
  ACTIVE: 'Khách xem và đặt mua được ngay sau khi lưu.',
  DRAFT: 'Bản nháp: chưa hiển thị trên cửa hàng.',
  INACTIVE: 'Đang ẩn khỏi cửa hàng.',
}
const errorClass = 'mt-1 text-xs font-semibold text-red-600'

const route = useRoute()
const router = useRouter()
const toast = useToast()
const productId = computed(() => String(route.params.id || ''))
const isEdit = computed(() => Boolean(productId.value))

const { data: masterData, load: loadMasterData } = useMasterData('admin')
const draft = ref<ProductDraft>(createProductDraft())
// So với bản đã lưu/đã tải để biết form có thay đổi chưa lưu hay không.
const savedSnapshot = ref(JSON.stringify(draft.value))
const savedSlug = ref('')
const savedName = ref('')
const loadingDetail = ref(isEdit.value)
const loadError = ref('')
const masterError = ref('')
const saving = ref(false)
// Chỉ hiện lỗi sau lần bấm lưu đầu tiên; sau đó lỗi cập nhật ngay khi người dùng sửa.
const submitted = ref(false)
const serverError = ref('')
const serverFieldErrors = ref<Record<string, string>>({})
const imagesUploading = ref(false)

const colors = computed(() => masterData.value?.colors || [])
const categoryOptions = computed(() =>
  (masterData.value?.categories || []).map((category) => ({
    label: category.status === 'ACTIVE' ? category.name : `${category.name} (đang ẩn)`,
    value: category.id,
  })),
)
const brandOptions = computed(() =>
  (masterData.value?.brands || []).map((brand) => ({
    label: brand.status === 'ACTIVE' ? brand.name : `${brand.name} (đang ẩn)`,
    value: brand.id,
  })),
)
const genderOptions = computed(() =>
  (masterData.value?.productGenders || []).map((gender) => ({
    label: gender.label,
    value: gender.value,
  })),
)
const statusOptions = computed(() =>
  (masterData.value?.productStatuses || []).map((status) => ({
    label: status.label,
    value: status.value,
  })),
)
const statusHint = computed(() => STATUS_HINTS[draft.value.status] || '')

const errors = computed(() => ({
  ...serverFieldErrors.value,
  ...(submitted.value ? validateProductDraft(draft.value) : {}),
}))
const errorEntries = computed(() => Object.entries(errors.value))
const dirty = computed(() => JSON.stringify(draft.value) !== savedSnapshot.value)
const pageTitle = computed(() =>
  isEdit.value ? `Sửa sản phẩm${savedName.value ? `: ${savedName.value}` : ''}` : 'Thêm sản phẩm',
)
const actionStatus = computed(() => {
  if (imagesUploading.value) return { text: 'Đang tải ảnh lên...', className: 'text-slate-600' }
  if (errorEntries.value.length) {
    return {
      text: `Còn ${errorEntries.value.length} thông tin cần sửa.`,
      className: 'font-semibold text-red-600',
    }
  }
  if (dirty.value)
    return { text: 'Có thay đổi chưa lưu.', className: 'font-semibold text-amber-700' }
  return {
    text: isEdit.value ? 'Chưa có thay đổi.' : 'Điền thông tin rồi bấm Lưu sản phẩm.',
    className: 'text-slate-500',
  }
})

watch(
  () => draft.value.name,
  (name, previousName) => {
    draft.value.slug = syncAutoSlug(draft.value.slug, previousName, name)
  },
)
// Sửa đường dẫn sau lỗi trùng thì bỏ cả lỗi ở ô lẫn thông báo chung phía trên.
watch(
  () => draft.value.slug,
  () => {
    if (!serverFieldErrors.value.slug) return
    serverFieldErrors.value = {}
    serverError.value = ''
  },
)

function fieldError(key: string) {
  return errors.value[key] || ''
}

function invalid(key: string) {
  return errors.value[key] ? 'true' : undefined
}

function colorLabel(colorId: string) {
  const color = colors.value.find((item) => (item.id || item.value) === colorId)
  return color?.label || color?.value || ''
}

function variantTitle(index: number) {
  const variant = draft.value.variants[index]
  const label = variant ? colorLabel(variant.colorId) : ''
  if (draft.value.variants.length === 1) return label ? `Phân loại · ${label}` : 'Phân loại'
  return label ? `Màu ${index + 1} · ${label}` : `Màu ${index + 1}`
}

function errorLabel(key: string) {
  if (FIELD_LABELS[key]) return FIELD_LABELS[key]

  const [type, itemKey, field = ''] = key.split('.')
  if (type === 'variant') {
    const index = draft.value.variants.findIndex((variant) => variant.key === itemKey)
    return `${variantTitle(Math.max(index, 0))} · ${field === 'colorId' ? 'Màu' : 'Giá và tồn kho'}`
  }
  if (type === 'sku') {
    const index = draft.value.variants.findIndex((variant) =>
      variant.skus.some((sku) => sku.key === itemKey),
    )
    const owner = index >= 0 ? variantTitle(index) : 'SKU chưa gắn màu'
    return `${owner} · ${SKU_FIELD_LABELS[field] || field}`
  }
  return key
}

// Chỉ cuộn vùng nội dung admin: `scrollIntoView` cuộn cả <html> (đang overflow hidden) khiến
// layout bị lệch mà người dùng không cuộn lại được.
function scrollToCenter(element: HTMLElement) {
  const scroller = element.closest<HTMLElement>('.admin-layout-main')
  if (!scroller) return
  const elementRect = element.getBoundingClientRect()
  const scrollerRect = scroller.getBoundingClientRect()
  const top =
    scroller.scrollTop +
    (elementRect.top - scrollerRect.top) -
    (scroller.clientHeight - elementRect.height) / 2
  scroller.scrollTo({ top: Math.max(top, 0), behavior: 'smooth' })
}

// Cuộn tới và focus vào ô đang lỗi (ô đầu tiên trong khối `data-field` tương ứng). Khối không có
// ô nào (thông báo lỗi chung) thì focus chính khối đó để người dùng bàn phím không bị mất vị trí.
async function focusField(key: string) {
  await nextTick()
  const container = document.querySelector<HTMLElement>(`[data-field="${CSS.escape(key)}"]`)
  if (!container) return
  scrollToCenter(container)
  const control = container.querySelector<HTMLElement>(
    'input:not([type="hidden"]):not([disabled]), select, textarea, button:not([disabled])',
  )
  const target = control ?? (container.hasAttribute('tabindex') ? container : null)
  target?.focus({ preventScroll: true })
}

function suggestedSkuCode(variant: ProductVariantDraft) {
  if (!draft.value.slug) return ''
  // Một màu thì đường dẫn đã đủ phân biệt; nhiều màu thì thêm tên màu.
  return suggestSkuCode(
    draft.value.slug,
    draft.value.variants.length > 1 ? colorLabel(variant.colorId) : '',
  )
}

function addVariant() {
  const variant = createVariantDraft()
  draft.value.variants.push(variant)
  void focusField(variantErrorKey(variant, 'colorId'))
}

function variantHasData(variant: ProductVariantDraft) {
  return Boolean(
    variant.id ||
    variant.name ||
    variant.colorId ||
    variant.image ||
    variant.skus.some((sku) => sku.id || sku.skuCode || sku.price || sku.stock),
  )
}

function removeVariant(variant: ProductVariantDraft) {
  const label = variant.name || colorLabel(variant.colorId) || 'này'
  if (variantHasData(variant) && !window.confirm(`Xoá màu ${label} cùng giá và tồn kho của nó?`)) {
    return
  }
  draft.value.variants = draft.value.variants.filter((item) => item.key !== variant.key)
}

function addSku(variant: ProductVariantDraft) {
  variant.skus.push(createSkuDraft())
}

function removeSku(variant: ProductVariantDraft, sku: ProductSkuDraft) {
  variant.skus = variant.skus.filter((item) => item.key !== sku.key)
}

function updateSku(sku: ProductSkuDraft, field: string, value: string | number | null) {
  if (field === 'skuCode') sku.skuCode = String(value ?? '')
  else if (field === 'price' || field === 'salePrice' || field === 'stock') {
    sku[field] = typeof value === 'number' ? value : null
  }
}

// Cửa hàng chỉ trả về màu và SKU đang ACTIVE: chỉ coi là "Đang bán" khi cả hai cùng ACTIVE, để dữ
// liệu cũ lệch trạng thái không hiện là đang bán trong khi khách không mua được.
function variantActive(variant: ProductVariantDraft) {
  return variant.status === 'ACTIVE' && variant.skus.every((sku) => sku.status === 'ACTIVE')
}

// Màu đầu tiên được chọn sẵn trên trang sản phẩm. Sau khi đổi chỗ, Vue di chuyển khối màu nên nút
// đang focus bị mất focus: đưa focus về nút tương ứng ở vị trí mới.
async function moveVariant(index: number, direction: -1 | 1) {
  const target = index + direction
  const variants = [...draft.value.variants]
  const [moved] = variants.splice(index, 1)
  if (!moved || target < 0 || target > variants.length) return
  variants.splice(target, 0, moved)
  draft.value.variants = variants

  await nextTick()
  const article = document.querySelector(`[data-variant-key="${CSS.escape(moved.key)}"]`)
  const button =
    article?.querySelector<HTMLElement>(`[data-move="${direction}"]:not(:disabled)`) ??
    article?.querySelector<HTMLElement>('[data-move]:not(:disabled)')
  button?.focus()
}

// Bật/tắt bán cả màu: áp dụng cho biến thể và các SKU của nó.
function setVariantActive(variant: ProductVariantDraft, active: boolean) {
  const status = active ? 'ACTIVE' : 'INACTIVE'
  variant.status = status
  variant.skus.forEach((sku) => {
    sku.status = status
  })
}

function toNumberOrNull(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}

function resetDraft(next: ProductDraft) {
  draft.value = next
  savedSnapshot.value = JSON.stringify(next)
  submitted.value = false
  serverError.value = ''
  serverFieldErrors.value = {}
}

// "Lưu & thêm sản phẩm khác": giữ danh mục/thương hiệu/giới tính/trạng thái vì thường nhập
// nhiều sản phẩm cùng loại liên tiếp.
function startNewProduct() {
  const { categoryId, brandId, gender, status } = draft.value
  resetDraft(createProductDraft({ categoryId, brandId, gender, status }))
  document.querySelector('.admin-layout-main')?.scrollTo({ top: 0, behavior: 'smooth' })
  void focusField('name')
}

async function loadDetail() {
  loadingDetail.value = true
  loadError.value = ''
  try {
    const row = await productApi.adminDetail(productId.value)
    resetDraft(productToDraft(row))
    savedSlug.value = row.slug
    savedName.value = row.name
  } catch (err) {
    loadError.value = getErrorMessage(err)
  } finally {
    loadingDetail.value = false
  }
}

async function save(options: { addAnother?: boolean } = {}) {
  if (saving.value) return
  submitted.value = true
  serverError.value = ''
  serverFieldErrors.value = {}

  if (imagesUploading.value) {
    serverError.value = 'Ảnh đang được tải lên, vui lòng đợi tải xong rồi lưu.'
    return
  }

  const firstErrorKey = Object.keys(validateProductDraft(draft.value))[0]
  if (firstErrorKey) {
    void focusField(firstErrorKey)
    return
  }

  saving.value = true
  try {
    const payload = draftToPayload(draft.value, { colorLabel })
    if (isEdit.value) await productApi.update(productId.value, payload)
    else await productApi.create(payload)

    // Đánh dấu đã lưu trước khi chuyển trang để không hỏi "rời trang chưa lưu".
    savedSnapshot.value = JSON.stringify(draft.value)
    toast.push(payload.name, 'success', isEdit.value ? 'Đã lưu thay đổi' : 'Đã thêm sản phẩm')

    if (!isEdit.value && options.addAnother) {
      startNewProduct()
      return
    }
    await router.push({ name: 'admin-products' })
  } catch (err) {
    serverError.value = getErrorMessage(err)
    if (err instanceof ApiError && err.code === 'SLUG_ALREADY_EXISTS') {
      serverFieldErrors.value = { slug: 'Đường dẫn này đã được dùng cho sản phẩm khác.' }
    }
    void focusField(serverFieldErrors.value.slug ? 'slug' : 'form-errors')
  } finally {
    saving.value = false
  }
}

function goBack() {
  void router.push({ name: 'admin-products' })
}

function onKeydown(event: KeyboardEvent) {
  if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 's') {
    event.preventDefault()
    void save()
  }
}

function onBeforeUnload(event: BeforeUnloadEvent) {
  if (!dirty.value) return
  event.preventDefault()
  event.returnValue = ''
}

onBeforeRouteLeave(() => {
  if (!dirty.value) return true
  return window.confirm('Sản phẩm có thay đổi chưa lưu. Rời trang và bỏ các thay đổi này?')
})

onMounted(async () => {
  window.addEventListener('keydown', onKeydown)
  window.addEventListener('beforeunload', onBeforeUnload)
  try {
    // Luôn lấy master data mới: danh mục/thương hiệu/màu vừa tạo ở trang khác phải có ngay.
    await loadMasterData(true)
  } catch (err) {
    masterError.value = getErrorMessage(err)
  }
  if (isEdit.value) await loadDetail()
})

onBeforeUnmount(() => {
  window.removeEventListener('keydown', onKeydown)
  window.removeEventListener('beforeunload', onBeforeUnload)
})
</script>
