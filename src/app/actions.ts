'use server';

import { parseISO, startOfMonth, endOfMonth } from 'date-fns';
import type { Merchant } from '@/lib/merchant-data';
import type { Transaction } from '@/lib/types';


export async function getAIInsightsAction(transactions: Transaction[], selectedMonth: Date): Promise<{ success: boolean; insights?: string[]; error?: string; }> {
  // This is a placeholder. In a real app with a backend, this would call an AI service.
  // For local storage version, we provide a mock response.
  await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate network delay

  const start = startOfMonth(selectedMonth);
  const end = endOfMonth(selectedMonth);

  const filteredTransactions = transactions.filter(t => {
      const transactionDate = parseISO(t.date);
      return transactionDate >= start && transactionDate <= end;
  });

  const totalExpenses = filteredTransactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);

  if (totalExpenses === 0) {
    return { success: true, insights: ["Tidak ada data pengeluaran untuk dianalisis di bulan ini. Mulai lacak pengeluaran Anda untuk mendapatkan wawasan!"] };
  }
  
  const insights = [
      `Anda menghabiskan total ${new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(totalExpenses)} bulan ini.`,
      "Analisis terperinci tidak tersedia dalam mode demo. Hubungkan ke backend untuk mendapatkan wawasan AI.",
      "Coba periksa kategori pengeluaran terbesar Anda di halaman laporan."
  ];

  return { success: true, insights: insights };
}

export async function handleMerchantTransactionAction(
  merchant: Merchant,
  amount: number,
  customerId: string
): Promise<{ success: boolean; message?: string; error?: string }> {
  console.log(`Memulai transaksi untuk: ${merchant.name}, Jumlah: ${amount}, ID Pelanggan: ${customerId}`);
  
  // This is a simulation since we don't have a backend.
  try {
    await new Promise(resolve => setTimeout(resolve, 1000)); // Simulate API call delay

    const formattedAmount = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(amount);
    
    return { 
      success: true,
      message: `(Simulasi) Pembayaran ${merchant.name} sebesar ${formattedAmount} telah berhasil.`
    };

  } catch (error: any) {
    console.error('Simulated Merchant Transaction Error:', error);
    return { success: false, error: error.message || 'Terjadi kesalahan simulasi pada server.' };
  }
}
