import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Filter, Download, Search, ArrowUpDown } from 'lucide-react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

const transactionSchema = z.object({
  account_id: z.string().min(1, 'Account is required'),
  date: z.string().min(1, 'Date is required'),
  amount: z.number().min(0.01, 'Amount must be greater than 0'),
  type: z.string().min(1, 'Type is required'),
  description: z.string().min(1, 'Description is required'),
  category: z.string().optional(),
})

type TransactionFormData = z.infer<typeof transactionSchema>

const Transactions = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    account_id: '',
    category: '',
    type: '',
    search: '',
  })

  // Mock accounts data
  const accounts = [
    { id: '1', name: 'Chase Checking', type: 'Checking' },
    { id: '2', name: 'Wells Fargo Savings', type: 'Savings' },
    { id: '3', name: 'American Express Card', type: 'Credit Card' },
    { id: '4', name: 'Investment Account', type: 'Investment' },
  ]

  // Mock transactions data
  const [transactions] = useState([
    {
      id: '1',
      account_id: '1',
      date: '2024-01-15',
      amount: -85.50,
      type: 'Expense',
      description: 'Grocery Store',
      category: 'Food & Dining',
      accounts: { name: 'Chase Checking', type: 'Checking' }
    },
    {
      id: '2',
      account_id: '1',
      date: '2024-01-14',
      amount: 2500.00,
      type: 'Income',
      description: 'Salary Deposit',
      category: 'Salary',
      accounts: { name: 'Chase Checking', type: 'Checking' }
    },
    {
      id: '3',
      account_id: '3',
      date: '2024-01-13',
      amount: -45.99,
      type: 'Expense',
      description: 'Netflix Subscription',
      category: 'Entertainment',
      accounts: { name: 'American Express Card', type: 'Credit Card' }
    },
    {
      id: '4',
      account_id: '2',
      date: '2024-01-12',
      amount: -200.00,
      type: 'Transfer',
      description: 'Transfer to Checking',
      category: 'Transfer',
      accounts: { name: 'Wells Fargo Savings', type: 'Savings' }
    },
    {
      id: '5',
      account_id: '1',
      date: '2024-01-11',
      amount: -32.15,
      type: 'Expense',
      description: 'Gas Station',
      category: 'Transportation',
      accounts: { name: 'Chase Checking', type: 'Checking' }
    },
    {
      id: '6',
      account_id: '3',
      date: '2024-01-10',
      amount: -120.00,
      type: 'Expense',
      description: 'Restaurant Dinner',
      category: 'Food & Dining',
      accounts: { name: 'American Express Card', type: 'Credit Card' }
    },
    {
      id: '7',
      account_id: '1',
      date: '2024-01-09',
      amount: -75.25,
      type: 'Expense',
      description: 'Pharmacy',
      category: 'Healthcare',
      accounts: { name: 'Chase Checking', type: 'Checking' }
    },
    {
      id: '8',
      account_id: '4',
      date: '2024-01-08',
      amount: 500.00,
      type: 'Investment',
      description: 'Monthly Investment',
      category: 'Investment',
      accounts: { name: 'Investment Account', type: 'Investment' }
    }
  ])

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = useForm<TransactionFormData>({
    resolver: zodResolver(transactionSchema),
  })

  const transactionType = watch('type')

  const onSubmit = async (data: TransactionFormData) => {
    try {
      // Demo submission
      const amount = transactionType === 'Expense' ? -Math.abs(data.amount) : Math.abs(data.amount)
      
      toast.success('Demo: Transaction would be created!')
      reset()
      setIsCreateModalOpen(false)
    } catch (error) {
      toast.error('Demo: Failed to create transaction')
    }
  }

  // Filter transactions based on current filters
  const filteredTransactions = transactions.filter(transaction => {
    if (filters.account_id && transaction.account_id !== filters.account_id) return false
    if (filters.type && transaction.type !== filters.type) return false
    if (filters.category && transaction.category !== filters.category) return false
    if (filters.search && !transaction.description.toLowerCase().includes(filters.search.toLowerCase())) return false
    return true
  })

  const categories = [
    'Food & Dining',
    'Transportation',
    'Entertainment',
    'Healthcare',
    'Shopping',
    'Bills & Utilities',
    'Salary',
    'Investment',
    'Transfer',
    'Other'
  ]

  const transactionTypes = ['Income', 'Expense', 'Transfer', 'Investment']

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Transactions</h1>
          <p className="text-gray-600">View and manage your financial transactions</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary btn-md flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Transaction</span>
        </button>
      </div>

      {/* Filters */}
      <div className="card">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-64">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Search transactions..."
                value={filters.search}
                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                className="input pl-10 w-full"
              />
            </div>
          </div>
          
          <select
            value={filters.account_id}
            onChange={(e) => setFilters(prev => ({ ...prev, account_id: e.target.value }))}
            className="input w-48"
          >
            <option value="">All Accounts</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </select>
          
          <select
            value={filters.type}
            onChange={(e) => setFilters(prev => ({ ...prev, type: e.target.value }))}
            className="input w-36"
          >
            <option value="">All Types</option>
            {transactionTypes.map((type) => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
          
          <select
            value={filters.category}
            onChange={(e) => setFilters(prev => ({ ...prev, category: e.target.value }))}
            className="input w-44"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>{category}</option>
            ))}
          </select>
          
          <button
            onClick={() => toast.success('Demo: Data would be exported!')}
            className="btn btn-secondary btn-md flex items-center space-x-2"
          >
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="card">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 font-medium text-gray-900">
                  <button className="flex items-center space-x-1">
                    <span>Date</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Description</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Account</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Category</th>
                <th className="text-left py-3 px-4 font-medium text-gray-900">Type</th>
                <th className="text-right py-3 px-4 font-medium text-gray-900">
                  <button className="flex items-center space-x-1 ml-auto">
                    <span>Amount</span>
                    <ArrowUpDown className="h-4 w-4" />
                  </button>
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTransactions.map((transaction, index) => (
                <motion.tr
                  key={transaction.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="border-b border-gray-100 hover:bg-gray-50"
                >
                  <td className="py-3 px-4 text-sm text-gray-900">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </td>
                  <td className="py-3 px-4">
                    <div className="font-medium text-gray-900">{transaction.description}</div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-600">
                    <div>{transaction.accounts?.name}</div>
                    <div className="text-xs text-gray-500">{transaction.accounts?.type}</div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                      {transaction.category}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      transaction.type === 'Income' 
                        ? 'bg-green-100 text-green-800'
                        : transaction.type === 'Expense'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}>
                      {transaction.type}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right">
                    <span className={`font-medium ${
                      transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                    }`}>
                      {transaction.amount > 0 ? '+' : ''}${Math.abs(transaction.amount).toFixed(2)}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
          
          {filteredTransactions.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              <p>No transactions found</p>
              <p className="text-sm">Try adjusting your filters or add a new transaction</p>
            </div>
          )}
        </div>
      </div>

      {/* Create Transaction Modal */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white rounded-lg p-6 w-full max-w-md mx-4"
          >
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Add New Transaction</h3>
            
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="label">Account</label>
                <select {...register('account_id')} className="input w-full">
                  <option value="">Select account</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.type})
                    </option>
                  ))}
                </select>
                {errors.account_id && (
                  <p className="text-red-500 text-sm mt-1">{errors.account_id.message}</p>
                )}
              </div>

              <div>
                <label className="label">Date</label>
                <input
                  type="date"
                  {...register('date')}
                  className="input w-full"
                />
                {errors.date && (
                  <p className="text-red-500 text-sm mt-1">{errors.date.message}</p>
                )}
              </div>

              <div>
                <label className="label">Type</label>
                <select {...register('type')} className="input w-full">
                  <option value="">Select type</option>
                  {transactionTypes.map((type) => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
                {errors.type && (
                  <p className="text-red-500 text-sm mt-1">{errors.type.message}</p>
                )}
              </div>

              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  step="0.01"
                  {...register('amount', { valueAsNumber: true })}
                  className="input w-full"
                  placeholder="0.00"
                />
                {errors.amount && (
                  <p className="text-red-500 text-sm mt-1">{errors.amount.message}</p>
                )}
              </div>

              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  {...register('description')}
                  className="input w-full"
                  placeholder="Transaction description"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description.message}</p>
                )}
              </div>

              <div>
                <label className="label">Category (Optional)</label>
                <select {...register('category')} className="input w-full">
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="btn btn-secondary btn-md flex-1"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary btn-md flex-1"
                >
                  Add Transaction
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  )
}

export default Transactions