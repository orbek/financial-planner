import express from 'express';
import multer from 'multer';
import { supabase } from '../config/database';
import { authenticateToken, AuthenticatedRequest } from '../middleware/auth';
import { extractTransactionsFromPDF } from '../services/pdfExtractor';

const router = express.Router();

// Configure multer for file uploads
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB limit
  },
  fileFilter: (req, file, cb) => {
    if (file.mimetype === 'application/pdf') {
      cb(null, true);
    } else {
      cb(new Error('Only PDF files are allowed'));
    }
  },
});

// Upload and process statement
router.post('/upload', authenticateToken, upload.single('statement'), async (req: AuthenticatedRequest, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: { message: 'No file uploaded', status: 400 } });
    }

    const { account_id } = req.body;
    
    if (!account_id) {
      return res.status(400).json({ error: { message: 'Account ID is required', status: 400 } });
    }

    // Verify account belongs to user
    const { data: account, error: accountError } = await supabase
      .from('accounts')
      .select('id, name')
      .eq('id', account_id)
      .eq('user_id', req.user!.id)
      .single();

    if (accountError || !account) {
      return res.status(404).json({ error: { message: 'Account not found', status: 404 } });
    }

    // Extract transactions from PDF
    const extractedTransactions = await extractTransactionsFromPDF(req.file.buffer);
    
    if (!extractedTransactions || extractedTransactions.length === 0) {
      return res.status(400).json({ 
        error: { 
          message: 'No transactions could be extracted from the PDF', 
          status: 400 
        } 
      });
    }

    // Store transactions in database
    const transactionsToInsert = extractedTransactions.map(transaction => ({
      user_id: req.user!.id,
      account_id,
      date: transaction.date,
      amount: transaction.amount,
      type: transaction.type || 'Other',
      description: transaction.description,
      category: transaction.category,
    }));

    const { data: insertedTransactions, error: insertError } = await supabase
      .from('transactions')
      .insert(transactionsToInsert)
      .select();

    if (insertError) {
      throw insertError;
    }

    // Update account balance
    await updateAccountBalance(account_id);

    res.json({
      message: 'Statement processed successfully',
      transactionsAdded: insertedTransactions?.length || 0,
      transactions: insertedTransactions,
    });
  } catch (error) {
    console.error('Statement upload error:', error);
    res.status(500).json({ 
      error: { 
        message: error instanceof Error ? error.message : 'Failed to process statement', 
        status: 500 
      } 
    });
  }
});

// Get processing history
router.get('/history', authenticateToken, async (req: AuthenticatedRequest, res) => {
  try {
    // For now, we'll get recent bulk transaction imports
    // In a full implementation, you'd store statement processing records
    
    const { data: recentImports, error } = await supabase
      .from('transactions')
      .select(`
        created_at,
        account_id,
        accounts!inner(name)
      `)
      .eq('user_id', req.user!.id)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) throw error;

    // Group by date and account to identify bulk imports
    const importHistory: Record<string, any> = {};
    
    (recentImports || []).forEach(transaction => {
      const date = transaction.created_at.split('T')[0];
      const key = `${date}-${transaction.account_id}`;
      
      if (!importHistory[key]) {
        importHistory[key] = {
          date: transaction.created_at,
          account_name: (transaction.accounts as any).name,
          count: 0,
        };
      }
      
      importHistory[key].count++;
    });

    // Filter for likely bulk imports (more than 5 transactions on same day)
    const bulkImports = Object.values(importHistory)
      .filter((imp: any) => imp.count > 5)
      .sort((a: any, b: any) => new Date(b.date).getTime() - new Date(a.date).getTime());

    res.json({ importHistory: bulkImports });
  } catch (error) {
    console.error('Statement history error:', error);
    res.status(500).json({ error: { message: 'Failed to fetch statement history', status: 500 } });
  }
});

// Helper function to update account balance
async function updateAccountBalance(accountId: string) {
  try {
    const { data: transactions, error } = await supabase
      .from('transactions')
      .select('amount')
      .eq('account_id', accountId);

    if (error) throw error;

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
