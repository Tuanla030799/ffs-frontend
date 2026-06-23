<template>
  <div class="product-filter-sidebar divide-y divide-black/10 pr-2">
    <UiAccordion :default-open="true" title="Danh mục">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!categoryId?.length"
          label="Tất cả sản phẩm"
          @update:model-value="clearFilter($event, 'categoryId')"
        />

        <UiCheckbox
          v-for="category in categories"
          :key="category.id"
          :model-value="categoryId?.includes(category.id)"
          :label="category.name"
          @update:model-value="toggleFilter($event, 'categoryId', category.id)"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="true" title="Thương hiệu">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!brandId?.length"
          label="Tất cả thương hiệu"
          @update:model-value="clearFilter($event, 'brandId')"
        />

        <UiCheckbox
          v-for="brand in brands"
          :key="brand.id"
          :model-value="brandId?.includes(brand.id)"
          :label="brand.name"
          @update:model-value="toggleFilter($event, 'brandId', brand.id)"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="false" title="Giới tính">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!gender?.length"
          label="Tất cả"
          @update:model-value="clearFilter($event, 'gender')"
        />

        <UiCheckbox
          v-for="item in genders"
          :key="item.value"
          :model-value="gender?.includes(item.value)"
          :label="item.label"
          @update:model-value="toggleFilter($event, 'gender', item.value)"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="false" title="Size">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!size?.length"
          label="Tất cả size"
          @update:model-value="clearFilter($event, 'size')"
        />

        <UiCheckbox
          v-for="item in sizes"
          :key="item.id || item.value"
          :model-value="size?.includes(item.value)"
          :label="item.label"
          @update:model-value="toggleFilter($event, 'size', item.value)"
        />
      </div>
    </UiAccordion>

    <UiAccordion :default-open="false" title="Màu sắc">
      <div class="space-y-3 pt-1 pb-5">
        <UiCheckbox
          :model-value="!color?.length"
          label="Tất cả màu"
          @update:model-value="clearFilter($event, 'color')"
        />

        <UiCheckbox
          v-for="item in colors"
          :key="item.id || item.value"
          :model-value="color?.includes(item.value)"
          :label="item.label"
          @update:model-value="toggleFilter($event, 'color', item.value)"
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
import { UiAccordion, UiCheckbox } from '@/components/ui'
import type {
  MasterDataColorOption,
  MasterDataEntity,
  MasterDataOption,
} from '@/modules/shared/master-data/types'

const props = defineProps<{
  categoryId?: string[]
  brandId?: string[]
  gender?: string[]
  size?: string[]
  color?: string[]
  minPrice?: number
  maxPrice?: number
  categories?: MasterDataEntity[]
  brands?: MasterDataEntity[]
  genders?: MasterDataOption[]
  sizes?: MasterDataOption[]
  colors?: MasterDataColorOption[]
}>()

const emit = defineEmits<{
  'update:categoryId': [value: string[]]
  'update:brandId': [value: string[]]
  'update:gender': [value: string[]]
  'update:size': [value: string[]]
  'update:color': [value: string[]]
  'update:minPrice': [value?: number]
  'update:maxPrice': [value?: number]
}>()

type MultiFilterKey = 'categoryId' | 'brandId' | 'gender' | 'size' | 'color'

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

function updateFilter(key: MultiFilterKey, value: string[]) {
  if (key === 'categoryId') emit('update:categoryId', value)
  if (key === 'brandId') emit('update:brandId', value)
  if (key === 'gender') emit('update:gender', value)
  if (key === 'size') emit('update:size', value)
  if (key === 'color') emit('update:color', value)
}

function toggleFilter(checked: boolean, key: MultiFilterKey, value: string) {
  const currentValue = props[key] || []
  const nextValue = checked
    ? [...new Set([...currentValue, value])]
    : currentValue.filter((item) => item !== value)

  updateFilter(key, nextValue)
}

function clearFilter(checked: boolean, key: MultiFilterKey) {
  if (checked) updateFilter(key, [])
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
