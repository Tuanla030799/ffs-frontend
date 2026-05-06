<template>
  <div class="product-filter-sidebar divide-y divide-black/10 pr-2">
    <UiAccordion :default-open="true" title="Danh mục">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!categorySlug"
          label="Tất cả sản phẩm"
          @update:model-value="toggleSingle($event, 'categorySlug', '')"
        />

        <UiCheckbox
          v-for="category in categories"
          :key="category.id"
          :model-value="categorySlug === category.slug"
          :label="category.name"
          @update:model-value="toggleSingle($event, 'categorySlug', category.slug)"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="true" title="Thương hiệu">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!brandSlug"
          label="Tất cả thương hiệu"
          @update:model-value="toggleSingle($event, 'brandSlug', '')"
        />

        <UiCheckbox
          v-for="brand in brands"
          :key="brand.id"
          :model-value="brandSlug === brand.slug"
          :label="brand.name"
          @update:model-value="toggleSingle($event, 'brandSlug', brand.slug)"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="false" title="Giới tính">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!gender"
          label="Tất cả"
          @update:model-value="toggleSingle($event, 'gender', '')"
        />

        <UiCheckbox
          v-for="item in genders"
          :key="item.value"
          :model-value="gender === item.value"
          :label="item.label"
          @update:model-value="toggleSingle($event, 'gender', item.value)"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="false" title="Size">
      <div class="pt-1 pb-5">
        <SizeColorPicker
          :model-value="size"
          :options="sizes"
          title="Chọn size"
          placeholder="Tất cả size"
          value-field="value"
          clearable
          @update:model-value="emit('update:size', String($event || ''))"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="false" title="Màu sắc">
      <div class="pt-1 pb-5">
        <SizeColorPicker
          :model-value="color"
          :options="colors"
          title="Chọn màu"
          placeholder="Tất cả màu"
          variant="color"
          value-field="value"
          clearable
          @update:model-value="emit('update:color', String($event || ''))"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="false" title="Khoảng giá">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          v-for="range in priceRanges"
          :key="range.label"
          :model-value="isPriceRangeActive(range)"
          :label="range.label"
          @update:model-value="togglePriceRange($event, range)"
        />
      </div>
    </UiAccordion>
  </div>
</template>

<script setup lang="ts">
import SizeColorPicker from '@/components/common/SizeColorPicker.vue'
import { UiAccordion, UiCheckbox } from '@/components/ui'
import type {
  MasterDataColorOption,
  MasterDataEntity,
  MasterDataOption,
} from '@/modules/shared/master-data/types'

const props = defineProps<{
  categorySlug?: string
  brandSlug?: string
  gender?: string
  size?: string
  color?: string
  minPrice?: number
  maxPrice?: number
  categories?: MasterDataEntity[]
  brands?: MasterDataEntity[]
  genders?: MasterDataOption[]
  sizes?: MasterDataOption[]
  colors?: MasterDataColorOption[]
}>()

const emit = defineEmits<{
  'update:categorySlug': [value: string]
  'update:brandSlug': [value: string]
  'update:gender': [value: string]
  'update:size': [value: string]
  'update:color': [value: string]
  'update:minPrice': [value?: number]
  'update:maxPrice': [value?: number]
}>()

type SingleFilterKey = 'categorySlug' | 'brandSlug' | 'gender'

type PriceRange = {
  label: string
  min?: number
  max?: number
}

const priceRanges: PriceRange[] = [
  { label: 'Tất cả giá' },
  { label: 'Dưới 1.000.000đ', max: 1000000 },
  { label: '1.000.000đ - 2.000.000đ', min: 1000000, max: 2000000 },
  { label: '2.000.000đ - 3.000.000đ', min: 2000000, max: 3000000 },
  { label: 'Trên 3.000.000đ', min: 3000000 },
]

function toggleSingle(checked: boolean, key: SingleFilterKey, value: string) {
  if (!checked && props[key] !== value) return

  const nextValue = checked ? value : ''

  if (key === 'categorySlug') {
    emit('update:categorySlug', nextValue)
  }

  if (key === 'brandSlug') {
    emit('update:brandSlug', nextValue)
  }

  if (key === 'gender') {
    emit('update:gender', nextValue)
  }
}

function isPriceRangeActive(range: PriceRange) {
  return props.minPrice === range.min && props.maxPrice === range.max
}

function togglePriceRange(checked: boolean, range: PriceRange) {
  emit('update:minPrice', checked ? range.min : undefined)
  emit('update:maxPrice', checked ? range.max : undefined)
}
</script>

<style scoped>
.product-filter-sidebar {
  max-height: calc(100vh - var(--public-header-height) - 96px);
  overflow-y: auto;
  overscroll-behavior: contain;
  scrollbar-width: thin;
  scrollbar-color: rgb(0 0 0 / 0.28) transparent;
}

.product-filter-sidebar::-webkit-scrollbar {
  width: 6px;
}

.product-filter-sidebar::-webkit-scrollbar-track {
  background: transparent;
}

.product-filter-sidebar::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: rgb(0 0 0 / 0.28);
}

.product-filter-sidebar::-webkit-scrollbar-thumb:hover {
  background: rgb(0 0 0 / 0.4);
}

@media (max-width: 1023px) {
  .product-filter-sidebar {
    max-height: none;
    overflow: visible;
    padding-right: 0;
  }
}
</style>
