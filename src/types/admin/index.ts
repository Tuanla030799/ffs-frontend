export interface AdminProfile {
  id: string
  email: string
  fullName?: string
  name?: string
  role?: string
  status?: string
}
export interface AuthTokenPayload {
  accessToken: string
  refreshToken: string
  admin: AdminProfile
}
