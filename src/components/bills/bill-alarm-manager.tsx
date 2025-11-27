'use client';

import { useEffect, useState, useRef } from 'react';
import { getBills, toggleBillPaidStatus } from '@/lib/data';
import type { Bill } from '@/lib/types';
import { isPast, parseISO, format } from 'date-fns';
import { id } from 'date-fns/locale';
import {
  AlertDialog,
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
  const { toast } = useToast();
  
  const [allBills, setAllBills] = useState<Bill[]>([]);
  const [dueBills, setDueBills] = useState<Bill[]>([]);
  const [currentBillIndex, setCurrentBillIndex] = useState(0);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const audioRef = useRef<HTMLAudioElement>(null);

  useEffect(() => {
    setAllBills(getBills());
  }, []);

  useEffect(() => {
    const checkDueBills = () => {
      try {
        const now = new Date();
        const upcomingDueBills = allBills.filter(
          (bill) => !bill.isPaid && parseISO(bill.dueDate) > now
        );
        if (upcomingDueBills.length > 0) {
          setDueBills(upcomingDueBills);
          setCurrentBillIndex(0);
        }
      } catch (error) {
        console.error('Failed to check due bills:', error);
      }
    };
    
    // Check every minute
    const interval = setInterval(checkDueBills, 1000 * 60);
    checkDueBills(); // Initial check

    return () => clearInterval(interval);
  }, [allBills]);

  useEffect(() => {
    if (dueBills.length > 0 && currentBillIndex < dueBills.length) {
      const bill = dueBills[currentBillIndex];
      const dueDate = parseISO(bill.dueDate);
      const now = new Date();
      
      if (dueDate > now) {
         const timeout = setTimeout(() => {
            setIsAlarmActive(true);
            playAlarm();
        }, dueDate.getTime() - now.getTime());

        return () => clearTimeout(timeout);
      }
    }
  }, [dueBills, currentBillIndex]);

  const playAlarm = () => {
    if (audioRef.current) {
      audioRef.current.play().catch((error) => {
        console.error('Audio play failed:', error);
        toast({
          title: 'Gagal membunyikan alarm',
          description: 'Browser mungkin memblokir suara otomatis.',
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
  
  const refreshBills = () => {
    setAllBills(getBills());
  };

  const handleClose = () => {
    stopAlarm();
    setIsAlarmActive(false);
    if (currentBillIndex < dueBills.length - 1) {
      setCurrentBillIndex(currentBillIndex + 1);
    } else {
      setDueBills([]);
      setCurrentBillIndex(0);
    }
  };
  
  const handleMarkAsPaid = () => {
    const bill = currentBill();
    if (bill) {
        toggleBillPaidStatus(bill.id, bill.isPaid);
        refreshBills();
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
      <AlertDialog open={isAlarmActive}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <BellRing className="h-6 w-6 animate-pulse text-red-500" />
              Pengingat Jatuh Tempo Tagihan!
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tagihan berikut jatuh tempo sekarang. Segera lakukan pembayaran.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="my-4 rounded-lg border bg-card p-4 text-card-foreground shadow-sm">
             <div className="mb-2 flex items-center justify-between">
                <h3 className="text-lg font-bold">{currentBill().name}</h3>
                <div className="text-lg font-semibold">{formatCurrency(currentBill().amount)}</div>
             </div>
             <p className="text-sm text-muted-foreground">
                Jatuh Tempo: {format(parseISO(currentBill().dueDate), 'd MMMM yyyy, HH:mm', { locale: id })}
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
