import { Pool } from 'pg'
import dotenv from 'dotenv'

dotenv.config()

// PostgreSQL configuration for local development
const pool = new Pool({
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'financial_planner',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
  max: 20,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 2000,
})

// Database interfaces (same as before but for PostgreSQL)
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
  start_date: string
  end_date?: string
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
  description?: string
  created_at: string
  updated_at: string
}

export interface GoalContribution {
  id: string
  goal_id: string
  amount: number
  contribution_date: string
  notes?: string
  created_at: string
}

// Database helper functions
export class Database {
  static async query(text: string, params?: any[]) {
    const client = await pool.connect()
    try {
      const result = await client.query(text, params)
      return result
    } finally {
      client.release()
    }
  }

  // Account operations
  static async getAccounts(userId: string): Promise<Account[]> {
    const result = await this.query(
      'SELECT * FROM accounts WHERE user_id = $1 ORDER BY created_at DESC',
      [userId]
    )
    return result.rows
  }

  static async getAccount(id: string, userId: string): Promise<Account | null> {
    const result = await this.query(
      'SELECT * FROM accounts WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    return result.rows[0] || null
  }

  static async createAccount(data: Partial<Account>): Promise<Account> {
    const { user_id, name, type, balance = 0, currency = 'USD' } = data
    const result = await this.query(
      `INSERT INTO accounts (user_id, name, type, balance, currency) 
       VALUES ($1, $2, $3, $4, $5) 
       RETURNING *`,
      [user_id, name, type, balance, currency]
    )
    return result.rows[0]
  }

  static async updateAccount(id: string, userId: string, data: Partial<Account>): Promise<Account | null> {
    const fields = []
    const values = []
    let paramCount = 1

    for (const [key, value] of Object.entries(data)) {
      if (key !== 'id' && key !== 'user_id' && key !== 'created_at') {
        fields.push(`${key} = $${paramCount++}`)
        values.push(value)
      }
    }

    if (fields.length === 0) return null

    values.push(id, userId)
    const result = await this.query(
      `UPDATE accounts SET ${fields.join(', ')}, updated_at = NOW() 
       WHERE id = $${paramCount++} AND user_id = $${paramCount} 
       RETURNING *`,
      values
    )
    return result.rows[0] || null
  }

  static async deleteAccount(id: string, userId: string): Promise<boolean> {
    const result = await this.query(
      'DELETE FROM accounts WHERE id = $1 AND user_id = $2',
      [id, userId]
    )
    return result.rowCount > 0
  }

  // Transaction operations
  static async getTransactions(userId: string, filters: any = {}): Promise<{transactions: Transaction[], total: number}> {
    let whereClause = 'WHERE t.user_id = $1'
    const params = [userId]
    let paramCount = 2

    if (filters.account_id) {
      whereClause += ` AND t.account_id = $${paramCount++}`
      params.push(filters.account_id)
    }

    if (filters.category) {
      whereClause += ` AND t.category = $${paramCount++}`
      params.push(filters.category)
    }

    if (filters.type) {
      if (filters.type === 'Income') {
        whereClause += ` AND t.amount > 0`
      } else if (filters.type === 'Expense') {
        whereClause += ` AND t.amount < 0`
      }
    }

    if (filters.start_date) {
      whereClause += ` AND t.date >= $${paramCount++}`
      params.push(filters.start_date)
    }

    if (filters.end_date) {
      whereClause += ` AND t.date <= $${paramCount++}`
      params.push(filters.end_date)
    }

    const limit = filters.limit || 100
    const offset = filters.offset || 0

    const countResult = await this.query(
      `SELECT COUNT(*) FROM transactions t ${whereClause}`,
      params
    )

    const result = await this.query(
      `SELECT t.*, a.name as account_name, a.type as account_type
       FROM transactions t
       LEFT JOIN accounts a ON t.account_id = a.id
       ${whereClause}
       ORDER BY t.date DESC, t.created_at DESC
       LIMIT $${paramCount++} OFFSET $${paramCount}`,
      [...params, limit, offset]
    )

    return {
      transactions: result.rows.map(row => ({
        ...row,
        accounts: row.account_name ? {
          id: row.account_id,
          name: row.account_name,
          type: row.account_type
        } : null
      })),
      total: parseInt(countResult.rows[0].count)
    }
  }

  static async createTransaction(data: Partial<Transaction>): Promise<Transaction> {
    const { user_id, account_id, date, amount, type, description, category } = data
    
    const result = await this.query(
      `INSERT INTO transactions (user_id, account_id, date, amount, type, description, category) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [user_id, account_id, date, amount, type, description, category]
    )

    // Update account balance
    await this.updateAccountBalance(account_id!)

    return result.rows[0]
  }

  static async updateAccountBalance(accountId: string): Promise<void> {
    await this.query(
      `UPDATE accounts 
       SET balance = (
         SELECT COALESCE(SUM(amount), 0) 
         FROM transactions 
         WHERE account_id = $1
       )
       WHERE id = $1`,
      [accountId]
    )
  }

  // Budget operations
  static async getBudgets(userId: string): Promise<Budget[]> {
    const result = await this.query(
      'SELECT * FROM budgets WHERE user_id = $1 ORDER BY category',
      [userId]
    )
    return result.rows
  }

  static async createBudget(data: Partial<Budget>): Promise<Budget> {
    const { user_id, category, amount, period = 'monthly' } = data
    const result = await this.query(
      `INSERT INTO budgets (user_id, category, amount, period) 
       VALUES ($1, $2, $3, $4) 
       ON CONFLICT (user_id, category, period) 
       DO UPDATE SET amount = $3, updated_at = NOW()
       RETURNING *`,
      [user_id, category, amount, period]
    )
    return result.rows[0]
  }

  // Goal operations
  static async getGoals(userId: string): Promise<Goal[]> {
    const result = await this.query(
      'SELECT * FROM goals WHERE user_id = $1 ORDER BY target_date',
      [userId]
    )
    return result.rows
  }

  static async createGoal(data: Partial<Goal>): Promise<Goal> {
    const { user_id, name, target_amount, current_amount = 0, target_date, category, description } = data
    const result = await this.query(
      `INSERT INTO goals (user_id, name, target_amount, current_amount, target_date, category, description) 
       VALUES ($1, $2, $3, $4, $5, $6, $7) 
       RETURNING *`,
      [user_id, name, target_amount, current_amount, target_date, category, description]
    )
    return result.rows[0]
  }

  // Dashboard operations
  static async getDashboardData(userId: string): Promise<any> {
    // Get accounts summary
    const accountsResult = await this.query(
      'SELECT * FROM accounts WHERE user_id = $1',
      [userId]
    )

    // Get recent transactions (last 30 days)
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
    const transactionsResult = await this.query(
      'SELECT * FROM transactions WHERE user_id = $1 AND date >= $2',
      [userId, thirtyDaysAgo]
    )

    const accounts = accountsResult.rows
    const transactions = transactionsResult.rows

    const totalBalance = accounts.reduce((sum: number, acc: Account) => sum + parseFloat(acc.balance.toString()), 0)
    const totalIncome = transactions
      .filter((t: Transaction) => parseFloat(t.amount.toString()) > 0)
      .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount.toString()), 0)
    const totalExpenses = Math.abs(transactions
      .filter((t: Transaction) => parseFloat(t.amount.toString()) < 0)
      .reduce((sum: number, t: Transaction) => sum + parseFloat(t.amount.toString()), 0))

    // Calculate spending by category
    const spendingByCategory = transactions
      .filter((t: Transaction) => parseFloat(t.amount.toString()) < 0)
      .reduce((acc: Record<string, number>, t: Transaction) => {
        const category = t.category || 'Other'
        acc[category] = (acc[category] || 0) + Math.abs(parseFloat(t.amount.toString()))
        return acc
      }, {})

    return {
      overview: {
        totalBalance,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        accountsCount: accounts.length,
        transactionsCount: transactions.length,
      },
      spendingByCategory,
      accountBreakdown: accounts.map((acc: Account) => ({
        id: acc.id,
        name: acc.name,
        type: acc.type,
        balance: parseFloat(acc.balance.toString()),
        currency: acc.currency,
      })),
    }
  }

  // Health check
  static async healthCheck(): Promise<boolean> {
    try {
      await this.query('SELECT 1')
      return true
    } catch (error) {
      console.error('Database health check failed:', error)
      return false
    }
  }
}

export default pool
