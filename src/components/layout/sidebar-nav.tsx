'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  ArrowLeftRight,
  CircleDollarSign,
  LayoutDashboard,
  PieChart,
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
  { href: '/dashboard/reports', label: 'Laporan', icon: PieChart },
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
              <Link href={link.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === link.href}
                  tooltip={link.label}
                >
                  <link.icon />
                  <span>{link.label}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </>
  );
}
