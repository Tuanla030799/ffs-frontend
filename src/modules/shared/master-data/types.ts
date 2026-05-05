import type { Status } from '@/modules/shared/types'

export interface MasterDataEntity {
  id: string
  name: string
  slug: string
  status: Status
}

export interface MasterDataOption {
  id?: string
  value: string
  label: string
  status?: Status
  sortOrder?: number
  createdAt?: string
}

export interface MasterDataColorOption extends MasterDataOption {
  colorCode?: string | null
}

export interface MasterData {
  categories: MasterDataEntity[]
  brands: MasterDataEntity[]
  collections: MasterDataEntity[]
  productGenders: MasterDataOption[]
  productStatuses: MasterDataOption[]
  commonStatuses: MasterDataOption[]
  sizes: MasterDataOption[]
  colors: MasterDataColorOption[]
}
