import pdfParse from 'pdf-parse';
import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

export interface ExtractedTransaction {
  date: string;
  amount: number;
  type: string;
  description: string;
  category?: string;
}

export async function extractTransactionsFromPDF(buffer: Buffer): Promise<ExtractedTransaction[]> {
  try {
    // Extract text from PDF
    const pdfData = await pdfParse(buffer);
    const text = pdfData.text;

    if (!text || text.trim().length === 0) {
      throw new Error('No text could be extracted from the PDF');
    }

    // Use Gemini AI to extract structured transaction data
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    const prompt = `
You are a financial assistant. Extract structured transaction data from the following bank statement text.
Each transaction should include: Date (YYYY-MM-DD format), Amount (positive for income, negative for expenses), Type (Income/Expense), Description, and Category.

Please return the data as a JSON array of objects with these exact field names:
- date (string in YYYY-MM-DD format)
- amount (number, positive for income, negative for expenses)
- type (string: "Income" or "Expense")
- description (string)
- category (string: one of "Salary", "Food", "Transport", "Housing", "Entertainment", "Shopping", "Health", "Education", "Transfer", "Other")

Bank Statement Text:
${text}

Return only the JSON array, no additional text or formatting.`;

    const result = await model.generateContent(prompt);
    const response = result.response;
    let extractedText = response.text();

    // Clean up the response - remove markdown code blocks if present
    extractedText = extractedText.replace(/```json\n?/, '').replace(/\n?```/, '').trim();

    if (!extractedText) {
      throw new Error('AI model returned empty response');
    }

    // Parse the JSON response
    let transactions: ExtractedTransaction[];
    try {
      transactions = JSON.parse(extractedText);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', extractedText);
      throw new Error('AI response could not be parsed as valid JSON');
    }

    // Validate and clean up the extracted transactions
    const validTransactions = transactions
      .filter(t => t && typeof t === 'object')
      .map(transaction => {
        // Validate required fields
        if (!transaction.date || !transaction.description) {
          return null;
        }

        // Parse and validate date
        const date = new Date(transaction.date);
        if (isNaN(date.getTime())) {
          return null;
        }

        // Validate amount
        const amount = parseFloat(String(transaction.amount));
        if (isNaN(amount)) {
          return null;
        }

        // Determine type based on amount if not provided or invalid
        let type = transaction.type;
        if (!type || !['Income', 'Expense'].includes(type)) {
          type = amount >= 0 ? 'Income' : 'Expense';
        }

        // Set default category if not provided
        const category = transaction.category || 'Other';

        return {
          date: transaction.date,
          amount,
          type,
          description: transaction.description.trim(),
          category,
        };
      })
      .filter(t => t !== null) as ExtractedTransaction[];

    if (validTransactions.length === 0) {
      throw new Error('No valid transactions could be extracted from the statement');
    }

    return validTransactions;
  } catch (error) {
    console.error('PDF extraction error:', error);
    
    if (error instanceof Error) {
      throw error;
    }
    
    throw new Error('Unknown error occurred during PDF processing');
  }
}
