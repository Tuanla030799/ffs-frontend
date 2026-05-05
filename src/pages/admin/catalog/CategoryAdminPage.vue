<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý category"
    description="Danh mục sản phẩm có phân cấp, sort order và trạng thái hiển thị."
    :loading="loading"
    :error="error || masterError"
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
      <UiForm as="form" class="grid gap-3 md:grid-cols-2" @submit.prevent="save">
        <UiInput
          v-model="form.name"
          class="rounded-xl border border-slate-200 p-3"
          placeholder="Name"
          required
          label="Name"
        />
        <UiInput
          v-model="form.slug"
          class="rounded-xl border border-slate-200 p-3"
          placeholder="Slug"
          required
          label="Slug"
        />
        <UiSelect
          :model-value="form.parentId || ''"
          class="rounded-xl border border-slate-200 p-3"
          label="Parent category"
          @update:model-value="form.parentId = $event || null"
        >
          <option value="">Không có parent</option>
          <option
            v-for="option in parentOptions"
            :key="option.id"
            :value="option.id"
            :disabled="option.disabled"
          >
            {{ option.label }}
          </option>
        </UiSelect>
        <UiSelect
          v-model="form.status"
          class="rounded-xl border border-slate-200 p-3"
          label="Trạng thái"
        >
          <option v-for="status in commonStatuses" :key="status.value" :value="status.value">
            {{ status.label }}
          </option>
        </UiSelect>
        <UiInput
          v-model.number="form.sortOrder"
          class="rounded-xl border border-slate-200 p-3"
          placeholder="Sort order"
          label="Sort order"
        />
        <UiTextarea
          v-model="form.description"
          class="rounded-xl border border-slate-200 p-3 md:col-span-2"
          placeholder="Description"
          label="Description"
        />
        <div class="flex justify-end gap-2 md:col-span-2">
          <UiButton native-type="button" variant="secondary" @click="editing = null">
            Cancel
          </UiButton>
          <UiButton native-type="submit" variant="dark"> Save </UiButton>
        </div>
      </UiForm>
    </template>

    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      density="sm"
      sticky-header
      striped
      row-key="id"
      min-width="min-w-[760px]"
      empty-text="Không có category."
    >
      <template #cell-name="{ row }">
        <span class="font-bold text-slate-950">{{ row.name }}</span>
      </template>
      <template #cell-parentId="{ row }">{{ parentName(row.parentId) }}</template>
      <template #cell-status="{ row }"
        ><span :class="badgeClass(row.status)">{{ row.status }}</span></template
      >
      <template #cell-actions="{ row }">
        <div class="space-x-3">
          <UiButton variant="ghost" @click="openEdit(row)"> Edit </UiButton>
          <UiButton variant="danger" @click="deleting = row"> Delete </UiButton>
        </div>
      </template>
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { UiButton, UiForm, UiInput, UiSelect, UiTable, UiTextarea } from '@/components/ui'
import { computed, onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { categoryApi } from '@/modules/catalog/category/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import type { Category, CategoryPayload } from '@/modules/catalog/category/types'

const rows = ref<Category[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<Category | 'new' | null>(null)
const deleting = ref<Category | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<CategoryPayload>({
  name: '',
  slug: '',
  parentId: null,
  description: '',
  status: 'ACTIVE',
  sortOrder: 0,
})
const { data: masterData, error: masterError, load: loadMasterData } = useMasterData('admin')
const commonStatuses = computed(
  () =>
    masterData.value?.commonStatuses || [
      { value: 'ACTIVE', label: 'ACTIVE' },
      { value: 'INACTIVE', label: 'INACTIVE' },
    ],
)
const currentCategoryId = computed(() =>
  editing.value && editing.value !== 'new' ? editing.value.id : '',
)
const categoryById = computed(() => new Map(rows.value.map((row) => [row.id, row])))
const parentOptions = computed(() => {
  const childrenByParent = new Map<string, Category[]>()
  for (const row of rows.value) {
    const parentKey =
      row.parentId && rows.value.some((candidate) => candidate.id === row.parentId)
        ? row.parentId
        : ''
    childrenByParent.set(parentKey, [...(childrenByParent.get(parentKey) || []), row])
  }

  for (const children of childrenByParent.values()) {
    children.sort(
      (left, right) =>
        Number(left.sortOrder || 0) - Number(right.sortOrder || 0) ||
        left.name.localeCompare(right.name),
    )
  }

  const options: Array<{ id: string; label: string; disabled: boolean }> = []
  const walk = (parentId: string, depth: number) => {
    for (const row of childrenByParent.get(parentId) || []) {
      options.push({
        id: row.id,
        label: `${'-- '.repeat(depth)}${row.name}`,
        disabled: isCurrentOrDescendant(row.id),
      })
      walk(row.id, depth + 1)
    }
  }

  walk('', 0)
  return options
})
const columns = [
  { key: 'name', label: 'Name' },
  { key: 'slug', label: 'Slug' },
  { key: 'parentId', label: 'Parent' },
  { key: 'status', label: 'Status' },
  { key: 'sortOrder', label: 'Sort' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

function badgeClass(status: string) {
  return status === 'ACTIVE'
    ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
    : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}

function parentName(parentId?: string | null) {
  return parentId ? categoryById.value.get(parentId)?.name || parentId : '-'
}

function isCurrentOrDescendant(categoryId: string) {
  const currentId = currentCategoryId.value
  if (!currentId) return false
  if (categoryId === currentId) return true

  let parentId = categoryById.value.get(categoryId)?.parentId || ''
  const visited = new Set<string>()
  while (parentId && !visited.has(parentId)) {
    if (parentId === currentId) return true
    visited.add(parentId)
    parentId = categoryById.value.get(parentId)?.parentId || ''
  }

  return false
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
    rows.value = (
      await categoryApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })
    ).items
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

onMounted(async () => {
  await Promise.allSettled([loadMasterData(), load()])
})
</script>
