import { useState } from 'react'
import { motion } from 'framer-motion'
import { Plus, Target, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'

// This is a new feature - Budget tracking with visual progress bars
const Budget = () => {
  const [budgets] = useState([
    {
      id: '1',
      category: 'Food & Dining',
      budgeted: 800,
      spent: 650,
      period: 'monthly',
      color: '#ef4444',
    },
    {
      id: '2',
      category: 'Transportation',
      budgeted: 300,
      spent: 280,
      period: 'monthly',
      color: '#3b82f6',
    },
    {
      id: '3',
      category: 'Entertainment',
      budgeted: 200,
      spent: 240,
      period: 'monthly',
      color: '#8b5cf6',
    },
    {
      id: '4',
      category: 'Shopping',
      budgeted: 400,
      spent: 120,
      period: 'monthly',
      color: '#22c55e',
    },
  ])

  const totalBudgeted = budgets.reduce((sum, budget) => sum + budget.budgeted, 0)
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0)
  const remainingBudget = totalBudgeted - totalSpent

  const getProgressColor = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100
    if (percentage >= 100) return 'bg-red-500'
    if (percentage >= 80) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getStatusIcon = (spent: number, budgeted: number) => {
    const percentage = (spent / budgeted) * 100
    if (percentage >= 100) return <AlertTriangle className="h-5 w-5 text-red-500" />
    if (percentage >= 80) return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    return <CheckCircle className="h-5 w-5 text-green-500" />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Budget Tracking</h1>
          <p className="text-gray-600">Monitor your spending against your budget goals</p>
        </div>
        
        <button className="btn btn-primary btn-md flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Budget</span>
        </button>
      </div>

      {/* Budget Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Target className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalBudgeted.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="card"
        >
          <div className="flex items-center">
            <div className="p-3 bg-red-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Spent</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalSpent.toLocaleString()}
              </p>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="card"
        >
          <div className="flex items-center">
            <div className={`p-3 rounded-lg ${remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'}`}>
              <Target className={`h-6 w-6 ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Remaining</p>
              <p className={`text-2xl font-semibold ${remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${Math.abs(remainingBudget).toLocaleString()}
                {remainingBudget < 0 && ' over'}
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Budget Categories */}
      <div className="card">
        <h3 className="text-lg font-semibold text-gray-900 mb-6">Budget Categories</h3>
        
        <div className="space-y-6">
          {budgets.map((budget, index) => {
            const percentage = Math.min((budget.spent / budget.budgeted) * 100, 100)
            const remaining = budget.budgeted - budget.spent
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getStatusIcon(budget.spent, budget.budgeted)}
                    <div>
                      <h4 className="font-medium text-gray-900">{budget.category}</h4>
                      <p className="text-sm text-gray-500 capitalize">{budget.period}</p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">
                      ${budget.spent.toLocaleString()} / ${budget.budgeted.toLocaleString()}
                    </p>
                    <p className={`text-xs ${remaining >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {remaining >= 0 ? `$${remaining} left` : `$${Math.abs(remaining)} over`}
                    </p>
                  </div>
                </div>
                
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={`h-3 rounded-full ${getProgressColor(budget.spent, budget.budgeted)}`}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500">
                  <span>0%</span>
                  <span>{Math.round(percentage)}%</span>
                  <span>100%</span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Budget Insights */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Budget Performance</h3>
          
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">On Track</span>
              <span className="text-sm font-medium text-green-600">2 categories</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Approaching Limit</span>
              <span className="text-sm font-medium text-yellow-600">1 category</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Over Budget</span>
              <span className="text-sm font-medium text-red-600">1 category</span>
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommendations</h3>
          
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
              <p className="text-sm text-gray-600">
                Your Entertainment spending is over budget. Consider reducing discretionary expenses.
              </p>
            </div>
            <div className="flex items-start space-x-3">
              <CheckCircle className="h-4 w-4 text-green-500 mt-0.5" />
              <p className="text-sm text-gray-600">
                Great job staying under budget for Shopping! You're saving $280 this month.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  )
}

export default Budget
