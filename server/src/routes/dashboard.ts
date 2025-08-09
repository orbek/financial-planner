import express from 'express';
import { supabase } from '../config/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';

const router = express.Router();

// Get dashboard overview
router.get('/overview', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Get accounts summary
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('id, name, type, balance, currency')
      .eq('user_id', userId);

    if (accountsError) throw accountsError;

    // Get transactions summary for the last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString();
    
    const { data: recentTransactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, type, date, category')
      .eq('user_id', userId)
      .gte('date', thirtyDaysAgo);

    if (transactionsError) throw transactionsError;

    // Calculate totals
    const totalBalance = (accounts || []).reduce((sum, acc) => sum + acc.balance, 0);
    const totalIncome = (recentTransactions || [])
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    const totalExpenses = Math.abs((recentTransactions || [])
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));

    // Calculate spending by category
    const spendingByCategory = (recentTransactions || [])
      .filter(t => t.amount < 0)
      .reduce((acc, t) => {
        const category = t.category || 'Other';
        acc[category] = (acc[category] || 0) + Math.abs(t.amount);
        return acc;
      }, {} as Record<string, number>);

    // Get account breakdown
    const accountBreakdown = (accounts || []).map(acc => ({
      id: acc.id,
      name: acc.name,
      type: acc.type,
      balance: acc.balance,
      currency: acc.currency,
    }));

    res.json({
      overview: {
        totalBalance,
        totalIncome,
        totalExpenses,
        netIncome: totalIncome - totalExpenses,
        accountsCount: (accounts || []).length,
        transactionsCount: (recentTransactions || []).length,
      },
      spendingByCategory,
      accountBreakdown,
    });
  } catch (error) {
    console.error('Dashboard overview error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch dashboard data', status: 500 } });
  }
});

// Get income vs expenses chart data
router.get('/income-expenses', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { period = 'monthly', months = 6 } = req.query;
    const userId = req.user!.id;
    
    const monthsAgo = new Date();
    monthsAgo.setMonth(monthsAgo.getMonth() - Number(months));
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', monthsAgo.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    // Group by period
    const groupedData = (transactions || []).reduce((acc, t) => {
      const date = new Date(t.date);
      let key: string;
      
      if (period === 'monthly') {
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      } else if (period === 'weekly') {
        const week = Math.ceil(date.getDate() / 7);
        key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-W${week}`;
      } else {
        key = date.toISOString().split('T')[0];
      }
      
      if (!acc[key]) {
        acc[key] = { income: 0, expenses: 0 };
      }
      
      if (t.amount > 0) {
        acc[key].income += t.amount;
      } else {
        acc[key].expenses += Math.abs(t.amount);
      }
      
      return acc;
    }, {} as Record<string, { income: number; expenses: number }>);

    const chartData = Object.entries(groupedData).map(([period, data]) => ({
      period,
      income: data.income,
      expenses: data.expenses,
      net: data.income - data.expenses,
    }));

    res.json({ chartData });
  } catch (error) {
    console.error('Income/expenses chart error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch chart data', status: 500 } });
  }
});

// Get account balance trends
router.get('/balance-trends', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { days = 30 } = req.query;
    const userId = req.user!.id;
    
    const daysAgo = new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000);
    
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select(`
        amount,
        date,
        account_id,
        accounts!inner(name)
      `)
      .eq('user_id', userId)
      .gte('date', daysAgo.toISOString())
      .order('date', { ascending: true });

    if (error) throw error;

    // Calculate running balances for each account
    const accountBalances: Record<string, Array<{ date: string; balance: number }>> = {};
    const runningBalances: Record<string, number> = {};
    
    (transactions || []).forEach(t => {
      const accountId = t.account_id;
      const accountName = (t.accounts as any).name;
      
      if (!accountBalances[accountName]) {
        accountBalances[accountName] = [];
        runningBalances[accountName] = 0;
      }
      
      runningBalances[accountName] += t.amount;
      accountBalances[accountName].push({
        date: t.date,
        balance: runningBalances[accountName],
      });
    });

    res.json({ balanceTrends: accountBalances });
  } catch (error) {
    console.error('Balance trends error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch balance trends', status: 500 } });
  }
});

// Get financial health score
router.get('/health-score', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const userId = req.user!.id;
    
    // Get recent transactions (last 3 months)
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);
    
    const { data: transactions, error: transactionsError } = await supabase
      .from('transactions')
      .select('amount, date')
      .eq('user_id', userId)
      .gte('date', threeMonthsAgo.toISOString());

    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('balance, type')
      .eq('user_id', userId);

    if (transactionsError || accountsError) {
      throw transactionsError || accountsError;
    }

    // Calculate health metrics
    const totalIncome = (transactions || [])
      .filter(t => t.amount > 0)
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalExpenses = Math.abs((transactions || [])
      .filter(t => t.amount < 0)
      .reduce((sum, t) => sum + t.amount, 0));
    
    const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpenses) / totalIncome) * 100 : 0;
    
    const totalAssets = (accounts || [])
      .filter(acc => acc.balance > 0)
      .reduce((sum, acc) => sum + acc.balance, 0);
    
    const totalLiabilities = Math.abs((accounts || [])
      .filter(acc => acc.balance < 0)
      .reduce((sum, acc) => sum + acc.balance, 0));
    
    const debtToAssetRatio = totalAssets > 0 ? (totalLiabilities / totalAssets) * 100 : 0;
    
    // Calculate score (0-100)
    let score = 100;
    
    // Savings rate component (40% of score)
    if (savingsRate < 10) score -= 40;
    else if (savingsRate < 20) score -= 20;
    else if (savingsRate > 30) score += 10;
    
    // Debt ratio component (30% of score)
    if (debtToAssetRatio > 50) score -= 30;
    else if (debtToAssetRatio > 30) score -= 15;
    else if (debtToAssetRatio < 10) score += 10;
    
    // Account diversity (20% of score)
    const accountTypes = new Set((accounts || []).map(acc => acc.type));
    if (accountTypes.size < 2) score -= 20;
    else if (accountTypes.size >= 3) score += 10;
    
    // Transaction consistency (10% of score)
    const monthlyTransactions = (transactions || []).length / 3;
    if (monthlyTransactions < 5) score -= 10;
    else if (monthlyTransactions > 20) score += 5;
    
    score = Math.max(0, Math.min(100, score));
    
    res.json({
      healthScore: Math.round(score),
      metrics: {
        savingsRate: Math.round(savingsRate * 100) / 100,
        debtToAssetRatio: Math.round(debtToAssetRatio * 100) / 100,
        totalAssets,
        totalLiabilities,
        accountDiversity: accountTypes.size,
      },
      recommendations: generateRecommendations(score, savingsRate, debtToAssetRatio, accountTypes.size),
    });
  } catch (error) {
    console.error('Health score error:', error);
    res.status(500).json({ error: { message: 'Failed to calculate health score', status: 500 } });
  }
});

function generateRecommendations(score: number, savingsRate: number, debtRatio: number, accountDiversity: number) {
  const recommendations = [];
  
  if (savingsRate < 10) {
    recommendations.push({
      type: 'savings',
      priority: 'high',
      message: 'Increase your savings rate to at least 10% of income',
    });
  }
  
  if (debtRatio > 30) {
    recommendations.push({
      type: 'debt',
      priority: 'high',
      message: 'Focus on reducing debt to improve your debt-to-asset ratio',
    });
  }
  
  if (accountDiversity < 2) {
    recommendations.push({
      type: 'diversification',
      priority: 'medium',
      message: 'Consider opening different types of accounts for better financial planning',
    });
  }
  
  if (score > 80) {
    recommendations.push({
      type: 'investment',
      priority: 'low',
      message: 'Great job! Consider exploring investment opportunities to grow your wealth',
    });
  }
  
  return recommendations;
}

export default router;
