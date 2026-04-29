<template>
  <section class="space-y-4">
    <div class="flex flex-wrap items-center justify-between gap-3">
      <div>
        <h2 class="text-2xl font-black text-slate-950">{{ title }}</h2>
        <p
          v-if="description"
          class="mt-1 text-sm text-slate-500"
        >
          {{ description }}
        </p>
      </div>
      <div class="flex gap-2">
        <button
          type="button"
          class="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-bold text-slate-700 hover:bg-slate-50"
          @click="$emit('reload')"
        >
          Reload
        </button>
        <button
          v-if="createLabel"
          type="button"
          class="rounded-xl bg-slate-950 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
          @click="$emit('create')"
        >
          {{ createLabel }}
        </button>
      </div>
    </div>

    <form
      v-if="searchable || statusFilter"
      class="grid gap-3 rounded-2xl border border-slate-200 bg-white p-3 md:grid-cols-[minmax(220px,1fr)_180px_auto]"
      @submit.prevent="$emit('search')"
    >
      <input
        v-if="searchable"
        :value="keyword"
        class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
        :placeholder="searchPlaceholder"
        @input="$emit('update:keyword', ($event.target as HTMLInputElement).value)"
      >
      <select
        v-if="statusFilter"
        :value="status"
        class="rounded-xl border border-slate-200 px-3 py-2.5 text-sm outline-none focus:border-slate-500"
        @change="$emit('update:status', ($event.target as HTMLSelectElement).value)"
      >
        <option value="">Tất cả trạng thái</option>
        <option
          v-for="option in statusOptions"
          :key="option"
          :value="option"
        >
          {{ option }}
        </option>
      </select>
      <button
        type="submit"
        class="rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 text-sm font-bold text-slate-700 hover:bg-slate-100"
      >
        Lọc
      </button>
    </form>

    <p
      v-if="error"
      class="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-700"
    >
      {{ error }}
    </p>

    <div class="overflow-hidden rounded-3xl border border-slate-200 bg-white">
      <div
        v-if="loading"
        class="p-8 text-center text-sm font-semibold text-slate-500"
      >
        Loading...
      </div>
      <slot v-else />
    </div>

    <div
      v-if="showModal"
      class="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-slate-950/40 p-4"
      @mousedown.self="$emit('close')"
    >
      <div class="mt-8 w-full max-w-5xl rounded-3xl bg-white shadow-2xl">
        <div class="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <div>
            <h3 class="text-lg font-black text-slate-950">{{ modalTitle }}</h3>
            <p
              v-if="modalDescription"
              class="mt-1 text-sm text-slate-500"
            >
              {{ modalDescription }}
            </p>
          </div>
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-3 py-2 text-sm font-bold text-slate-600"
            @click="$emit('close')"
          >
            Đóng
          </button>
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
        <h3 class="text-lg font-black text-slate-950">{{ confirmTitle }}</h3>
        <p class="mt-2 text-sm text-slate-600">{{ confirmText }}</p>
        <div class="mt-5 flex justify-end gap-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 text-sm font-bold text-slate-700"
            @click="$emit('cancel-delete')"
          >
            Hủy
          </button>
          <button
            type="button"
            class="rounded-xl bg-red-600 px-4 py-2 text-sm font-bold text-white"
            @click="$emit('confirm-delete')"
          >
            Xóa
          </button>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
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
}>(), {
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
})

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
