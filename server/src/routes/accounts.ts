import express from 'express';
import { supabase, Account } from '../config/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import Joi from 'joi';

const router = express.Router();

// Validation schemas
const createAccountSchema = Joi.object({
  name: Joi.string().required().min(1).max(100),
  type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'loan', 'cash', 'other').required(),
  balance: Joi.number().default(0),
  currency: Joi.string().valid('USD', 'BRL', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD').default('USD'),
});

const updateAccountSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  type: Joi.string().valid('checking', 'savings', 'credit', 'investment', 'loan', 'cash', 'other'),
  balance: Joi.number(),
  currency: Joi.string().valid('USD', 'BRL', 'EUR', 'GBP', 'CAD', 'JPY', 'AUD'),
});

// Get all accounts for user
router.get('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { data: accounts, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    res.json({ accounts: accounts || [] });
  } catch (error) {
    console.error('Get accounts error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch accounts', status: 500 } });
  }
});

// Get single account
router.get('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    const { data: account, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Account not found', status: 404 } });
      }
      throw error;
    }

    res.json({ account });
  } catch (error) {
    console.error('Get account error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch account', status: 500 } });
  }
});

// Create new account
router.post('/', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { error: validationError, value } = createAccountSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({ 
        error: { 
          message: validationError.details[0].message, 
          status: 400 
        } 
      });
    }

    const accountData = {
      ...value,
      user_id: req.user!.id,
    };

    const { data: account, error } = await supabase
      .from('accounts')
      .insert([accountData])
      .select()
      .single();

    if (error) {
      throw error;
    }

    res.status(201).json({ account });
  } catch (error) {
    console.error('Create account error:', error);
    res.status(500).json({ error: { message: 'Failed to create account', status: 500 } });
  }
});

// Update account
router.put('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { error: validationError, value } = updateAccountSchema.validate(req.body);
    
    if (validationError) {
      return res.status(400).json({ 
        error: { 
          message: validationError.details[0].message, 
          status: 400 
        } 
      });
    }

    const { data: account, error } = await supabase
      .from('accounts')
      .update(value)
      .eq('id', id)
      .eq('user_id', req.user!.id)
      .select()
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return res.status(404).json({ error: { message: 'Account not found', status: 404 } });
      }
      throw error;
    }

    res.json({ account });
  } catch (error) {
    console.error('Update account error:', error);
    res.status(500).json({ error: { message: 'Failed to update account', status: 500 } });
  }
});

// Delete account
router.delete('/:id', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;

    // Check if account has transactions
    const { data: transactions, error: transactionError } = await supabase
      .from('transactions')
      .select('id')
      .eq('account_id', id)
      .limit(1);

    if (transactionError) {
      throw transactionError;
    }

    if (transactions && transactions.length > 0) {
      return res.status(400).json({ 
        error: { 
          message: 'Cannot delete account with existing transactions', 
          status: 400 
        } 
      });
    }

    const { error } = await supabase
      .from('accounts')
      .delete()
      .eq('id', id)
      .eq('user_id', req.user!.id);

    if (error) {
      throw error;
    }

    res.json({ message: 'Account deleted successfully' });
  } catch (error) {
    console.error('Delete account error:', error);
    res.status(500).json({ error: { message: 'Failed to delete account', status: 500 } });
  }
});

// Get account balance history
router.get('/:id/balance-history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    const { id } = req.params;
    const { days = 30 } = req.query;

    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('date, amount')
      .eq('account_id', id)
      .eq('user_id', req.user!.id)
      .gte('date', new Date(Date.now() - Number(days) * 24 * 60 * 60 * 1000).toISOString())
      .order('date', { ascending: true });

    if (error) {
      throw error;
    }

    // Calculate running balance
    let runningBalance = 0;
    const balanceHistory = (transactions || []).map(transaction => {
      runningBalance += transaction.amount;
      return {
        date: transaction.date,
        balance: runningBalance,
      };
    });

    res.json({ balanceHistory });
  } catch (error) {
    console.error('Get balance history error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch balance history', status: 500 } });
  }
});

export default router;
