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
})

let publicCache: MasterData | null = null
let adminCache: MasterData | null = null
let publicPromise: Promise<MasterData> | null = null
let adminPromise: Promise<MasterData> | null = null

function normalize(data?: Partial<MasterData> | null): MasterData {
  return { ...emptyMasterData(), ...(data || {}) }
}

async function fetchMasterData(scope: 'public' | 'admin', force = false) {
  if (scope === 'public') {
    if (publicCache && !force) return publicCache
    if (!publicPromise || force) {
      publicPromise = httpClient
        .get<ApiEnvelope<MasterData>>('/api/master-data')
        .then((res) => {
          publicCache = normalize(res.data.data)
          return publicCache
        })
        .finally(() => {
          publicPromise = null
        })
    }
    return publicPromise
  }

  if (adminCache && !force) return adminCache
  if (!adminPromise || force) {
    adminPromise = httpClient
      .get<ApiEnvelope<MasterData>>('/api/admin/master-data')
      .then((res) => {
        adminCache = normalize(res.data.data)
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
  },
}
