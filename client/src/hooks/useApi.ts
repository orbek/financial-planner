import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import toast from 'react-hot-toast'
import { useAuth } from '../contexts/AuthContext'

// Types
export interface Account {
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface Transaction {
  id: string
  user_id: string
  account_id: string
  date: string
  amount: number
  type: string
  description: string
  category?: string
  created_at: string
  updated_at: string
  accounts?: {
    id: string
    name: string
    type: string
  }
}

export interface DashboardOverview {
  overview: {
    totalBalance: number
    totalIncome: number
    totalExpenses: number
    netIncome: number
    accountsCount: number
    transactionsCount: number
  }
  spendingByCategory: Record<string, number>
  accountBreakdown: Array<{
    id: string
    name: string
    type: string
    balance: number
    currency: string
  }>
}

// API client
class ApiClient {
  private baseURL = '/api'
  private token: string | null = null

  setToken(token: string | null) {
    this.token = token
  }

  private async fetch(endpoint: string, options: RequestInit = {}) {
    const url = `${this.baseURL}${endpoint}`
    const headers = {
      'Content-Type': 'application/json',
      ...(this.token && { Authorization: `Bearer ${this.token}` }),
      ...options.headers,
    }

    const response = await fetch(url, { ...options, headers })

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: 'Network error' } }))
      throw new Error(error.error?.message || 'API request failed')
    }

    return response.json()
  }

  // Dashboard
  async getDashboardOverview(): Promise<DashboardOverview> {
    return this.fetch('/dashboard/overview')
  }

  async getIncomeExpensesChart(period = 'monthly', months = 6) {
    return this.fetch(`/dashboard/income-expenses?period=${period}&months=${months}`)
  }

  async getBalanceTrends(days = 30) {
    return this.fetch(`/dashboard/balance-trends?days=${days}`)
  }

  async getHealthScore() {
    return this.fetch('/dashboard/health-score')
  }

  // Accounts
  async getAccounts(): Promise<{ accounts: Account[] }> {
    return this.fetch('/accounts')
  }

  async getAccount(id: string): Promise<{ account: Account }> {
    return this.fetch(`/accounts/${id}`)
  }

  async createAccount(data: Partial<Account>): Promise<{ account: Account }> {
    return this.fetch('/accounts', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateAccount(id: string, data: Partial<Account>): Promise<{ account: Account }> {
    return this.fetch(`/accounts/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteAccount(id: string): Promise<{ message: string }> {
    return this.fetch(`/accounts/${id}`, {
      method: 'DELETE',
    })
  }

  // Transactions
  async getTransactions(params?: {
    account_id?: string
    category?: string
    type?: string
    start_date?: string
    end_date?: string
    limit?: number
    offset?: number
  }): Promise<{ transactions: Transaction[], pagination: any }> {
    const searchParams = new URLSearchParams()
    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          searchParams.append(key, String(value))
        }
      })
    }
    
    const query = searchParams.toString()
    return this.fetch(`/transactions${query ? `?${query}` : ''}`)
  }

  async getTransaction(id: string): Promise<{ transaction: Transaction }> {
    return this.fetch(`/transactions/${id}`)
  }

  async createTransaction(data: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    return this.fetch('/transactions', {
      method: 'POST',
      body: JSON.stringify(data),
    })
  }

  async updateTransaction(id: string, data: Partial<Transaction>): Promise<{ transaction: Transaction }> {
    return this.fetch(`/transactions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    })
  }

  async deleteTransaction(id: string): Promise<{ message: string }> {
    return this.fetch(`/transactions/${id}`, {
      method: 'DELETE',
    })
  }

  async getTransactionCategories(): Promise<{ categories: string[] }> {
    return this.fetch('/transactions/categories/list')
  }

  // Statements
  async uploadStatement(file: File, accountId: string) {
    const formData = new FormData()
    formData.append('statement', file)
    formData.append('account_id', accountId)

    return this.fetch('/statements/upload', {
      method: 'POST',
      body: formData,
      headers: {
        ...(this.token && { Authorization: `Bearer ${this.token}` }),
      },
    })
  }

  async getStatementHistory() {
    return this.fetch('/statements/history')
  }
}

const apiClient = new ApiClient()

// Custom hook to provide API client with auth token
export const useApiClient = () => {
  const { token } = useAuth()
  
  if (token !== apiClient.token) {
    apiClient.setToken(token)
  }
  
  return apiClient
}

// Dashboard hooks
export const useDashboardOverview = () => {
  const api = useApiClient()
  return useQuery({
    queryKey: ['dashboard', 'overview'],
    queryFn: () => api.getDashboardOverview(),
    enabled: !!api.token,
  })
}

export const useIncomeExpensesChart = (period = 'monthly', months = 6) => {
  const api = useApiClient()
  return useQuery({
    queryKey: ['dashboard', 'income-expenses', period, months],
    queryFn: () => api.getIncomeExpensesChart(period, months),
    enabled: !!api.token,
  })
}

export const useHealthScore = () => {
  const api = useApiClient()
  return useQuery({
    queryKey: ['dashboard', 'health-score'],
    queryFn: () => api.getHealthScore(),
    enabled: !!api.token,
  })
}

// Account hooks
export const useAccounts = () => {
  const api = useApiClient()
  return useQuery({
    queryKey: ['accounts'],
    queryFn: () => api.getAccounts(),
    enabled: !!api.token,
  })
}

export const useCreateAccount = () => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<Account>) => api.createAccount(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Account created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create account')
    },
  })
}

export const useUpdateAccount = () => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<Account> }) => 
      api.updateAccount(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Account updated successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to update account')
    },
  })
}

export const useDeleteAccount = () => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (id: string) => api.deleteAccount(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Account deleted successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to delete account')
    },
  })
}

// Transaction hooks
export const useTransactions = (params?: Parameters<typeof apiClient.getTransactions>[0]) => {
  const api = useApiClient()
  return useQuery({
    queryKey: ['transactions', params],
    queryFn: () => api.getTransactions(params),
    enabled: !!api.token,
  })
}

export const useCreateTransaction = () => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: (data: Partial<Transaction>) => api.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success('Transaction created successfully!')
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to create transaction')
    },
  })
}

export const useUploadStatement = () => {
  const api = useApiClient()
  const queryClient = useQueryClient()
  
  return useMutation({
    mutationFn: ({ file, accountId }: { file: File; accountId: string }) => 
      api.uploadStatement(file, accountId),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['transactions'] })
      queryClient.invalidateQueries({ queryKey: ['accounts'] })
      queryClient.invalidateQueries({ queryKey: ['dashboard'] })
      toast.success(`${data.transactionsAdded} transactions imported successfully!`)
    },
    onError: (error: Error) => {
      toast.error(error.message || 'Failed to upload statement')
    },
  })
}
