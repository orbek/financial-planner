import dotenv from 'dotenv'
import { createClient } from '@supabase/supabase-js'

dotenv.config()

// Dynamic database configuration - supports both local PostgreSQL and Supabase
const USE_SUPABASE = process.env.USE_SUPABASE === 'true'

let supabase: any = null
let isLocalDatabase = false

if (USE_SUPABASE) {
  // Use Supabase
  console.log('🔗 Using Supabase database')
  
  const supabaseUrl = process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseKey) {
    console.warn('⚠️  Supabase environment variables not configured, falling back to local database')
    isLocalDatabase = true
  } else {
    supabase = createClient(supabaseUrl, supabaseKey)
    isLocalDatabase = false
  }
} else {
  // Use local PostgreSQL
  console.log('🗄️  Using local PostgreSQL database')
  isLocalDatabase = true
}

// Export a function to get the Supabase client
export const getSupabaseClient = () => {
  if (!supabase) {
    throw new Error('Supabase client not initialized. Check your environment variables.')
  }
  return supabase
}

export { isLocalDatabase }

// Common database interfaces
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
}

export interface Budget {
  id: string
  user_id: string
  category: string
  amount: number
  period: 'monthly' | 'weekly' | 'yearly'
  created_at: string
  updated_at: string
}

export interface Goal {
  id: string
  user_id: string
  name: string
  target_amount: number
  current_amount: number
  target_date: string
  category: string
  created_at: string
  updated_at: string
}