import { useState } from 'react'
import { motion } from 'framer-motion'
import { Target, Plus, TrendingUp, Calendar, DollarSign } from 'lucide-react'

// New feature - Financial Goals tracking
const Goals = () => {
  const [goals] = useState([
    {
      id: '1',
      name: 'Emergency Fund',
      target: 10000,
      current: 6500,
      targetDate: '2024-12-31',
      category: 'savings',
      color: '#22c55e',
    },
    {
      id: '2',
      name: 'Vacation to Europe',
      target: 5000,
      current: 2800,
      targetDate: '2024-08-01',
      category: 'travel',
      color: '#3b82f6',
    },
    {
      id: '3',
      name: 'New Car Down Payment',
      target: 8000,
      current: 1200,
      targetDate: '2025-06-01',
      category: 'transportation',
      color: '#f59e0b',
    },
    {
      id: '4',
      name: 'House Down Payment',
      target: 50000,
      current: 15000,
      targetDate: '2026-01-01',
      category: 'housing',
      color: '#8b5cf6',
    },
  ])

  const totalTargets = goals.reduce((sum, goal) => sum + goal.target, 0)
  const totalSaved = goals.reduce((sum, goal) => sum + goal.current, 0)
  const overallProgress = (totalSaved / totalTargets) * 100

  const getProgressColor = (current: number, target: number) => {
    const percentage = (current / target) * 100
    if (percentage >= 100) return 'bg-green-500'
    if (percentage >= 75) return 'bg-blue-500'
    if (percentage >= 50) return 'bg-yellow-500'
    return 'bg-gray-400'
  }

  const getDaysRemaining = (targetDate: string) => {
    const today = new Date()
    const target = new Date(targetDate)
    const diffTime = target.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays
  }

  const getMonthlyTarget = (current: number, target: number, targetDate: string) => {
    const remaining = target - current
    const daysRemaining = getDaysRemaining(targetDate)
    const monthsRemaining = Math.max(daysRemaining / 30, 1)
    return remaining / monthsRemaining
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Financial Goals</h1>
          <p className="text-gray-600">Track your progress towards financial milestones</p>
        </div>
        
        <button className="btn btn-primary btn-md flex items-center space-x-2">
          <Plus className="h-4 w-4" />
          <span>Create Goal</span>
        </button>
      </div>

      {/* Goals Overview */}
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
              <p className="text-sm font-medium text-gray-500">Total Goals</p>
              <p className="text-2xl font-semibold text-gray-900">{goals.length}</p>
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
            <div className="p-3 bg-green-100 rounded-lg">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Total Saved</p>
              <p className="text-2xl font-semibold text-gray-900">
                ${totalSaved.toLocaleString()}
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
            <div className="p-3 bg-purple-100 rounded-lg">
              <TrendingUp className="h-6 w-6 text-purple-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-500">Overall Progress</p>
              <p className="text-2xl font-semibold text-gray-900">
                {Math.round(overallProgress)}%
              </p>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {goals.map((goal, index) => {
          const progress = (goal.current / goal.target) * 100
          const remaining = goal.target - goal.current
          const daysRemaining = getDaysRemaining(goal.targetDate)
          const monthlyTarget = getMonthlyTarget(goal.current, goal.target, goal.targetDate)
          
          return (
            <motion.div
              key={goal.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="card hover:shadow-lg transition-shadow"
            >
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{goal.name}</h3>
                  <p className="text-sm text-gray-500 capitalize">{goal.category}</p>
                </div>
                
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    ${goal.current.toLocaleString()} / ${goal.target.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">
                    {Math.round(progress)}% complete
                  </p>
                </div>
              </div>
              
              {/* Progress Bar */}
              <div className="mb-4">
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(progress, 100)}%` }}
                    transition={{ duration: 1, delay: index * 0.1 }}
                    className={getProgressColor(goal.current, goal.target)}
                    style={{ borderRadius: '9999px' }}
                  />
                </div>
              </div>
              
              {/* Goal Details */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">Remaining</p>
                  <p className="font-medium text-gray-900">${remaining.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-gray-500">Target Date</p>
                  <p className="font-medium text-gray-900">
                    {new Date(goal.targetDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Days Left</p>
                  <p className={`font-medium ${daysRemaining < 30 ? 'text-red-600' : 'text-gray-900'}`}>
                    {daysRemaining > 0 ? `${daysRemaining} days` : 'Overdue'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">Monthly Need</p>
                  <p className="font-medium text-gray-900">
                    ${Math.round(monthlyTarget).toLocaleString()}
                  </p>
                </div>
              </div>
              
              {/* Action Button */}
              <div className="mt-4 pt-4 border-t border-gray-100">
                <button className="w-full btn btn-primary btn-sm">
                  Add Contribution
                </button>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Goal Insights */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="card"
      >
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Goal Insights</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">1</div>
            <p className="text-sm text-gray-600">On Track</p>
          </div>
          
          <div className="text-center p-4 bg-yellow-50 rounded-lg">
            <div className="text-2xl font-bold text-yellow-600">2</div>
            <p className="text-sm text-gray-600">Needs Attention</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">$2,850</div>
            <p className="text-sm text-gray-600">Avg. Monthly Savings</p>
          </div>
          
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">18</div>
            <p className="text-sm text-gray-600">Months to Complete</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}

export default Goals
