import type { Status } from '@/modules/shared/types'

export interface MasterDataEntity {
  id: string
  name: string
  slug: string
  status: Status
}

export interface MasterDataOption {
  value: string
  label: string
}

export interface MasterData {
  categories: MasterDataEntity[]
  brands: MasterDataEntity[]
  collections: MasterDataEntity[]
  productGenders: MasterDataOption[]
  productStatuses: MasterDataOption[]
  commonStatuses: MasterDataOption[]
}
