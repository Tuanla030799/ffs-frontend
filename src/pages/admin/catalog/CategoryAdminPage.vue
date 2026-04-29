<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý category"
    description="Danh mục sản phẩm có phân cấp, sort order và trạng thái hiển thị."
    :loading="loading"
    :error="error"
    :show-modal="Boolean(editing)"
    :modal-title="editing === 'new' ? 'Tạo category' : 'Cập nhật category'"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa category ${deleting?.name || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="load"
    @close="editing = null"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #form>
      <form
        class="grid gap-3 md:grid-cols-2"
        @submit.prevent="save"
      >
        <input
          v-model="form.name"
          class="rounded-xl border border-slate-200 p-3"
          placeholder="Name"
          required
        >
        <input
          v-model="form.slug"
          class="rounded-xl border border-slate-200 p-3"
          placeholder="Slug"
          required
        >
        <input
          v-model="form.parentId"
          class="rounded-xl border border-slate-200 p-3"
          placeholder="Parent ID"
        >
        <select
          v-model="form.status"
          class="rounded-xl border border-slate-200 p-3"
        >
          <option>ACTIVE</option>
          <option>INACTIVE</option>
        </select>
        <input
          v-model.number="form.sortOrder"
          class="rounded-xl border border-slate-200 p-3"
          placeholder="Sort order"
        >
        <textarea
          v-model="form.description"
          class="rounded-xl border border-slate-200 p-3 md:col-span-2"
          placeholder="Description"
        />
        <div class="flex justify-end gap-2 md:col-span-2">
          <button
            type="button"
            class="rounded-xl border border-slate-200 px-4 py-2 font-bold"
            @click="editing = null"
          >
            Cancel
          </button>
          <button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">
            Save
          </button>
        </div>
      </form>
    </template>

    <table class="w-full min-w-[760px] text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500">
        <tr>
          <th class="p-3">Name</th>
          <th>Slug</th>
          <th>Parent</th>
          <th>Status</th>
          <th>Sort</th>
          <th class="text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr
          v-if="!rows.length"
          class="border-t"
        >
          <td
            colspan="6"
            class="p-8 text-center text-slate-500"
          >
            Không có category.
          </td>
        </tr>
        <tr
          v-for="row in rows"
          :key="row.id"
          class="border-t"
        >
          <td class="p-3 font-bold text-slate-950">{{ row.name }}</td>
          <td>{{ row.slug }}</td>
          <td class="text-slate-500">{{ row.parentId || '-' }}</td>
          <td><span :class="badgeClass(row.status)">{{ row.status }}</span></td>
          <td>{{ row.sortOrder }}</td>
          <td class="space-x-3 text-right">
            <button
              class="font-bold text-slate-700"
              @click="openEdit(row)"
            >
              Edit
            </button>
            <button
              class="font-bold text-red-600"
              @click="deleting = row"
            >
              Delete
            </button>
          </td>
        </tr>
      </tbody>
    </table>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { categoryApi } from '@/modules/catalog/category/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { Category, CategoryPayload } from '@/modules/catalog/category/types'

const rows = ref<Category[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<Category | 'new' | null>(null)
const deleting = ref<Category | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<CategoryPayload>({ name: '', slug: '', parentId: null, description: '', status: 'ACTIVE', sortOrder: 0 })

function badgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
    : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}

function fill(row?: Category) {
  form.name = row?.name || ''
  form.slug = row?.slug || ''
  form.parentId = row?.parentId || null
  form.description = row?.description || ''
  form.status = row?.status || 'ACTIVE'
  form.sortOrder = row?.sortOrder || 0
}

function openCreate() {
  editing.value = 'new'
  fill()
}

function openEdit(row: Category) {
  editing.value = row
  fill(row)
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    rows.value = (await categoryApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })).items
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

async function save() {
  try {
    if (editing.value === 'new') await categoryApi.create(form)
    else if (editing.value) await categoryApi.update(editing.value.id, form)
    editing.value = null
    await load()
  } catch (err) {
    error.value = getErrorMessage(err)
  }
}

async function confirmRemove() {
  if (!deleting.value) return
  await categoryApi.remove(deleting.value.id)
  deleting.value = null
  await load()
}

onMounted(load)
</script>
