<template>
  <CrudShell title="Quản lý category" :loading="loading" :error="error" @create="openCreate" @reload="load">
    <template #form v-if="editing"><form class="grid gap-3 rounded-3xl border bg-white p-4 md:grid-cols-2" @submit.prevent="save"><input v-model="form.name" class="rounded-xl border p-3" placeholder="Name"><input v-model="form.slug" class="rounded-xl border p-3" placeholder="Slug"><input v-model="form.parentId" class="rounded-xl border p-3" placeholder="Parent ID"><select v-model="form.status" class="rounded-xl border p-3"><option>ACTIVE</option><option>INACTIVE</option></select><input v-model.number="form.sortOrder" class="rounded-xl border p-3" placeholder="Sort order"><textarea v-model="form.description" class="rounded-xl border p-3 md:col-span-2" placeholder="Description" /><div class="flex gap-2 md:col-span-2"><button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Save</button><button type="button" class="rounded-xl border px-4 py-2" @click="editing = null">Cancel</button></div></form></template>
    <table class="w-full text-left text-sm"><thead><tr class="border-b"><th class="p-3">Name</th><th>Slug</th><th>Status</th><th>Sort</th><th></th></tr></thead><tbody><tr v-for="row in rows" :key="row.id" class="border-b"><td class="p-3 font-bold">{{ row.name }}</td><td>{{ row.slug }}</td><td>{{ row.status }}</td><td>{{ row.sortOrder }}</td><td class="space-x-2 text-right"><button class="font-bold" @click="openEdit(row)">Edit</button><button class="font-bold text-red-600" @click="remove(row.id)">Delete</button></td></tr></tbody></table>
  </CrudShell>
</template>
<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { categoryApi } from '@/modules/catalog/category/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import type { Category, CategoryPayload } from '@/modules/catalog/category/types'
const rows = ref<Category[]>([]); const loading = ref(false); const error = ref(''); const editing = ref<Category | 'new' | null>(null); const form = reactive<CategoryPayload>({ name: '', slug: '', parentId: null, description: '', status: 'ACTIVE', sortOrder: 0 })
function fill(row?: Category) { form.name = row?.name || ''; form.slug = row?.slug || ''; form.parentId = row?.parentId || null; form.description = row?.description || ''; form.status = row?.status || 'ACTIVE'; form.sortOrder = row?.sortOrder || 0 }
function openCreate() { editing.value = 'new'; fill() } function openEdit(row: Category) { editing.value = row; fill(row) }
async function load() { loading.value = true; try { rows.value = (await categoryApi.adminList({ limit: 50 })).items } catch (err) { error.value = getErrorMessage(err) } finally { loading.value = false } }
async function save() { try { if (editing.value === 'new') await categoryApi.create(form); else if (editing.value) await categoryApi.update(editing.value.id, form); editing.value = null; await load() } catch (err) { error.value = getErrorMessage(err) } }
async function remove(id: string) { if (!confirm('Delete category?')) return; await categoryApi.remove(id); await load() }
onMounted(load)
</script>
