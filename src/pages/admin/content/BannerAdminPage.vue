<template>
  <CrudShell v-model:keyword="query.keyword" v-model:status="query.status" title="Quản lý landing banner" description="Hero/banner CMS cho storefront." :loading="loading" :error="error || masterError" :show-modal="Boolean(editing)" :modal-title="editing === 'new' ? 'Tạo banner' : 'Cập nhật banner'" :confirm-open="Boolean(deleting)" :confirm-text="`Xóa banner ${deleting?.title || ''}?`" @create="openCreate" @reload="load" @search="load" @close="editing = null" @cancel-delete="deleting = null" @confirm-delete="confirmRemove">
    <template #form>
      <form class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <UiInput v-model="form.title" placeholder="Title" required  label="Title"/>
        <UiInput v-model="form.subtitle" placeholder="Subtitle"  label="Subtitle"/>
        <UiInput v-model="form.linkUrl" placeholder="Link URL"  label="Link URL"/>
        <UiInput v-model="form.fileId" placeholder="File ID" required  label="File ID"/>
        <UiSelect v-model="form.status" label="Trạng thái"><option v-for="status in commonStatuses" :key="status.value" :value="status.value">{{ status.label }}</option></UiSelect>
        <UiInput v-model.number="form.sortOrder" placeholder="Sort"  label="Sort"/>
        <UiInput v-model="form.startsAt" type="datetime-local"  label="Bắt đầu"/>
        <UiInput v-model="form.endsAt" type="datetime-local"  label="Kết thúc"/>
        <div class="md:col-span-3"><FileUpload v-model="uploaded" scope="admin" accept="image/*" title="Upload banner image" @uploaded="(file) => form.fileId = String(file.fileId)" /></div>
        <div class="flex justify-end gap-2 md:col-span-3"><UiButton native-type="button" variant="secondary" @click="editing = null">Cancel</UiButton><UiButton native-type="submit" variant="dark">Save</UiButton></div>
      </form>
    </template>
    <UiTable :columns="columns" :rows="rows" :loading="loading" density="sm" sticky-header striped row-key="id" min-width="min-w-[880px]" empty-text="Không có banner.">
      <template #cell-title="{ row }"><span class="font-black text-slate-950">{{ row.title }}</span><div class="text-xs font-normal text-slate-500">{{ row.subtitle }}</div></template>
      <template #cell-preview="{ row }"><img v-if="row.imageUrl" :src="resolveFileUrl(row.imageUrl)" class="h-12 w-20 rounded-lg object-cover" :alt="row.title"><span v-else>-</span></template>
      <template #cell-status="{ row }"><span :class="badgeClass(row.status)">{{ row.status }}</span></template>
      <template #cell-linkUrl="{ row }"><span class="block max-w-xs truncate">{{ row.linkUrl }}</span></template>
      <template #cell-actions="{ row }"><div class="space-x-3"><UiButton variant="ghost" @click="openEdit(row)">Edit</UiButton><UiButton variant="danger" @click="deleting = row">Delete</UiButton></div></template>
    </UiTable>
  </CrudShell>
</template>

<script setup lang="ts">
import { UiButton, UiInput, UiSelect, UiTable } from '@/components/ui'
import { computed, onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import { bannerApi } from '@/modules/content/banner/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import { resolveFileUrl } from '@/lib/fileUrl'
import type { LandingBanner, LandingBannerPayload } from '@/modules/content/banner/types'
import type { UploadedFile } from '@/services/file.service'

const rows = ref<LandingBanner[]>([])
const loading = ref(false)
const error = ref('')
const editing = ref<LandingBanner | 'new' | null>(null)
const deleting = ref<LandingBanner | null>(null)
const uploaded = ref<UploadedFile | null>(null)
const query = reactive({ keyword: '', status: '' })
const form = reactive<LandingBannerPayload>({ title: '', subtitle: '', linkUrl: '', fileId: '', status: 'ACTIVE', sortOrder: 0, startsAt: '', endsAt: '' })
const { data: masterData, error: masterError, load: loadMasterData } = useMasterData('admin')
const commonStatuses = computed(() => masterData.value?.commonStatuses || [{ value: 'ACTIVE', label: 'ACTIVE' }, { value: 'INACTIVE', label: 'INACTIVE' }])
const columns = [
  { key: 'title', label: 'Title' },
  { key: 'preview', label: 'Preview' },
  { key: 'status', label: 'Status' },
  { key: 'sortOrder', label: 'Sort' },
  { key: 'linkUrl', label: 'Link' },
  { key: 'actions', label: 'Actions', align: 'right' },
] as const

function badgeClass(status: string) { return status === 'ACTIVE' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700' : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600' }
function fill(r?: LandingBanner) { Object.assign(form, { title: r?.title || '', subtitle: r?.subtitle || '', linkUrl: r?.linkUrl || '', fileId: r?.fileId || '', status: r?.status || 'ACTIVE', sortOrder: r?.sortOrder || 0, startsAt: r?.startsAt || '', endsAt: r?.endsAt || '' }) }
function openCreate() { editing.value = 'new'; fill() }
function openEdit(r: LandingBanner) { editing.value = r; fill(r) }
async function load() { loading.value = true; error.value = ''; try { rows.value = (await bannerApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })).items } catch (e) { error.value = getErrorMessage(e) } finally { loading.value = false } }
async function save() { try { if (editing.value === 'new') await bannerApi.create(form); else if (editing.value) await bannerApi.update(editing.value.id, form); editing.value = null; await load() } catch (e) { error.value = getErrorMessage(e) } }
async function confirmRemove() { if (!deleting.value) return; await bannerApi.remove(deleting.value.id); deleting.value = null; await load() }
onMounted(async () => { await Promise.allSettled([loadMasterData(), load()]) })
</script>
