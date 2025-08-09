import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, CreditCard, Edit2, Trash2, Loader2 } from 'lucide-react'
import { useMockAccounts as useAccounts } from '../hooks/useMockData'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import toast from 'react-hot-toast'

const accountSchema = z.object({
  name: z.string().min(1, 'Account name is required').max(100),
  type: z.enum(['checking', 'savings', 'credit', 'investment', 'loan', 'cash', 'other']),
  balance: z.number().default(0),
  currency: z.enum(['USD', 'BRL', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD']).default('USD'),
})

type AccountFormData = z.infer<typeof accountSchema>

const Accounts = () => {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<any>(null)
  
  const { data: accounts, isLoading } = useAccounts()
  
  // Mock mutations for demo
  const createAccountMutation = { 
    mutateAsync: async (data: any) => { toast.success('Demo: Account would be created!') },
    isPending: false 
  }
  const updateAccountMutation = { 
    mutateAsync: async (data: any) => { toast.success('Demo: Account would be updated!') },
    isPending: false 
  }
  const deleteAccountMutation = { 
    mutateAsync: async (id: string) => { toast.success('Demo: Account would be deleted!') },
    isPending: false 
  }

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AccountFormData>({
    resolver: zodResolver(accountSchema),
  })

  const onSubmit = async (data: AccountFormData) => {
    try {
      if (editingAccount) {
        await updateAccountMutation.mutateAsync({ id: editingAccount.id, data })
        setEditingAccount(null)
      } else {
        await createAccountMutation.mutateAsync(data)
        setIsCreateModalOpen(false)
      }
      reset()
    } catch (error) {
      console.error('Form submission error:', error)
    }
  }

  const handleEdit = (account: any) => {
    setEditingAccount(account)
    reset({
      name: account.name,
      type: account.type,
      balance: account.balance,
      currency: account.currency,
    })
  }

  const handleDelete = async (accountId: string) => {
    if (window.confirm('Are you sure you want to delete this account? This action cannot be undone.')) {
      await deleteAccountMutation.mutateAsync(accountId)
    }
  }

  const getAccountTypeIcon = (type: string) => {
    switch (type) {
      case 'checking':
        return '🏦'
      case 'savings':
        return '💰'
      case 'credit':
        return '💳'
      case 'investment':
        return '📈'
      case 'loan':
        return '🏠'
      case 'cash':
        return '💵'
      default:
        return '📊'
    }
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Accounts</h1>
          <p className="text-gray-600">Manage your financial accounts and balances</p>
        </div>
        
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="btn btn-primary btn-md flex items-center space-x-2"
        >
          <Plus className="h-4 w-4" />
          <span>Add Account</span>
        </button>
      </div>

      {/* Accounts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts?.accounts.map((account, index) => (
          <motion.div
            key={account.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="card hover:shadow-lg transition-shadow"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <span className="text-2xl mr-3">{getAccountTypeIcon(account.type)}</span>
                <div>
                  <h3 className="font-semibold text-gray-900">{account.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(account)}
                  className="p-1 text-gray-400 hover:text-gray-600"
                >
                  <Edit2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDelete(account.id)}
                  className="p-1 text-gray-400 hover:text-red-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="text-right">
              <p className={`text-2xl font-bold ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {formatCurrency(account.balance, account.currency)}
              </p>
              <p className="text-sm text-gray-500">
                Updated {new Date(account.updated_at).toLocaleDateString()}
              </p>
            </div>
          </motion.div>
        ))}
        
        {/* Empty State */}
        {(!accounts?.accounts || accounts.accounts.length === 0) && (
          <div className="col-span-full text-center py-12">
            <CreditCard className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No accounts yet</h3>
            <p className="text-gray-600 mb-6">Get started by adding your first financial account</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="btn btn-primary btn-md"
            >
              Add Your First Account
            </button>
          </div>
        )}
      </div>

      {/* Create/Edit Account Modal */}
      <AnimatePresence>
        {(isCreateModalOpen || editingAccount) && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-lg p-6 w-full max-w-md"
            >
              <h2 className="text-lg font-semibold text-gray-900 mb-4">
                {editingAccount ? 'Edit Account' : 'Create New Account'}
              </h2>
              
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
                <div>
                  <label className="label">Account Name</label>
                  <input
                    {...register('name')}
                    className="input w-full"
                    placeholder="e.g., Chase Checking"
                  />
                  {errors.name && (
                    <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>
                  )}
                </div>
                
                <div>
                  <label className="label">Account Type</label>
                  <select {...register('type')} className="input w-full">
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="credit">Credit Card</option>
                    <option value="investment">Investment</option>
                    <option value="loan">Loan</option>
                    <option value="cash">Cash</option>
                    <option value="other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Currency</label>
                  <select {...register('currency')} className="input w-full">
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CAD">CAD - Canadian Dollar</option>
                    <option value="JPY">JPY - Japanese Yen</option>
                    <option value="AUD">AUD - Australian Dollar</option>
                    <option value="BRL">BRL - Brazilian Real</option>
                  </select>
                </div>
                
                <div>
                  <label className="label">Initial Balance</label>
                  <input
                    {...register('balance', { valueAsNumber: true })}
                    type="number"
                    step="0.01"
                    className="input w-full"
                    placeholder="0.00"
                  />
                  {errors.balance && (
                    <p className="text-red-500 text-sm mt-1">{errors.balance.message}</p>
                  )}
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setIsCreateModalOpen(false)
                      setEditingAccount(null)
                      reset()
                    }}
                    className="btn btn-secondary btn-md"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={createAccountMutation.isPending || updateAccountMutation.isPending}
                    className="btn btn-primary btn-md"
                  >
                    {createAccountMutation.isPending || updateAccountMutation.isPending ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      editingAccount ? 'Update Account' : 'Create Account'
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default Accounts
