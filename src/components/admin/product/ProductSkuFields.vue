<template>
  <div class="grid gap-3 sm:grid-cols-2">
    <div :data-field="errorKey('price')">
      <UiInput
        :id="ids.price"
        :model-value="sku.price"
        type="currency"
        label="Giá bán (₫)"
        required
        placeholder="VD: 1.790.000"
        :aria-invalid="invalid('price')"
        :aria-describedby="describedBy('price')"
        @update:model-value="(value) => emit('update', 'price', toNumber(value))"
      />
      <p v-if="errors[errorKey('price')]" :id="`${ids.price}-error`" :class="errorClass">
        {{ errors[errorKey('price')] }}
      </p>
    </div>

    <div :data-field="errorKey('salePrice')">
      <UiInput
        :id="ids.salePrice"
        :model-value="sku.salePrice"
        type="currency"
        label="Giá khuyến mãi (₫)"
        placeholder="Để trống nếu không giảm"
        :aria-invalid="invalid('salePrice')"
        :aria-describedby="describedBy('salePrice')"
        @update:model-value="(value) => emit('update', 'salePrice', toNumber(value))"
      />
      <p v-if="errors[errorKey('salePrice')]" :id="`${ids.salePrice}-error`" :class="errorClass">
        {{ errors[errorKey('salePrice')] }}
      </p>
      <p
        v-else-if="discountPercent"
        :id="`${ids.salePrice}-hint`"
        class="mt-1 text-xs font-semibold text-emerald-700"
      >
        Giảm {{ discountPercent }}%
      </p>
    </div>

    <div :data-field="errorKey('stock')">
      <UiInput
        :id="ids.stock"
        :model-value="sku.stock"
        type="currency"
        label="Tồn kho"
        required
        placeholder="VD: 3"
        :aria-invalid="invalid('stock')"
        :aria-describedby="describedBy('stock')"
        @update:model-value="(value) => emit('update', 'stock', toNumber(value))"
      />
      <p v-if="errors[errorKey('stock')]" :id="`${ids.stock}-error`" :class="errorClass">
        {{ errors[errorKey('stock')] }}
      </p>
    </div>
    <div :data-field="errorKey('skuCode')">
      <!-- Cỡ chữ đặt ở khối cha: rule `button { font: inherit }` trong style.css đè class trên button. -->
      <div class="mb-1.5 flex items-baseline justify-between gap-2 text-xs font-semibold">
        <label :for="ids.skuCode" class="text-sm font-semibold text-[var(--ui-text)]">
          Mã SKU <span class="text-[var(--ui-danger)]" aria-hidden="true">*</span>
        </label>
        <button
          v-if="!sku.skuCode.trim() && suggestedCode"
          type="button"
          class="text-[var(--ui-primary)] hover:underline focus-visible:underline focus-visible:outline-none"
          :title="`Dùng mã ${suggestedCode}`"
          @click="emit('update', 'skuCode', suggestedCode)"
        >
          Tạo tự động
        </button>
      </div>
      <UiInput
        :id="ids.skuCode"
        :model-value="sku.skuCode"
        placeholder="VD: PN5271GRY20B"
        :maxlength="64"
        autocomplete="off"
        spellcheck="false"
        aria-required="true"
        :aria-invalid="invalid('skuCode')"
        :aria-describedby="describedBy('skuCode')"
        @update:model-value="(value) => emit('update', 'skuCode', String(value ?? ''))"
      />
      <p v-if="errors[errorKey('skuCode')]" :id="`${ids.skuCode}-error`" :class="errorClass">
        {{ errors[errorKey('skuCode')] }}
      </p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useId } from 'vue'
import { UiInput } from '@/components/ui'
import {
  skuErrorKey,
  type ProductDraftErrors,
  type ProductSkuDraft,
} from '@/modules/catalog/product/form'

type SkuField = 'skuCode' | 'price' | 'salePrice' | 'stock'

const props = withDefaults(
  defineProps<{
    sku: ProductSkuDraft
    errors?: ProductDraftErrors
    suggestedCode?: string
  }>(),
  {
    errors: () => ({}),
    suggestedCode: '',
  },
)

const emit = defineEmits<{
  update: [field: SkuField, value: string | number | null]
}>()

const baseId = useId()
const ids = {
  skuCode: `${baseId}-sku-code`,
  price: `${baseId}-price`,
  salePrice: `${baseId}-sale-price`,
  stock: `${baseId}-stock`,
}
const errorClass = 'mt-1 text-xs font-semibold text-red-600'

const discountPercent = computed(() => {
  const { price, salePrice } = props.sku
  if (!price || !salePrice || salePrice >= price) return 0
  return Math.round((1 - salePrice / price) * 100)
})

function errorKey(field: SkuField) {
  return skuErrorKey(props.sku, field)
}

function invalid(field: SkuField) {
  return props.errors[errorKey(field)] ? 'true' : undefined
}

function describedBy(field: SkuField) {
  return props.errors[errorKey(field)] ? `${ids[field]}-error` : undefined
}

// Ô dạng "currency" chỉ nhận chữ số và trả về number hoặc null (khi để trống).
function toNumber(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === '') return null
  const number = Number(value)
  return Number.isFinite(number) ? number : null
}
</script>
