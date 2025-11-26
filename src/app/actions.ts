'use server';

import { getSpendingInsights, type SpendingInsightsInput } from '@/ai/flows/spending-insights';
import { getFinancialSummary, getSpendingByCategory, getTransactions } from '@/lib/data';

export async function getAIInsightsAction(): Promise<{ success: boolean; insights?: string[]; error?: string; }> {
  try {
    const transactions = getTransactions();
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
      return { success: true, insights: ["Tidak ada data pengeluaran untuk dianalisis. Mulai lacak pengeluaran Anda untuk mendapatkan wawasan!"] };
    }

    const result = await getSpendingInsights(input);
    return { success: true, insights: result.insights };
  } catch (error) {
    console.error('AI Insight Error:', error);
    return { success: false, error: 'Gagal mendapatkan wawasan AI. Silakan coba lagi nanti.' };
  }
}
