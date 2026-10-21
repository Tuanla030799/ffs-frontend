import { httpClient } from '@/lib/http/httpClient'
import type { ApiEnvelope } from '@/types/http'
import type { MasterData } from './types'

const emptyMasterData = (): MasterData => ({
  categories: [],
  brands: [],
  collections: [],
  productGenders: [
    { value: 'MALE', label: 'Nam' },
    { value: 'FEMALE', label: 'Nữ' },
    { value: 'UNISEX', label: 'Unisex' },
  ],
  productStatuses: [
    { value: 'DRAFT', label: 'Nháp' },
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Ẩn' },
  ],
  commonStatuses: [
    { value: 'ACTIVE', label: 'Hoạt động' },
    { value: 'INACTIVE', label: 'Ẩn' },
  ],
  sizes: [],
  colors: [],
})

// Cache trong bộ nhớ module: trên server Node nó sống suốt vòng đời process và dùng chung cho
// mọi request, nên cần hết hạn để danh mục/thương hiệu mới thêm ở admin xuất hiện.
const CACHE_TTL_MS = 5 * 60 * 1000

let publicCache: MasterData | null = null
let adminCache: MasterData | null = null
let publicCachedAt = 0
let adminCachedAt = 0
let publicPromise: Promise<MasterData> | null = null
let adminPromise: Promise<MasterData> | null = null

function isFresh(cachedAt: number) {
  return Date.now() - cachedAt < CACHE_TTL_MS
}

function normalize(data?: Partial<MasterData> | null): MasterData {
  return { ...emptyMasterData(), ...(data || {}) }
}

async function fetchMasterData(scope: 'public' | 'admin', force = false) {
  if (scope === 'public') {
    if (publicCache && !force && isFresh(publicCachedAt)) return publicCache
    if (!publicPromise || force) {
      publicPromise = httpClient
        .get<ApiEnvelope<MasterData>>('/master-data')
        .then((res) => {
          publicCache = normalize(res.data.data)
          publicCachedAt = Date.now()
          return publicCache
        })
        .finally(() => {
          publicPromise = null
        })
    }
    return publicPromise
  }

  if (adminCache && !force && isFresh(adminCachedAt)) return adminCache
  if (!adminPromise || force) {
    adminPromise = httpClient
      .get<ApiEnvelope<MasterData>>('/admin/master-data')
      .then((res) => {
        adminCache = normalize(res.data.data)
        adminCachedAt = Date.now()
        return adminCache
      })
      .finally(() => {
        adminPromise = null
      })
  }
  return adminPromise
}

export const masterDataApi = {
  public(force = false) {
    return fetchMasterData('public', force)
  },
  admin(force = false) {
    return fetchMasterData('admin', force)
  },
  clear() {
    publicCache = null
    adminCache = null
    publicCachedAt = 0
    adminCachedAt = 0
  },
}
