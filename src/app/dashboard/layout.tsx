'use client';

import { Header } from '@/components/layout/header';
import { SidebarNav } from '@/components/layout/sidebar-nav';
import {
  Sidebar,
  SidebarInset,
  SidebarProvider,
} from '@/components/ui/sidebar';
import { BillAlarmManager } from '@/components/bills/bill-alarm-manager';
import { DataProvider } from '@/context/data-context';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <DataProvider>
      <SidebarProvider>
        <Sidebar>
          <SidebarNav />
        </Sidebar>
        <SidebarInset>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1 p-4 lg:p-6">{children}</main>
          </div>
        </SidebarInset>
        <BillAlarmManager />
      </SidebarProvider>
    </DataProvider>
  );
}
