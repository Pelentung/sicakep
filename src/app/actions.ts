'use server';

import { getSpendingInsights, type SpendingInsightsInput } from '@/ai/flows/spending-insights';
import { getFinancialSummary, getSpendingByCategory } from '@/lib/data';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import { collection, getDocs, getFirestore, query, where } from 'firebase/firestore';
import { initializeFirebase } from '@/firebase'; // Assuming this can run on the server
import type { Transaction } from '@/lib/types';


// This is a simplified server-side init. In a real app, you'd share config.
const { firestore: db } = initializeFirebase();

export async function getAIInsightsAction(userId: string, selectedMonth: Date): Promise<{ success: boolean; insights?: string[]; error?: string; }> {
  try {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    const transactionsQuery = query(
        collection(db, 'users', userId, 'transactions'),
        where('date', '>=', start.toISOString()),
        where('date', '<=', end.toISOString())
    );
    
    const snapshot = await getDocs(transactionsQuery);
    const transactions = snapshot.docs.map(doc => doc.data() as Transaction);

    const summary = getFinancialSummary(transactions);
    const spendingByCategory = getSpendingByCategory(transactions);

    const input: SpendingInsightsInput = {
      income: summary.totalIncome,
      expenses: Object.entries(spendingByCategory).map(([category, amount]) => ({
        category,
        amount,
      })),
    };
    
    if (input.expenses.length === 0) {
      return { success: true, insights: ["Tidak ada data pengeluaran untuk dianalisis di bulan ini. Mulai lacak pengeluaran Anda untuk mendapatkan wawasan!"] };
    }

    const result = await getSpendingInsights(input);
    return { success: true, insights: result.insights };
  } catch (error) {
    console.error('AI Insight Error:', error);
    return { success: false, error: 'Gagal mendapatkan wawasan AI. Silakan coba lagi nanti.' };
  }
}
