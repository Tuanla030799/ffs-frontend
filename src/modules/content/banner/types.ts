import type { Status } from '@/modules/shared/types'
export interface LandingBanner { id: string; title: string; subtitle?: string; linkUrl?: string; fileId?: string; imageUrl?: string; status: Status; sortOrder?: number; startsAt?: string; endsAt?: string }
export type LandingBannerPayload = Omit<LandingBanner, 'id' | 'imageUrl'>
