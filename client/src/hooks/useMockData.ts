// Mock data for demo purposes when database is not available
import { useState, useEffect } from 'react'

export interface MockAccount {
  id: string
  user_id: string
  name: string
  type: string
  balance: number
  currency: string
  created_at: string
  updated_at: string
}

export interface MockTransaction {
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

// Mock data
const mockAccounts: MockAccount[] = [
  {
    id: '1',
    user_id: 'demo-user',
    name: 'Chase Checking',
    type: 'checking',
    balance: 5240.50,
    currency: 'USD',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '2',
    user_id: 'demo-user',
    name: 'Savings Account',
    type: 'savings',
    balance: 15750.00,
    currency: 'USD',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '3',
    user_id: 'demo-user',
    name: 'Credit Card',
    type: 'credit',
    balance: -1250.75,
    currency: 'USD',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
  {
    id: '4',
    user_id: 'demo-user',
    name: 'Investment Portfolio',
    type: 'investment',
    balance: 32500.25,
    currency: 'USD',
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  },
]

const mockTransactions: MockTransaction[] = [
  {
    id: '1',
    user_id: 'demo-user',
    account_id: '1',
    date: '2024-01-15',
    amount: 4500.00,
    type: 'Income',
    description: 'Monthly Salary Deposit',
    category: 'Salary',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    accounts: { id: '1', name: 'Chase Checking', type: 'checking' },
  },
  {
    id: '2',
    user_id: 'demo-user',
    account_id: '1',
    date: '2024-01-16',
    amount: -125.50,
    type: 'Expense',
    description: 'Grocery Store Purchase',
    category: 'Food',
    created_at: '2024-01-16T00:00:00Z',
    updated_at: '2024-01-16T00:00:00Z',
    accounts: { id: '1', name: 'Chase Checking', type: 'checking' },
  },
  {
    id: '3',
    user_id: 'demo-user',
    account_id: '1',
    date: '2024-01-17',
    amount: -45.00,
    type: 'Expense',
    description: 'Gas Station',
    category: 'Transport',
    created_at: '2024-01-17T00:00:00Z',
    updated_at: '2024-01-17T00:00:00Z',
    accounts: { id: '1', name: 'Chase Checking', type: 'checking' },
  },
  {
    id: '4',
    user_id: 'demo-user',
    account_id: '1',
    date: '2024-01-18',
    amount: -1200.00,
    type: 'Expense',
    description: 'Rent Payment',
    category: 'Housing',
    created_at: '2024-01-18T00:00:00Z',
    updated_at: '2024-01-18T00:00:00Z',
    accounts: { id: '1', name: 'Chase Checking', type: 'checking' },
  },
  // Add more mock transactions
  {
    id: '5',
    user_id: 'demo-user',
    account_id: '3',
    date: '2024-01-15',
    amount: -89.99,
    type: 'Expense',
    description: 'Amazon Purchase',
    category: 'Shopping',
    created_at: '2024-01-15T00:00:00Z',
    updated_at: '2024-01-15T00:00:00Z',
    accounts: { id: '3', name: 'Credit Card', type: 'credit' },
  },
]

// Mock dashboard data
const mockDashboardData = {
  overview: {
    totalBalance: 52239.0,
    totalIncome: 4500.0,
    totalExpenses: 1459.49,
    netIncome: 3040.51,
    accountsCount: 4,
    transactionsCount: 5,
  },
  spendingByCategory: {
    'Food': 125.50,
    'Transport': 45.00,
    'Housing': 1200.00,
    'Shopping': 89.99,
  },
  accountBreakdown: mockAccounts.map(acc => ({
    id: acc.id,
    name: acc.name,
    type: acc.type,
    balance: acc.balance,
    currency: acc.currency,
  })),
}

// Mock chart data
const mockChartData = {
  chartData: [
    { period: '2024-01', income: 4500, expenses: 1459.49, net: 3040.51 },
    { period: '2024-02', income: 4500, expenses: 1650.25, net: 2849.75 },
    { period: '2024-03', income: 4500, expenses: 1423.80, net: 3076.20 },
  ]
}

// Mock health score
const mockHealthScore = {
  healthScore: 85,
  metrics: {
    savingsRate: 35.5,
    debtToAssetRatio: 2.4,
    totalAssets: 53490.75,
    totalLiabilities: 1250.75,
    accountDiversity: 4,
  },
  recommendations: [
    {
      type: 'savings',
      priority: 'low' as const,
      message: 'Great job! Your savings rate is excellent.',
    },
    {
      type: 'investment',
      priority: 'medium' as const,
      message: 'Consider diversifying your investment portfolio.',
    },
  ],
}

// Custom hooks for mock data
export const useMockAccounts = () => {
  const [accounts, setAccounts] = useState(mockAccounts)
  
  return {
    data: { accounts },
    isLoading: false,
    error: null,
  }
}

export const useMockTransactions = () => {
  const [transactions, setTransactions] = useState(mockTransactions)
  
  return {
    data: { transactions, pagination: { total: transactions.length, limit: 100, offset: 0 } },
    isLoading: false,
    error: null,
  }
}

export const useMockDashboardOverview = () => {
  return {
    data: mockDashboardData,
    isLoading: false,
    error: null,
  }
}

export const useMockIncomeExpensesChart = () => {
  return {
    data: mockChartData,
    isLoading: false,
    error: null,
  }
}

export const useMockHealthScore = () => {
  return {
    data: mockHealthScore,
    isLoading: false,
    error: null,
  }
}
