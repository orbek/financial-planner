import React, { createContext, useContext, useState, useEffect } from 'react'
import { apiService, ApiError } from '../services/api'
import { User, LoginCredentials, RegisterData, AuthContextType } from '../types/auth'
import toast from 'react-hot-toast'

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: React.ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const token = localStorage.getItem('access_token')
        if (token) {
          const response = await apiService.getCurrentUser()
          setUser(response.user)
        }
      } catch (error) {
        // Token might be expired or invalid
        localStorage.removeItem('access_token')
        localStorage.removeItem('refresh_token')
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()
  }, [])

  // Auto-refresh token before it expires
  useEffect(() => {
    if (!user) return

    const refreshToken = localStorage.getItem('refresh_token')
    if (!refreshToken) return

    // Refresh token 5 minutes before expiration
    const refreshInterval = setInterval(async () => {
      try {
        const response = await apiService.refreshToken(refreshToken)
        localStorage.setItem('access_token', response.tokens.access_token)
        localStorage.setItem('refresh_token', response.tokens.refresh_token)
      } catch (error) {
        console.error('Token refresh failed:', error)
        logout()
      }
    }, 55 * 60 * 1000) // 55 minutes

    return () => clearInterval(refreshInterval)
  }, [user])

  const storeTokens = (tokens: any) => {
    localStorage.setItem('access_token', tokens.access_token)
    localStorage.setItem('refresh_token', tokens.refresh_token)
  }

  const clearTokens = () => {
    localStorage.removeItem('access_token')
    localStorage.removeItem('refresh_token')
  }

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await apiService.login(credentials)
      
      setUser(response.user)
      storeTokens(response.tokens)
      toast.success(response.message || 'Login successful!')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Login failed. Please try again.')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (data: RegisterData) => {
    try {
      setIsLoading(true)
      const response = await apiService.register(data)
      
      setUser(response.user)
      storeTokens(response.tokens)
      toast.success(response.message || 'Registration successful!')
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Registration failed. Please try again.')
      }
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const loginWithGoogle = async () => {
    try {
      setIsLoading(true)
      const { authUrl } = await apiService.getGoogleAuthUrl()
      
      // Open Google auth in popup or redirect
      window.location.href = authUrl
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Google login failed. Please try again.')
      }
      setIsLoading(false)
    }
  }

  const handleGoogleCallback = async (code: string) => {
    try {
      setIsLoading(true)
      const response = await apiService.handleGoogleCallback(code)
      
      setUser(response.user)
      storeTokens(response.tokens)
      toast.success(response.message || 'Google login successful!')
      
      return true
    } catch (error) {
      if (error instanceof ApiError) {
        toast.error(error.message)
      } else {
        toast.error('Google authentication failed.')
      }
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const refreshToken = async () => {
    try {
      const refreshTokenValue = localStorage.getItem('refresh_token')
      if (!refreshTokenValue) throw new Error('No refresh token')

      const response = await apiService.refreshToken(refreshTokenValue)
      storeTokens(response.tokens)
    } catch (error) {
      console.error('Token refresh failed:', error)
      logout()
      throw error
    }
  }

  const logout = () => {
    setUser(null)
    clearTokens()
    
    // Call logout endpoint to invalidate token on server (optional)
    apiService.logout().catch(console.error)
    
    toast.success('Logged out successfully')
  }

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    register,
    loginWithGoogle,
    logout,
    refreshToken,
  }

  // Expose handleGoogleCallback for auth callback page
  ;(value as any).handleGoogleCallback = handleGoogleCallback

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
