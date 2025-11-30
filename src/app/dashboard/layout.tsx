'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { BillAlarmManager } from '@/components/bills/bill-alarm-manager';
import { useAuth } from '@/context/auth-context';
import { LoaderCircle } from 'lucide-react';
import { DynamicHeader } from '@/components/layout/dynamic-header';


export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
      </div>
    );
  }
  
  return (
      <SidebarProvider>
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <DynamicHeader />
            <main className="flex-1 p-4 lg:p-6">{children}</main>
            <footer className="fixed bottom-0 left-0 right-0 z-20 overflow-hidden whitespace-nowrap border-t bg-background/80 p-2 text-center text-sm font-medium text-foreground backdrop-blur-sm md:hidden">
                <span className="inline-block animate-marquee-slow">
                    Designed By : PelentunG
                </span>
            </footer>
          </div>
        </SidebarInset>
        <BillAlarmManager />
      </SidebarProvider>
  );
}
