import express from 'express';
import { supabase, Transaction } from '../config/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createTransactionSchema = Joi.object({
  account_id: Joi.string().required(),
  date: Joi.date().required(),
  amount: Joi.number().required(),
  type: Joi.string().required(),
  description: Joi.string().required().min(1).max(500),
  category: Joi.string().max(100),
});

const updateTransactionSchema = Joi.object({
  account_id: Joi.string(),
  date: Joi.date(),
  amount: Joi.number(),
  type: Joi.string(),
  description: Joi.string().min(1).max(500),
  category: Joi.string().max(100),
});

// Get all transactions for user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { 
      account_id, 
      category, 
      type, 
      start_date, 
      end_date, 
      limit = 100, 
      offset = 0 
    } = req.query;

    let query = supabase
      .from('transactions')
      .select(`
        *,
        accounts!inner(id, name, type)
      `)
      .eq('user_id', req.user!.id);

    // Apply filters
    if (account_id) {
      query = query.eq('account_id', account_id);
    }

    if (category) {
      query = query.eq('category', category);
    }

    if (type) {
      query = query.eq('type', type);
    }

    if (start_date) {
      query = query.gte('date', start_date);
    }

    if (end_date) {
      query = query.lte('date', end_date);
    }

    const { data: transactions, error, count } = await query
      .order('date', { ascending: false })
      .range(Number(offset), Number(offset) + Number(limit) - 1);

    if (error) {
      throw error;
    }

    res.json({ 
      transactions: transactions || [], 
      pagination: {
        limit: Number(limit),
        offset: Number(offset),
        total: count || 0,
      }
    });
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch transactions', status: 500 } });
  }
});

// Get single transaction
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data: transaction, error } = await supabase
      .from('transactions')
      .select(`
        *,
        accounts!inner(id, name, type)
      `)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Transaction not found', status: 404 } });
      }
      throw error;
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Get transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch transaction', status: 500 } });
  }
});

// Create new transaction
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { error: validationError, value } = createTransactionSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({ 
        error: { 
          message: validationError.details[0].message, 
          status: 400 
        } 
      });
    }

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id')
      .eq('id', value.account_id)
      .eq('user_id', req.user!.id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: { message: 'Account not found', status: 404 } });
    }

    const transactionData = {
      ...value,
      user_id: req.user!.id,
    };

    const { data: transaction, error } = await supabase
      .from('transactions')
      .insert([transactionData])
      .select(`
        *,
        accounts!inner(id, name, type)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Update account balance
    await updateAccountBalance(value.account_id);

    res.status(201).json({ transaction });
  } catch (error) {
    console.error('Create transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to create transaction', status: 500 } });
  }
});

// Update transaction
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = updateTransactionSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({ 
        error: { 
          message: validationError.details[0].message, 
          status: 400 
        } 
      });
    }

    // Get the current transaction to know which account to update
    const { data: currentTransaction, error: getCurrentError } = await supabase
      .from('transactions')
      .select('account_id')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (getCurrentError || !currentTransaction) {
      return res.status(404).json({ error: { message: 'Transaction not found', status: 404 } });
    }

    // If account_id is being changed, verify new account belongs to user
    if (value.account_id && value.account_id !== currentTransaction.account_id) {
      const { data: account, error: accountError } = await supabase
        .from('accounts')
        .select('id')
        .eq('id', value.account_id)
        .eq('user_id', req.user!.id)
        .single();

      if (accountError || !account) {
        return res.status(404).json({ error: { message: 'New account not found', status: 404 } });
      }
    }

    const { data: transaction, error } = await supabase
      .from('transactions')
      .update(value)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select(`
        *,
        accounts!inner(id, name, type)
      `)
      .single();

    if (error) {
      throw error;
    }

    // Update account balances
    await updateAccountBalance(currentTransaction.account_id);
    if (value.account_id && value.account_id !== currentTransaction.account_id) {
      await updateAccountBalance(value.account_id);
    }

    res.json({ transaction });
  } catch (error) {
    console.error('Update transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to update transaction', status: 500 } });
  }
});

// Delete transaction
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Get the transaction to know which account to update
    const { data: transaction, error: getTransactionError } = await supabase
      .from('transactions')
      .select('account_id')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (getTransactionError || !transaction) {
      return res.status(404).json({ error: { message: 'Transaction not found', status: 404 } });
    }

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      throw error;
    }

    // Update account balance
    await updateAccountBalance(transaction.account_id);

    res.json({ message: 'Transaction deleted successfully' });
  } catch (error) {
    console.error('Delete transaction error:', error);
    res.status(500).json({ error: { message: 'Failed to delete transaction', status: 500 } });
  }
});

// Get transaction categories
router.get('/categories/list', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: categories, error } = await supabase
      .from('transactions')
      .select('category')
      .eq('user_id', req.user!.id)
      .not('category', 'is', null);

    if (error) {
      throw error;
    }

    const uniqueCategories = [...new Set((categories || []).map(t => t.category))];
    
    res.json({ categories: uniqueCategories });
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch categories', status: 500 } });
  }
});

// Helper function to update account balance
async function updateAccountBalance(accountId: string) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('account_id', accountId);

    if (error) {
      throw error;
    }

    const balance = (transactions || []).reduce((sum, t) => sum + t.amount, 0);

    await supabase
      .from('accounts')
      .update({ balance })
      .eq('id', accountId);
  } catch (error) {
    console.error('Update account balance error:', error);
  }
}

export default router;
