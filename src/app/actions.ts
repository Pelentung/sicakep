'use server';

import { getSpendingInsights, type SpendingInsightsInput } from '@/ai/flows/spending-insights';
import { getInitialTransactions, getFinancialSummary, getSpendingByCategory } from '@/lib/data';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { Merchant } from '@/lib/merchant-data';


export async function getAIInsightsAction(userId: string, selectedMonth: Date): Promise<{ success: boolean; insights?: string[]; error?: string; }> {
  try {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    // AI action still reads from the source file for analysis
    const allTransactions = getInitialTransactions();

    const transactions = allTransactions.filter(t => {
        const transactionDate = parseISO(t.date);
        return transactionDate >= start && transactionDate <= end;
    });

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

export async function handleMerchantTransactionAction(
  userId: string,
  merchant: Merchant,
  amount: number,
  customerId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  console.log(`Memulai transaksi untuk: ${merchant.name}, User: ${userId}, Jumlah: ${amount}, ID Pelanggan: ${customerId}`);
  
  // =================================================================
  // --- TITIK INTEGRASI API PIHAK KETIGA ---
  // =================================================================
  // Di sinilah Anda akan memanggil API dari payment gateway atau aggregator PPOB.
  // Kode di sini hanya simulasi dan tidak melakukan transaksi nyata.

  try {
    // --- (SIMULASI PANGGILAN API) ---
    // Di aplikasi nyata, Anda akan menggunakan fetch() untuk memanggil API pihak ketiga
    // dan menunggu responsnya.
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulasi penundaan jaringan
    // --- (AKHIR DARI SIMULASI) ---

    // Jika pemanggilan API (simulasi) berhasil, kirim respons sukses.
    // Pencatatan transaksi sekarang ditangani di sisi klien melalui context.
    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    
    return { 
      success: true,
      message: `Pembayaran ${merchant.name} sebesar ${formattedAmount} telah berhasil.`
    };

  } catch (error: any) {
    console.error('Merchant Transaction Error:', error);
    return { success: false, error: error.message || 'Terjadi kesalahan pada server.' };
  }
}
