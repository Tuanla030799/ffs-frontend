<template>
  <CrudShell v-model:keyword="query.keyword" v-model:status="query.status" title="Quản lý landing banner" description="Hero/banner CMS cho storefront." :loading="loading" :error="error" :show-modal="Boolean(editing)" :modal-title="editing === 'new' ? 'Tạo banner' : 'Cập nhật banner'" :confirm-open="Boolean(deleting)" :confirm-text="`Xóa banner ${deleting?.title || ''}?`" @create="openCreate" @reload="load" @search="load" @close="editing = null" @cancel-delete="deleting = null" @confirm-delete="confirmRemove">
    <template #form>
      <form class="grid gap-3 md:grid-cols-3" @submit.prevent="save">
        <input v-model="form.title" class="rounded-xl border border-slate-200 p-3" placeholder="Title" required>
        <input v-model="form.subtitle" class="rounded-xl border border-slate-200 p-3" placeholder="Subtitle">
        <input v-model="form.linkUrl" class="rounded-xl border border-slate-200 p-3" placeholder="Link URL">
        <input v-model="form.fileId" class="rounded-xl border border-slate-200 p-3" placeholder="File ID" required>
        <select v-model="form.status" class="rounded-xl border border-slate-200 p-3"><option>ACTIVE</option><option>INACTIVE</option></select>
        <input v-model.number="form.sortOrder" class="rounded-xl border border-slate-200 p-3" placeholder="Sort">
        <input v-model="form.startsAt" type="datetime-local" class="rounded-xl border border-slate-200 p-3">
        <input v-model="form.endsAt" type="datetime-local" class="rounded-xl border border-slate-200 p-3">
        <div class="md:col-span-3"><FileUpload v-model="uploaded" scope="admin" accept="image/*" title="Upload banner image" @uploaded="(file) => form.fileId = String(file.fileId)" /></div>
        <div class="flex justify-end gap-2 md:col-span-3"><button type="button" class="rounded-xl border border-slate-200 px-4 py-2 font-bold" @click="editing = null">Cancel</button><button class="rounded-xl bg-slate-950 px-4 py-2 font-bold text-white">Save</button></div>
      </form>
    </template>
    <table class="w-full min-w-[880px] text-left text-sm">
      <thead class="bg-slate-50 text-xs uppercase text-slate-500"><tr><th class="p-3">Title</th><th>Preview</th><th>Status</th><th>Sort</th><th>Link</th><th class="text-right">Actions</th></tr></thead>
      <tbody>
        <tr v-if="!rows.length" class="border-t"><td colspan="6" class="p-8 text-center text-slate-500">Không có banner.</td></tr>
        <tr v-for="row in rows" :key="row.id" class="border-t"><td class="p-3 font-black">{{ row.title }}<div class="text-xs font-normal text-slate-500">{{ row.subtitle }}</div></td><td><img v-if="row.imageUrl" :src="resolveFileUrl(row.imageUrl)" class="h-12 w-20 rounded-lg object-cover" :alt="row.title"><span v-else>-</span></td><td><span :class="badgeClass(row.status)">{{ row.status }}</span></td><td>{{ row.sortOrder }}</td><td class="max-w-xs truncate">{{ row.linkUrl }}</td><td class="space-x-3 text-right"><button class="font-bold text-slate-700" @click="openEdit(row)">Edit</button><button class="font-bold text-red-600" @click="deleting = row">Delete</button></td></tr>
      </tbody>
    </table>
  </CrudShell>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import FileUpload from '@/components/common/FileUpload.vue'
import { bannerApi } from '@/modules/content/banner/api'
import { getErrorMessage } from '@/modules/shared/hooks'
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

function badgeClass(status: string) { return status === 'ACTIVE' ? 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700' : 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600' }
function fill(r?: LandingBanner) { Object.assign(form, { title: r?.title || '', subtitle: r?.subtitle || '', linkUrl: r?.linkUrl || '', fileId: r?.fileId || '', status: r?.status || 'ACTIVE', sortOrder: r?.sortOrder || 0, startsAt: r?.startsAt || '', endsAt: r?.endsAt || '' }) }
function openCreate() { editing.value = 'new'; fill() }
function openEdit(r: LandingBanner) { editing.value = r; fill(r) }
async function load() { loading.value = true; error.value = ''; try { rows.value = (await bannerApi.adminList({ keyword: query.keyword, status: query.status, limit: 50 })).items } catch (e) { error.value = getErrorMessage(e) } finally { loading.value = false } }
async function save() { try { if (editing.value === 'new') await bannerApi.create(form); else if (editing.value) await bannerApi.update(editing.value.id, form); editing.value = null; await load() } catch (e) { error.value = getErrorMessage(e) } }
async function confirmRemove() { if (!deleting.value) return; await bannerApi.remove(deleting.value.id); deleting.value = null; await load() }
onMounted(load)
</script>
