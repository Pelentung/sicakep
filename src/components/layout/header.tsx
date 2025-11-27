'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { LogOut, Settings, User } from 'lucide-react';
import { useAuth, useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import type { UserProfile } from '@/lib/user-data';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useIsMobile } from '@/hooks/use-mobile';
import { Logo } from '../logo';
import { BillNotification } from '../bills/bill-notification';
import { useRouter } from 'next/navigation';
import { signOut } from 'firebase/auth';
import { doc } from 'firebase/firestore';

export function Header() {
  const isMobile = useIsMobile();
  const { user: authUser, isUserLoading } = useUser();
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();

  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: userProfile } = useDoc<UserProfile>(userDocRef);

  const handleLogout = async () => {
    await signOut(auth);
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background/80 px-4 backdrop-blur-sm md:px-6">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden" />
        {isMobile && <Logo />}
      </div>

      <div className="flex w-full items-center justify-end gap-4">
        {!isMobile && (
          <div className="flex-1 overflow-hidden whitespace-nowrap">
            {isUserLoading || !userProfile ? (
              <div className="h-6 w-1/4 animate-pulse rounded-md bg-muted" />
            ) : (
              <h1 className="animate-marquee-slow inline-block text-xl font-bold text-foreground">
                {userProfile.name}
              </h1>
            )}
          </div>
        )}
        <BillNotification />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-8 w-8 rounded-full">
              <Avatar className="h-9 w-9">
                {userProfile?.avatar && (
                  <AvatarImage src={userProfile.avatar} alt="User Avatar" />
                )}
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium leading-none">{userProfile?.name}</p>
                <p className="text-xs leading-none text-muted-foreground">
                  {userProfile?.email}
                </p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/profile">
                  <User className="mr-2 h-4 w-4" />
                  <span>Profil</span>
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="#">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Pengaturan</span>
                </Link>
              </DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout}>
              <LogOut className="mr-2 h-4 w-4" />
              <span>Keluar</span>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
