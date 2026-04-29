import { computed, reactive, ref } from 'vue'
import { useAppStore } from '@/stores/app'
import { useToast, type ToastVariant } from '@/composables/useToast'
import type { TableColumn } from '@/types/designer'

type BadgeVariant = 'primary' | 'success' | 'warning' | 'danger' | 'neutral'

interface TemplateRow extends Record<string, unknown> {
  id: string
  name: string
  note: string
  status: 'active' | 'draft' | 'archived'
  tags: string[]
}

const rows: TemplateRow[] = [
  { id: 'tpl-01', name: 'Runner hero', note: 'Hero banner cho storefront giay chay.', status: 'active', tags: ['storefront', 'hero'] },
  { id: 'tpl-02', name: 'Product grid', note: 'Card san pham, gia sale va badge stock.', status: 'active', tags: ['catalog', 'card'] },
  { id: 'tpl-03', name: 'Admin table', note: 'Bang CRUD dense cho admin.', status: 'draft', tags: ['admin', 'table'] },
  { id: 'tpl-04', name: 'Checkout form', note: 'Form dat hang nhanh tren PDP.', status: 'archived', tags: ['sales', 'form'] },
]

export function useDesignerPage() {
  const appStore = useAppStore()
  const { toasts, push, remove } = useToast()
  const apiLoading = ref(false)
  const currentPage = ref(1)
  const openDrawer = ref(false)
  const drawerTemplateName = ref('')
  const drawerNote = ref('')
  const sampleTemplate = ref('active')
  const sampleFlags = reactive({ metallic: false, outline: true, autoCenter: true })
  const templateRows = ref<TemplateRow[]>(rows)

  const PAGE_SIZE = 3
  const TABLE_COLUMNS: TableColumn<TemplateRow>[] = [
    { key: 'name', label: 'Template' },
    { key: 'status', label: 'Status' },
    { key: 'tags', label: 'Tags' },
    { key: 'actions', label: '' },
  ]
  const TEMPLATE_OPTIONS = [
    { label: 'Active', value: 'active' },
    { label: 'Draft', value: 'draft' },
    { label: 'Archived', value: 'archived' },
  ]
  const MENU_ITEMS = [
    { key: 'refresh', label: 'Refresh', meta: 'GET' },
    { key: 'toast', label: 'Toast', meta: 'UI' },
    { key: 'drawer', label: 'Drawer', meta: 'Mobile' },
  ]

  const accessTokenModel = computed({
    get: () => appStore.accessToken,
    set: (value: string) => appStore.setAccessToken(value),
  })

  const pagedTemplates = computed(() => {
    const start = (currentPage.value - 1) * PAGE_SIZE
    return templateRows.value.slice(start, start + PAGE_SIZE)
  })

  function pushToast(message: string, variant: ToastVariant = 'info', title = '') {
    push(message, variant, title)
  }

  function removeToast(id: number) {
    remove(id)
  }

  function badgeVariant(value: unknown): BadgeVariant {
    if (value === 'active') return 'success'
    if (value === 'draft') return 'warning'
    if (value === 'archived') return 'neutral'
    return 'primary'
  }

  async function fetchTemplateList() {
    apiLoading.value = true
    await new Promise((resolve) => window.setTimeout(resolve, 250))
    apiLoading.value = false
    pushToast('Da nap danh sach template demo.', 'success', 'Loaded')
  }

  function onMenuSelect(key: string) {
    if (key === 'refresh') void fetchTemplateList()
    else if (key === 'drawer') openDrawer.value = true
    else pushToast(`Da chon ${key}.`, 'info', 'Menu')
  }

  function onTagClose() {
    pushToast('Tag da duoc dong.', 'info')
  }

  function previewTemplate(row: TemplateRow) {
    pushToast(row.note, 'info', row.name)
  }

  function duplicateTemplate(row: TemplateRow) {
    templateRows.value = [
      { ...row, id: `${row.id}-copy-${Date.now()}`, name: `${row.name} copy`, status: 'draft' },
      ...templateRows.value,
    ]
    currentPage.value = 1
    pushToast('Da clone template demo.', 'success')
  }

  function saveDrawerTemplate() {
    if (!drawerTemplateName.value.trim()) {
      pushToast('Nhap ten template truoc khi luu.', 'warning')
      return
    }
    templateRows.value = [
      {
        id: `tpl-${Date.now()}`,
        name: drawerTemplateName.value.trim(),
        note: drawerNote.value.trim() || 'Template moi tu drawer.',
        status: 'draft',
        tags: ['drawer'],
      },
      ...templateRows.value,
    ]
    drawerTemplateName.value = ''
    drawerNote.value = ''
    openDrawer.value = false
    currentPage.value = 1
    pushToast('Da luu template demo.', 'success', 'Saved')
  }

  return {
    MENU_ITEMS,
    PAGE_SIZE,
    TEMPLATE_OPTIONS,
    TABLE_COLUMNS,
    accessTokenModel,
    apiLoading,
    badgeVariant,
    currentPage,
    drawerNote,
    drawerTemplateName,
    duplicateTemplate,
    fetchTemplateList,
    onMenuSelect,
    onTagClose,
    openDrawer,
    pagedTemplates,
    templateRows,
    previewTemplate,
    pushToast,
    removeToast,
    sampleFlags,
    sampleTemplate,
    saveDrawerTemplate,
    toasts,
  }
}
