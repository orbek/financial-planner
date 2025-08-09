export interface User {
  id: string
  email: string
  name: string
  avatar_url?: string
  provider: 'email' | 'google'
  provider_id?: string
  email_verified: boolean
  created_at: string
  updated_at: string
  last_login?: string
}

export interface AuthTokens {
  access_token: string
  refresh_token: string
  expires_in: number
}

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  email: string
  password: string
  name: string
}

export interface AuthResponse {
  user: User
  tokens: AuthTokens
  message: string
}

export interface AuthContextType {
  user: User | null
  isLoading: boolean
  isAuthenticated: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  loginWithGoogle: () => Promise<void>
  logout: () => void
  refreshToken: () => Promise<void>
}
