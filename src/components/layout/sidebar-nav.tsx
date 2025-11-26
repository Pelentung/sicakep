'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  CircleDollarSign,
  LayoutDashboard,
  PieChart,
  Bell,
  User,
} from 'lucide-react';

import {
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
} from '@/components/ui/sidebar';
import { Logo } from '@/components/logo';

const links = [
  { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/dashboard/transactions', label: 'Transaksi', icon: ArrowLeftRight },
  { href: '/dashboard/budgets', label: 'Anggaran', icon: CircleDollarSign },
  { href: '/dashboard/bills', label: 'Tagihan', icon: Bell },
  { href: '/dashboard/reports', label: 'Laporan', icon: PieChart },
  { href: '/dashboard/profile', label: 'Profil', icon: User },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <>
      <SidebarHeader>
        <Logo />
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {links.map((link) => (
            <SidebarMenuItem key={link.href}>
              <SidebarMenuButton
                asChild
                isActive={pathname.startsWith(link.href) && (link.href !== '/dashboard' || pathname === '/dashboard')}
                tooltip={link.label}
              >
                <Link href={link.href}>
                  <link.icon />
                  <span>{link.label}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
