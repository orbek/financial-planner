import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  CreditCard,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  Loader2
} from 'lucide-react'
import { 
  useMockDashboardOverview as useDashboardOverview, 
  useMockIncomeExpensesChart as useIncomeExpensesChart, 
  useMockHealthScore as useHealthScore 
} from '../hooks/useMockData'
import IncomeExpenseChart from '../components/charts/IncomeExpenseChart'
import SpendingByCategoryChart from '../components/charts/SpendingByCategoryChart'
import HealthScoreCard from '../components/HealthScoreCard'

const Dashboard = () => {
  const { data: overview, isLoading: overviewLoading } = useDashboardOverview()
  const { data: chartData, isLoading: chartLoading } = useIncomeExpensesChart()
  const { data: healthData, isLoading: healthLoading } = useHealthScore()

  if (overviewLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
      </div>
    )
  }

  const stats = [
    {
      title: 'Total Balance',
      value: overview?.overview.totalBalance || 0,
      change: '+2.1%',
      changeType: 'positive' as const,
      icon: DollarSign,
    },
    {
      title: 'Monthly Income',
      value: overview?.overview.totalIncome || 0,
      change: '+5.4%',
      changeType: 'positive' as const,
      icon: TrendingUp,
    },
    {
      title: 'Monthly Expenses',
      value: overview?.overview.totalExpenses || 0,
      change: '-1.2%',
      changeType: 'negative' as const,
      icon: TrendingDown,
    },
    {
      title: 'Net Income',
      value: overview?.overview.netIncome || 0,
      change: '+8.7%',
      changeType: 'positive' as const,
      icon: Activity,
    },
  ]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back! Here's your financial overview.</p>
        </div>
        
        <div className="flex items-center space-x-3">
          <select className="input w-auto">
            <option>Last 30 days</option>
            <option>Last 90 days</option>
            <option>Last 6 months</option>
            <option>Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <motion.div
            key={stat.title}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: index * 0.1 }}
            className="card"
          >
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <stat.icon className="h-6 w-6 text-primary-600" />
                </div>
              </div>
              <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{stat.title}</p>
                <div className="flex items-baseline">
                  <p className="text-2xl font-semibold text-gray-900">
                    ${stat.value.toLocaleString()}
                  </p>
                  <div className="ml-2 flex items-baseline text-sm">
                    <span
                      className={`flex items-center ${
                        stat.changeType === 'positive'
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {stat.changeType === 'positive' ? (
                        <ArrowUpRight className="h-3 w-3 mr-1" />
                      ) : (
                        <ArrowDownRight className="h-3 w-3 mr-1" />
                      )}
                      {stat.change}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income vs Expenses Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.4 }}
          className="card"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-gray-900">
              Income vs Expenses
            </h3>
            <select className="input w-auto text-sm">
              <option value="monthly">Monthly</option>
              <option value="weekly">Weekly</option>
              <option value="daily">Daily</option>
            </select>
          </div>
          
          {chartLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-6 w-6 animate-spin text-primary-600" />
            </div>
          ) : (
            <IncomeExpenseChart data={chartData?.chartData || []} />
          )}
        </motion.div>

        {/* Spending by Category */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.5 }}
          className="card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Spending by Category
          </h3>
          
          <SpendingByCategoryChart data={overview?.spendingByCategory || {}} />
        </motion.div>
      </div>

      {/* Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Health Score */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.6 }}
        >
          <HealthScoreCard 
            data={healthData} 
            isLoading={healthLoading} 
          />
        </motion.div>

        {/* Account Breakdown */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.7 }}
          className="lg:col-span-2 card"
        >
          <h3 className="text-lg font-semibold text-gray-900 mb-6">
            Account Breakdown
          </h3>
          
          <div className="space-y-4">
            {overview?.accountBreakdown.map((account) => (
              <div key={account.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="p-2 bg-white rounded-lg">
                    <CreditCard className="h-5 w-5 text-gray-600" />
                  </div>
                  <div className="ml-3">
                    <p className="text-sm font-medium text-gray-900">{account.name}</p>
                    <p className="text-sm text-gray-500 capitalize">{account.type}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-gray-900">
                    {account.currency} {account.balance.toLocaleString()}
                  </p>
                  <p className={`text-xs ${account.balance >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                    {account.balance >= 0 ? 'Credit' : 'Debit'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Recent Activity */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, delay: 0.8 }}
        className="card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <button className="text-primary-600 hover:text-primary-700 text-sm font-medium">
            View All
          </button>
        </div>
        
        <div className="text-center py-8 text-gray-500">
          <Activity className="h-8 w-8 mx-auto mb-2 opacity-50" />
          <p>Recent transactions will appear here</p>
          <p className="text-sm">Add some transactions to see your activity</p>
        </div>
      </motion.div>
    </div>
  )
}

export default Dashboard
