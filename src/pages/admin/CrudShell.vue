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

    <UiCard v-if="searchable || statusFilter" title="Bộ lọc" padding="sm">
      <UiForm
        as="form"
        class="grid gap-3 md:grid-cols-[minmax(220px,1fr)_180px_auto]"
        @submit.prevent="$emit('search')"
      >
        <UiInput
          v-if="searchable"
          :model-value="keyword"
          :placeholder="searchPlaceholder"
          @update:model-value="$emit('update:keyword', String($event))"
        />
        <UiSelect
          v-if="statusFilter"
          :model-value="status"
          @update:model-value="$emit('update:status', String($event))"
        >
          <option value="">Tất cả trạng thái</option>
          <option v-for="option in statusOptions" :key="option" :value="option">
            {{ option }}
          </option>
        </UiSelect>
        <UiButton> Tìm kiếm </UiButton>
      </UiForm>
    </UiCard>

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
      v>

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
    </div>
  </section>
</template>

<script setup lang="ts">
import { UiAlert, UiButton, UiCard, UiForm, UiInput, UiSelect } from '@/components/ui'
withDefaults(
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
    showModal: false,
    modalTitle: '',
    modalDescription: '',
    confirmOpen: false,
    confirmTitle: 'Xác nhận xóa',
    confirmText: 'Thao tác này không thể hoàn tác.',
  },
)

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
