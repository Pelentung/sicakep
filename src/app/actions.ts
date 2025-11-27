'use server';

import { getSpendingInsights, type SpendingInsightsInput } from '@/ai/flows/spending-insights';
import { addTransaction, getFinancialSummary, getSpendingByCategory, getTransactions } from '@/lib/data';
import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { Transaction } from '@/lib/types';
import type { Merchant } from '@/lib/merchant-data';


export async function getAIInsightsAction(userId: string, selectedMonth: Date): Promise<{ success: boolean; insights?: string[]; error?: string; }> {
  try {
    const start = startOfMonth(selectedMonth);
    const end = endOfMonth(selectedMonth);

    const allTransactions = getTransactions();

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
  // Anda harus menggunakan kunci API rahasia Anda, yang harus disimpan dengan aman
  // sebagai environment variable di server, bukan di kode frontend.

  try {
    // CONTOH: Simulasi pemanggilan API ke pihak ketiga
    // const response = await fetch('https://api.paymentgateway.com/v1/transact', {
    //   method: 'POST',
    //   headers: {
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${process.env.PAYMENT_GATEWAY_API_KEY}`, // Ambil API key dari environment variables
    //   },
    //   body: JSON.stringify({
    //     merchantId: merchant.id,
    //     customerId: customerId,
    //     amount: amount,
    //     // ... data lain yang mungkin diperlukan
    //   }),
    // });

    // const result = await response.json();

    // if (!response.ok || result.status !== 'success') {
    //   throw new Error(result.message || 'Gagal menghubungi penyedia layanan.');
    // }

    // --- (AKHIR DARI SIMULASI) ---

    // Jika pemanggilan API berhasil, catat transaksi di database lokal Anda.
    const transaction: Omit<Transaction, 'id' | 'userId'> = {
      type: 'expense',
      amount: amount,
      category: merchant.category,
      date: new Date().toISOString(),
      description: `${merchant.name} - No: ${customerId}`,
    };
    
    // Fungsi ini menambahkan transaksi ke file JSON lokal kita
    addTransaction(transaction);

    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    
    // Kirim respons sukses kembali ke client
    return { 
      success: true,
      message: `Pembayaran ${merchant.name} sebesar ${formattedAmount} telah berhasil.`
    };

  } catch (error: any) {
    console.error('Merchant Transaction Error:', error);
    // Kirim respons error kembali ke client
    return { success: false, error: error.message || 'Terjadi kesalahan pada server.' };
  }
}
