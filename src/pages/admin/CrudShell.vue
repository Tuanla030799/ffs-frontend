<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-black text-slate-950">
          {{ title }}
        </h2>
        <p v-if="description" class="mt-1 text-sm text-slate-500">
          {{ description }}
        </p>
      </div>
      <div class="flex gap-2">
        <UiButton native-type="button" variant="secondary" size="sm" @click="$emit('reload')">
          Reload
        </UiButton>
        <UiButton
          v-if="createLabel"
          native-type="button"
          variant="dark"
          size="sm"
          @click="$emit('create')"
        >
          {{ createLabel }}
        </UiButton>
      </div>
    </div>

    <FilterForm
      v-if="showFilters"
      :keyword="keyword"
      :status="status"
      :searchable="searchable"
      :status-filter="statusFilter"
      :search-placeholder="searchPlaceholder"
      :status-options="statusOptions"
      :class="filterClass"
      @update:keyword="$emit('update:keyword', $event)"
      @update:status="$emit('update:status', $event)"
      @search="$emit('search')"
    >
      <slot name="filters" />
    </FilterForm>

    <UiAlert v-if="error" variant="error">
      {{ error }}
    </UiAlert>

    <slot />

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4"
      @mousedown.self="$emit('close')"
    >
      <div class="mt-8 w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 class="text-lg font-black text-slate-950">
              {{ modalTitle }}
            </h3>
            <p v-if="modalDescription" class="mt-1 text-sm text-slate-500">
              {{ modalDescription }}
            </p>
          </div>
          <UiButton native-type="button" variant="secondary" size="sm" @click="$emit('close')">
            Đóng
          </UiButton>
        </div>
        <div class="p-5">
          <slot name="form" />
        </div>
      </div>
    </div>

    <div
      v-if="confirmOpen"
      class="fixed inset-0 z-[60] grid place-items-center bg-slate-950/40 p-4"
    >
      <div class="w-full max-w-md rounded-3xl bg-white p-5 shadow-2xl">
        <h3 class="text-lg font-black text-slate-950">
          {{ confirmTitle }}
        </h3>
        <p class="mt-2 text-sm text-slate-600">
          {{ confirmText }}
        </p>
        <div class="mt-5 flex justify-end gap-2">
          <UiButton
            native-type="button"
            variant="secondary"
            size="sm"
            @click="$emit('cancel-delete')"
          >
            Hủy
          </UiButton>
          <UiButton
            native-type="button"
            variant="danger"
            size="sm"
            @click="$emit('confirm-delete')"
          >
            Xóa
          </UiButton>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
import { computed, useSlots } from 'vue'
import FilterForm from '@/components/common/FilterForm.vue'
import { UiAlert, UiButton } from '@/components/ui'
const props = withDefaults(
  defineProps<{
    title: string
    description?: string
    loading?: boolean
    error?: string
    createLabel?: string
    searchable?: boolean
    searchPlaceholder?: string
    keyword?: string
    status?: string
    statusFilter?: boolean
    statusOptions?: string[]
    filterClass?: string
    showModal?: boolean
    modalTitle?: string
    modalDescription?: string
    confirmOpen?: boolean
    confirmTitle?: string
    confirmText?: string
  }>(),
  {
    description: '',
    loading: false,
    error: '',
    createLabel: 'Create',
    searchable: true,
    searchPlaceholder: 'Tìm kiếm...',
    keyword: '',
    status: '',
    statusFilter: true,
    statusOptions: () => ['ACTIVE', 'INACTIVE'],
    filterClass: '',
    showModal: false,
    modalTitle: '',
    modalDescription: '',
    confirmOpen: false,
    confirmTitle: 'Xác nhận xóa',
    confirmText: 'Thao tác này không thể hoàn tác.',
  },
)

const slots = useSlots()
const showFilters = computed(() => props.searchable || props.statusFilter || Boolean(slots.filters))

defineEmits<{
  create: []
  reload: []
  search: []
  close: []
  'update:keyword': [value: string]
  'update:status': [value: string]
  'confirm-delete': []
  'cancel-delete': []
}>()
</script>
