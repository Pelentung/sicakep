'use client';

import { useEffect, useState, useRef } from 'react';
import { getBills, toggleBillPaidStatus } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { isToday, parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { BellRing, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
}

export function BillAlarmManager() {
  const [dueBills, setDueBills] = useState<Bill[]>([]);
  const [currentBillIndex, setCurrentBillIndex] = useState(0);
  const audioRef = useRef<HTMLAudioElement>(null);
  const { toast } = useToast();

  useEffect(() => {
    const checkDueBills = () => {
      try {
        const allBills = getBills();
        const todayDueBills = allBills.filter(
          (bill) => !bill.isPaid && isToday(parseISO(bill.dueDate))
        );
        if (todayDueBills.length > 0) {
          setDueBills(todayDueBills);
          setCurrentBillIndex(0);
        }
      } catch (error) {
        console.error('Failed to check due bills:', error);
      }
    };
    checkDueBills();
    
    // Check every hour
    const interval = setInterval(checkDueBills, 1000 * 60 * 60);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (dueBills.length > 0) {
      playAlarm();
    }
  }, [dueBills]);

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Audio play failed:', error);
        // Autoplay might be blocked. We can show a toast to ask user to interact.
        toast({
          title: 'Gagal membunyikan alarm',
          description: 'Interaksi pengguna diperlukan untuk memutar suara.',
          variant: 'destructive',
        });
      });
    }
  };

  const stopAlarm = () => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
  };

  const handleClose = () => {
    stopAlarm();
    if (currentBillIndex < dueBills.length - 1) {
      setCurrentBillIndex(currentBillIndex + 1);
      playAlarm();
    } else {
      setDueBills([]);
    }
  };
  
  const handleMarkAsPaid = () => {
    const bill = currentBill();
    if (bill) {
        toggleBillPaidStatus(bill.id);
        toast({
            title: 'Tagihan Dibayar',
            description: `${bill.name} telah ditandai sebagai lunas.`,
        });
        handleClose();
    }
  }

  const currentBill = () => dueBills[currentBillIndex];
  
  if (!currentBill()) {
    return (
        <>
            <audio ref={audioRef} src="/alarm.mp3" preload="auto" loop />
        </>
    );
  }

  return (
    <>
      <audio ref={audioRef} src="/alarm.mp3" preload="auto" loop />
      <AlertDialog open={!!currentBill()}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <BellRing className="h-6 w-6 text-red-500 animate-pulse" />
              Pengingat Jatuh Tempo Tagihan!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tagihan berikut jatuh tempo hari ini. Segera lakukan pembayaran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
             <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-lg">{currentBill().name}</h3>
                <div className="text-lg font-semibold">{formatCurrency(currentBill().amount)}</div>
             </div>
             <p className="text-sm text-muted-foreground">
                Jatuh Tempo: {format(parseISO(currentBill().dueDate), 'd MMMM yyyy', { locale: id })}
             </p>
          </div>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleClose}>
                Tutup
            </Button>
            <Button onClick={handleMarkAsPaid}>
                <Wallet className="mr-2 h-4 w-4" />
                Tandai Sudah Dibayar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
