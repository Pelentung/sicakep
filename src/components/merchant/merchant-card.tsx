'use client';

import { Card, CardContent } from '@/components/ui/card';
import type { Merchant } from '@/lib/merchant-data';
import * as LucideIcons from 'lucide-react';

interface MerchantCardProps {
  merchant: Merchant;
  onClick: () => void;
}

export function MerchantCard({ merchant, onClick }: MerchantCardProps) {
  const Icon = LucideIcons[merchant.icon as keyof typeof LucideIcons] || LucideIcons.HelpCircle;

  return (
    <Card
      onClick={onClick}
      className="cursor-pointer transition-all hover:bg-accent hover:shadow-lg"
    >
      <CardContent className="flex flex-col items-center justify-center p-4 text-center">
        <Icon className="mb-2 h-8 w-8 text-primary" />
        <span className="text-sm font-medium text-foreground">{merchant.name}</span>
      </CardContent>
    </Card>
  );
}
