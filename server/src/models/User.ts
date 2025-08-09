export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  provider: 'email' | 'microsoft' | 'google'
  provider_id?: string
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface CreateUserData {
  email: string
  name: string
  password?: string
  provider: 'email' | 'microsoft' | 'google'
  provider_id?: string
  avatar_url?: string
  email_verified?: boolean
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
}
