<template>
  <UiForm as="form" layout="none" class="space-y-7" @submit.prevent="$emit('search')">
    <UiInput
      :model-value="keyword"
      placeholder="Tìm kiếm"
      @update:model-value="$emit('update:keyword', String($event))"
    />

    <section class="border-b border-black/10 pb-5">
      <h2 class="mb-3 text-base font-bold text-black">Danh mục</h2>
      <div class="space-y-2">
        <button
          :class="filterButtonClass(!categorySlug)"
          type="button"
          @click="$emit('update:categorySlug', '')"
        >
          Tất cả sản phẩm
        </button>
        <button
          v-for="category in categories"
          :key="category.id"
          :class="filterButtonClass(categorySlug === category.slug)"
          type="button"
          @click="$emit('update:categorySlug', category.slug)"
        >
          {{ category.name }}
        </button>
      </div>
    </section>

    <section class="border-b border-black/10 pb-5">
      <h2 class="mb-3 text-base font-bold text-black">Thương hiệu</h2>
      <div class="space-y-2">
        <button
          :class="filterButtonClass(!brandSlug)"
          type="button"
          @click="$emit('update:brandSlug', '')"
        >
          Tất cả brand
        </button>
        <button
          v-for="brand in brands"
          :key="brand.id"
          :class="filterButtonClass(brandSlug === brand.slug)"
          type="button"
          @click="$emit('update:brandSlug', brand.slug)"
        >
          {{ brand.name }}
        </button>
      </div>
    </section>

    <section class="border-b border-black/10 pb-5">
      <h2 class="mb-3 text-base font-bold text-black">Giới tính</h2>
      <div class="space-y-2">
        <button
          :class="filterButtonClass(!gender)"
          type="button"
          @click="$emit('update:gender', '')"
        >
          Tất cả
        </button>
        <button
          v-for="item in genders"
          :key="item.value"
          :class="filterButtonClass(gender === item.value)"
          type="button"
          @click="$emit('update:gender', item.value)"
        >
          {{ item.label }}
        </button>
      </div>
    </section>

    <section class="border-b border-black/10 pb-5">
      <h2 class="mb-3 text-base font-bold text-black">Size</h2>
      <UiInput
        :model-value="size"
        placeholder="Ví dụ: 42"
        @update:model-value="$emit('update:size', String($event))"
      />
    </section>

    <section class="border-b border-black/10 pb-5">
      <h2 class="mb-3 text-base font-bold text-black">Colour</h2>
      <UiInput
        :model-value="color"
        placeholder="Black, White..."
        @update:model-value="$emit('update:color', String($event))"
      />
    </section>

    <section class="border-b border-black/10 pb-5">
      <h2 class="mb-3 text-base font-bold text-black">Shop By Price</h2>
      <div class="grid grid-cols-2 gap-2">
        <UiInput
          :model-value="minPrice"
          type="number"
          placeholder="Từ"
          @update:model-value="$emit('update:minPrice', Number($event) || undefined)"
        />
        <UiInput
          :model-value="maxPrice"
          type="number"
          placeholder="Đến"
          @update:model-value="$emit('update:maxPrice', Number($event) || undefined)"
        />
      </div>
    </section>

    <div class="grid gap-2">
      <UiButton native-type="submit" variant="dark">Áp dụng</UiButton>
      <UiButton native-type="button" variant="secondary" @click="$emit('reset')">Xóa lọc</UiButton>
    </div>
  </UiForm>
</template>

<script setup lang="ts">
import { UiButton, UiForm, UiInput } from '@/components/ui'
import type { MasterDataEntity, MasterDataOption } from '@/modules/shared/master-data/types'

defineProps<{
  keyword?: string
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
}>()

defineEmits<{
  search: []
  reset: []
  'update:keyword': [value: string]
  'update:categorySlug': [value: string]
  'update:brandSlug': [value: string]
  'update:gender': [value: string]
  'update:size': [value: string]
  'update:color': [value: string]
  'update:minPrice': [value?: number]
  'update:maxPrice': [value?: number]
}>()

function filterButtonClass(active: boolean) {
  return [
    'block w-full text-left text-sm leading-6 transition hover:text-black',
    active ? 'font-bold text-black' : 'font-medium text-black/70',
  ]
}
</script>
