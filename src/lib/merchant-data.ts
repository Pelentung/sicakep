import type { IconName } from 'lucide-react';

export type Merchant = {
  id: string;
  name: string;
  description: string;
  icon: IconName;
  category: string;
  type: 'payment' | 'purchase';
  label: string;
  placeholder: string;
};

export const merchants: Merchant[] = [
  {
    id: 'pln',
    name: 'PLN',
    description: 'Token & Tagihan Listrik',
    icon: 'Bolt',
    category: 'Tagihan',
    type: 'payment',
    label: 'Nomor Meter / ID Pelanggan',
    placeholder: 'Contoh: 1234567890',
  },
  {
    id: 'pulsa',
    name: 'Pulsa',
    description: 'Isi ulang pulsa prabayar',
    icon: 'Smartphone',
    category: 'Belanja',
    type: 'purchase',
    label: 'Nomor HP',
    placeholder: 'Contoh: 081234567890',
  },
  {
    id: 'pdam',
    name: 'PDAM',
    description: 'Tagihan air',
    icon: 'Droplet',
    category: 'Tagihan',
    type: 'payment',
    label: 'Nomor Pelanggan',
    placeholder: 'Contoh: 987654321',
  },
  {
    id: 'internet',
    name: 'Internet & TV',
    description: 'Tagihan internet & TV kabel',
    icon: 'Wifi',
    category: 'Tagihan',
    type: 'payment',
    label: 'Nomor Pelanggan',
    placeholder: 'Contoh: 1122334455',
  },
  {
    id: 'credit',
    name: 'Cicilan Kredit',
    description: 'Pembayaran angsuran kredit',
    icon: 'CreditCard',
    category: 'Tagihan',
    type: 'payment',
    label: 'Nomor Kontrak',
    placeholder: 'Contoh: 555666777',
  },
  {
    id: 'bpjs',
    name: 'BPJS',
    description: 'Iuran BPJS Kesehatan',
    icon: 'HeartPulse',
    category: 'Kesehatan',
    type: 'payment',
    label: 'Nomor Virtual Account',
    placeholder: 'Contoh: 8888801234567890',
  },
  {
    id: 'game',
    name: 'Voucher Game',
    description: 'Top-up voucher game',
    icon: 'Gamepad2',
    category: 'Hiburan',
    type: 'purchase',
    label: 'User ID Game',
    placeholder: 'Contoh: 987654321 (1234)',
  },
];
