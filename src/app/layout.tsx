import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { AuthProvider } from '@/context/auth-context';
import { DataProvider } from '@/context/data-context';
import { FirebaseErrorListener } from '@/components/firebase-error-listener';

export const metadata: Metadata = {
  title: 'SICAKEP',
  description: 'Sistem Catatan Keuangan Pribadi',
  manifest: "/manifest.json",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=PT+Sans:ital,wght@0,400;0,700;1,400;1,700&display=swap"
          rel="stylesheet"
        />
        <meta name="theme-color" content="#4a8f9e" />
      </head>
      <body className={cn('font-body antialiased')}>
        <AuthProvider>
          <DataProvider>
            {children}
            <Toaster />
            <FirebaseErrorListener />
          </DataProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
