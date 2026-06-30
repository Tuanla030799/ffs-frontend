<template>
  <CrudShell
    v-model:keyword="query.keyword"
    v-model:status="query.status"
    title="Quản lý product"
    description="Danh sách sản phẩm"
    :loading="loading"
    :error="error"
    :status-options="['ACTIVE', 'INACTIVE', 'DRAFT']"
    filter-class="grid items-end gap-3 md:grid-cols-[minmax(220px,1fr)_150px_170px_170px_140px_170px_auto]"
    :show-modal="false"
    :confirm-open="Boolean(deleting)"
    :confirm-text="`Xóa product ${deleting?.name || ''}?`"
    @create="openCreate"
    @reload="load"
    @search="search"
    @cancel-delete="deleting = null"
    @confirm-delete="confirmRemove"
  >
    <template #filters>
      <UiSelect v-model="query.brandId" placeholder="Tất cả brand">
        <option v-for="brand in masterData?.brands || []" :key="brand.id" :value="brand.id">
          {{ brand.name }}
        </option>
      </UiSelect>
      <UiSelect v-model="query.gender" placeholder="Tất cả gender">
        <option
          v-for="gender in masterData?.productGenders || []"
          :key="gender.value"
          :value="gender.value"
        >
          {{ gender.label }}
        </option>
      </UiSelect>
      <SizeColorPicker
        v-model="query.size"
        :options="masterData?.sizes || []"
        title="Chọn size lọc"
        placeholder="Tất cả size"
        value-field="value"
        clearable
      />
      <SizeColorPicker
        v-model="query.color"
        :options="masterData?.colors || []"
        title="Chọn màu lọc"
        placeholder="Tất cả màu"
        variant="color"
        value-field="value"
        clearable
      />
    </template>

    <UiTable
      :columns="columns"
      :rows="rows"
      :loading="loading"
      density="sm"
      sticky-header
      striped
      row-key="id"
      min-width="min-w-[920px]"
      empty-text="Không có product."
    >
      <template #cell-name="{ row }">
        <span class="font-bold text-slate-950">{{ row.name }}</span>
      </template>
      <template #cell-brandName="{ row }">{{ row.brandName || '-' }}</template>
      <template #cell-gender="{ row }">{{ genderLabel(row.gender) }}</template>
      <template #cell-status="{ row }"
        ><span :class="badgeClass(row.status)">{{ row.status }}</span></template
      >
      <!-- <template #cell-isFeatured="{ row }">{{ row.isFeatured ? 'Yes' : 'No' }}</template>
      <template #cell-stock="{ row }">{{ row.totalStock ?? '-' }}</template> -->
      <template #cell-sort="{ row }">{{ row.featuredOrder }}</template>
      <template #cell-price="{ row }">{{ money(row.minPrice) }}</template>
      <template #cell-salePrice="{ row }">{{ money(row.minSalePrice) }}</template>
      <template #cell-actions="{ row }">
        <UiDropdown
          :items="actionItems"
          placement="right"
          @select="(key) => handleRowAction(key, row)"
        >
          <template #trigger>
            <UiButton variant="ghost">Thao tác</UiButton>
          </template>
        </UiDropdown>
      </template>
    </UiTable>

    <UiPagination
      v-if="total > 0"
      :page="page"
      :total="total"
      :total-pages="totalPages"
      :page-size="Number(query.limit || 20)"
      @update:page="changePage"
    />
  </CrudShell>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import SizeColorPicker from '@/components/common/SizeColorPicker.vue'
import CrudShell from '@/pages/admin/CrudShell.vue'
import { UiButton, UiDropdown, UiPagination, UiSelect, UiTable } from '@/components/ui'
import { usePageQuery } from '@/composables/usePageQuery'
import { productApi } from '@/modules/catalog/product/api'
import { getErrorMessage } from '@/modules/shared/hooks'
import { money } from '@/modules/shared/types'
import { useMasterData } from '@/modules/shared/master-data/hooks'
import type { Product } from '@/modules/catalog/product/types'

const router = useRouter()
const pageQuery = usePageQuery()
const rows = ref<Product[]>([])
const loading = ref(false)
const error = ref('')
const deleting = ref<Product | null>(null)
const total = ref(0)
const totalPages = ref(0)
const query = reactive({
  keyword: '',
  status: '',
  brandId: '',
  gender: '',
  size: '',
  color: '',
  page: pageQuery.value(),
  limit: 20,
})
const page = computed(() => Number(query.page || 1))
const { data: masterData, load: loadMasterData } = useMasterData('admin')
const columns = [
  { key: 'name', label: 'Tên sản phẩm', cellAlign: 'left', width: '240px' },
  { key: 'slug', label: 'Slug', cellAlign: 'left', width: '180px' },
  { key: 'brandName', label: 'Brand', cellAlign: 'center', width: '140px' },
  { key: 'gender', label: 'Giới tính', cellAlign: 'center', width: '110px' },
  { key: 'status', label: 'Trạng thái', cellAlign: 'center', width: '120px' },
  // { key: 'isFeatured', label: 'Sản phẩm nổi bật', cellAlign: 'center', width: '140px' },
  // { key: 'stock', label: 'Số lượng tồn kho', cellAlign: 'center', width: '130px' },
  { key: 'sort', label: 'Thứ tự', cellAlign: 'center' },
  { key: 'price', label: 'Giá', cellAlign: 'right', width: '120px' },
  { key: 'salePrice', label: 'Giá khuyến mãi', cellAlign: 'right', width: '140px' },
  { key: 'actions', label: 'Actions', cellAlign: 'center', width: '120px' },
] as const
const actionItems = [
  { key: 'edit', label: 'Edit' },
  { key: 'delete', label: 'Delete' },
]

function badgeClass(status: string) {
  if (status === 'ACTIVE')
    return 'rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-bold text-emerald-700'
  if (status === 'DRAFT')
    return 'rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700'
  return 'rounded-full bg-slate-100 px-2.5 py-1 text-xs font-bold text-slate-600'
}

function openCreate() {
  void router.push({ name: 'admin-product-create' })
}

function openEdit(id: string) {
  void router.push({ name: 'admin-product-edit', params: { id } })
}

function handleRowAction(key: string, row: Product) {
  if (key === 'edit') {
    openEdit(row.id)
    return
  }
  if (key === 'delete') deleting.value = row
}

function genderLabel(value?: string) {
  if (!value) return '-'
  return masterData.value?.productGenders.find((item) => item.value === value)?.label || value
}

async function load() {
  loading.value = true
  error.value = ''
  try {
    const data = await productApi.adminList({
      keyword: query.keyword,
      status: query.status,
      brandId: query.brandId || undefined,
      gender: query.gender || undefined,
      size: query.size || undefined,
      color: query.color || undefined,
      page: query.page,
      limit: query.limit,
    })
    rows.value = data.items
    total.value = data.total
    totalPages.value = data.totalPages
    query.page = data.page || query.page
    query.limit = data.limit || query.limit
  } catch (err) {
    error.value = getErrorMessage(err)
  } finally {
    loading.value = false
  }
}

function search() {
  query.page = 1
  void pageQuery.replace(query.page)
  void load()
}

function changePage(nextPage: number) {
  if (loading.value || nextPage === page.value) return
  query.page = nextPage
  void pageQuery.replace(query.page)
  void load()
}

watch(
  () => [query.status, query.brandId, query.gender, query.size, query.color],
  () => search(),
)

async function confirmRemove() {
  if (!deleting.value) return
  await productApi.remove(deleting.value.id)
  deleting.value = null
  await load()
}

onMounted(async () => {
  await Promise.allSettled([loadMasterData(), load()])
})
</script>
