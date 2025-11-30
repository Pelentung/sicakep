import Image from 'next/image';
import { cn } from '@/lib/utils';

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <Image
        src="https://play-lh.googleusercontent.com/Dt7EL9-m03uljyP12Jfy-PKN2ce5NacLiOuMzZY15Sq_eChsP_tQfEQwEWMVXrTV1OfF=w240-h480-rw"
        alt="SICAKEP Logo"
        width={30}
        height={30}
        className="rounded-md"
      />
      <span className="text-lg font-bold text-foreground">SICAKEP</span>
    </div>
  );
}
