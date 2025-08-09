import { motion } from 'framer-motion'
import { TrendingUp, AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'

interface HealthScoreData {
  healthScore: number
  metrics: {
    savingsRate: number
    debtToAssetRatio: number
    totalAssets: number
    totalLiabilities: number
    accountDiversity: number
  }
  recommendations: Array<{
    type: string
    priority: 'high' | 'medium' | 'low'
    message: string
  }>
}

interface HealthScoreCardProps {
  data?: HealthScoreData
  isLoading: boolean
}

const HealthScoreCard: React.FC<HealthScoreCardProps> = ({ data, isLoading }) => {
  if (isLoading) {
    return (
      <div className="card">
        <div className="flex items-center justify-center h-48">
          <Loader2 className="h-8 w-8 animate-spin text-primary-600" />
        </div>
      </div>
    )
  }

  if (!data) {
    return (
      <div className="card">
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <TrendingUp className="h-6 w-6 text-gray-400" />
          </div>
          <p className="text-gray-500">No health score data</p>
          <p className="text-sm text-gray-400">Add accounts and transactions to see your score</p>
        </div>
      </div>
    )
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent'
    if (score >= 60) return 'Good'
    if (score >= 40) return 'Fair'
    return 'Needs Improvement'
  }

  const getScoreBgColor = (score: number) => {
    if (score >= 80) return 'bg-green-100'
    if (score >= 60) return 'bg-yellow-100'
    return 'bg-red-100'
  }

  return (
    <div className="card">
      <h3 className="text-lg font-semibold text-gray-900 mb-6">
        Financial Health Score
      </h3>
      
      {/* Score Circle */}
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-24 h-24 rounded-full ${getScoreBgColor(data.healthScore)} mb-4`}>
          <span className={`text-3xl font-bold ${getScoreColor(data.healthScore)}`}>
            {data.healthScore}
          </span>
        </div>
        <p className={`text-sm font-medium ${getScoreColor(data.healthScore)}`}>
          {getScoreLabel(data.healthScore)}
        </p>
      </div>

      {/* Metrics */}
      <div className="space-y-3 mb-6">
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Savings Rate</span>
          <span className="text-sm font-medium">{data.metrics.savingsRate}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Debt Ratio</span>
          <span className="text-sm font-medium">{data.metrics.debtToAssetRatio}%</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm text-gray-600">Account Diversity</span>
          <span className="text-sm font-medium">{data.metrics.accountDiversity} types</span>
        </div>
      </div>

      {/* Top Recommendations */}
      <div>
        <h4 className="text-sm font-medium text-gray-900 mb-3">Top Recommendations</h4>
        <div className="space-y-2">
          {data.recommendations.slice(0, 2).map((rec, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-start space-x-2"
            >
              {rec.priority === 'high' ? (
                <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
              ) : (
                <CheckCircle className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
              )}
              <p className="text-xs text-gray-600 leading-relaxed">{rec.message}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default HealthScoreCard
