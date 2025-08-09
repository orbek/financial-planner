import { AuthResponse, LoginCredentials, RegisterData } from '../types/auth'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000'

class ApiError extends Error {
  status: number
  
  constructor(message: string, status: number) {
    super(message)
    this.status = status
    this.name = 'ApiError'
  }
}

class ApiService {
  private baseURL: string

  constructor() {
    this.baseURL = `${API_BASE_URL}/api`
  }

  private getAuthHeaders(): HeadersInit {
    const token = localStorage.getItem('access_token')
    return {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` })
    }
  }

  private async handleResponse<T>(response: Response): Promise<T> {
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new ApiError(
        errorData.error || errorData.message || 'Request failed',
        response.status
      )
    }
    return response.json()
  }

  // Authentication endpoints
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(credentials)
    })
    return this.handleResponse<AuthResponse>(response)
  }

  async register(data: RegisterData): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return this.handleResponse<AuthResponse>(response)
  }

  async getGoogleAuthUrl(): Promise<{ authUrl: string }> {
    const response = await fetch(`${this.baseURL}/auth/google/url`)
    return this.handleResponse<{ authUrl: string }>(response)
  }

  async handleGoogleCallback(code: string): Promise<AuthResponse> {
    const response = await fetch(`${this.baseURL}/auth/google/callback`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code })
    })
    return this.handleResponse<AuthResponse>(response)
  }

  async refreshToken(refreshToken: string): Promise<{ tokens: any }> {
    const response = await fetch(`${this.baseURL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh_token: refreshToken })
    })
    return this.handleResponse<{ tokens: any }>(response)
  }

  async getCurrentUser(): Promise<{ user: any }> {
    const response = await fetch(`${this.baseURL}/auth/me`, {
      headers: this.getAuthHeaders()
    })
    return this.handleResponse<{ user: any }>(response)
  }

  async logout(): Promise<void> {
    const response = await fetch(`${this.baseURL}/auth/logout`, {
      method: 'POST',
      headers: this.getAuthHeaders()
    })
    await this.handleResponse(response)
  }

  async forgotPassword(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseURL}/auth/forgot-password`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return this.handleResponse<{ message: string }>(response)
  }

  // Generic API method for other endpoints
  async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const response = await fetch(`${this.baseURL}${endpoint}`, {
      ...options,
      headers: {
        ...this.getAuthHeaders(),
        ...options.headers
      }
    })
    return this.handleResponse<T>(response)
  }
}

export const apiService = new ApiService()
export { ApiError }
