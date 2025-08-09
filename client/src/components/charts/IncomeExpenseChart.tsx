import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts'

interface ChartData {
  period: string
  income: number
  expenses: number
  net: number
}

interface IncomeExpenseChartProps {
  data: ChartData[]
}

const IncomeExpenseChart: React.FC<IncomeExpenseChartProps> = ({ data }) => {
  const formatCurrency = (value: number) => `$${value.toLocaleString()}`
  
  const formatPeriod = (period: string) => {
    // Format YYYY-MM to Month YYYY
    if (period.includes('-')) {
      const [year, month] = period.split('-')
      const date = new Date(parseInt(year), parseInt(month) - 1)
      return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
    }
    return period
  }

  return (
    <div className="h-64">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="period" 
            tick={{ fontSize: 12 }}
            tickFormatter={formatPeriod}
          />
          <YAxis 
            tick={{ fontSize: 12 }}
            tickFormatter={formatCurrency}
          />
          <Tooltip 
            formatter={(value: number, name: string) => [formatCurrency(value), name]}
            labelFormatter={formatPeriod}
            contentStyle={{
              backgroundColor: 'white',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
            }}
          />
          <Legend />
          <Bar 
            dataKey="income" 
            name="Income" 
            fill="#22c55e" 
            radius={[2, 2, 0, 0]}
          />
          <Bar 
            dataKey="expenses" 
            name="Expenses" 
            fill="#ef4444" 
            radius={[2, 2, 0, 0]}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}

export default IncomeExpenseChart
