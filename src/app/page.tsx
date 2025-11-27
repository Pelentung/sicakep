'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, Wallet, Fingerprint } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';
import { useWebAuthn } from '@/hooks/use-webauthn';

export default function WelcomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, signUp, login, loading: authLoading } = useAuth();
  const {
    isWebAuthnSupported,
    register: registerWebAuthn,
    authenticate: authenticateWebAuthn,
    isRegistrationComplete,
    isAuthenticating,
    isRegistering,
  } = useWebAuthn();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  const loading = authLoading || isAuthenticating || isRegistering;

  // Redirect if user is already logged in
  useEffect(() => {
    if (user && !isRegistering) {
        if (!isRegistrationComplete && isWebAuthnSupported) {
          // Stay on this page to prompt for fingerprint registration
        } else {
          router.replace('/dashboard');
        }
    }
  }, [user, isRegistrationComplete, isRegistering, router, isWebAuthnSupported]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(loginEmail, loginPassword);
      toast({
        title: 'Login Berhasil',
        description: 'Selamat datang kembali!',
      });
      // Redirect is handled by useEffect
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description: error.message || 'Email atau password salah.',
      });
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (registerPassword.length < 6) {
        toast({
            variant: 'destructive',
            title: 'Pendaftaran Gagal',
            description: 'Password minimal harus 6 karakter.',
        });
        return;
    }

    try {
      await signUp(registerEmail, registerPassword, registerName);
      toast({
        title: 'Pendaftaran Berhasil',
        description: 'Akun Anda telah dibuat. Silakan daftarkan sidik jari Anda.',
      });
      // Redirect is handled by useEffect, which will now show the registration prompt
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
        description: error.message || 'Gagal membuat akun. Mungkin email sudah digunakan.',
      });
    }
  };
  
  const handleWebAuthnLogin = async () => {
    try {
      await authenticateWebAuthn();
      toast({
        title: 'Login Sidik Jari Berhasil',
        description: 'Selamat datang kembali!',
      });
      router.push('/dashboard');
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Login Sidik Jari Gagal',
        description: error.message,
      });
    }
  };
  
  const handleWebAuthnRegister = async () => {
    if (user) {
        try {
            await registerWebAuthn(user.email!, user.displayName!);
            toast({
                title: 'Sidik Jari Terdaftar',
                description: 'Anda sekarang dapat login menggunakan sidik jari.',
            });
            router.push('/dashboard');
        } catch (error: any) {
            toast({
                variant: 'destructive',
                title: 'Pendaftaran Sidik Jari Gagal',
                description: error.message,
            });
        }
    }
  };

  // Show a loading spinner while checking auth state, and before redirecting.
  if (authLoading && !user) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
        </div>
     );
  }
  
  if (user && !isRegistrationComplete && isWebAuthnSupported) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
        <Card className="w-full max-w-sm">
          <CardHeader>
            <CardTitle>Daftarkan Sidik Jari</CardTitle>
            <CardDescription>
              Aktifkan login cepat dan aman menggunakan sidik jari Anda.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center text-center">
            <Fingerprint className="h-16 w-16 text-primary mb-4" />
            <p className="text-muted-foreground">
              Selesaikan penyiapan akun Anda dengan menambahkan sidik jari.
            </p>
          </CardContent>
          <CardFooter className="flex flex-col gap-2">
            <Button className="w-full" onClick={handleWebAuthnRegister} disabled={loading}>
              {loading ? <LoaderCircle className="animate-spin" /> : "Daftarkan Sidik Jari"}
            </Button>
            <Button variant="ghost" className="w-full" onClick={() => router.push('/dashboard')}>
              Lewati untuk Sekarang
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      <div className="mb-8 flex items-center gap-2">
        <Wallet className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold text-foreground">SICAKEP</h1>
      </div>
      <Tabs defaultValue="login" className="w-full max-w-sm">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="login">Masuk</TabsTrigger>
          <TabsTrigger value="register">Daftar</TabsTrigger>
        </TabsList>
        <TabsContent value="login">
          <Card>
            <CardHeader>
              <CardTitle>Masuk</CardTitle>
              <CardDescription>
                Masuk ke akun Anda untuk melanjutkan.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleLogin}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="login-email">Email</Label>
                  <Input 
                    id="login-email" 
                    type="email" 
                    placeholder="nama@email.com" 
                    required 
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="login-password">Password</Label>
                  <Input 
                    id="login-password" 
                    type="password" 
                    required 
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <LoaderCircle className="animate-spin" /> : "Masuk"}
                </Button>
                {isWebAuthnSupported && (
                    <>
                        <div className="relative my-2">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-background px-2 text-muted-foreground">
                                Atau
                                </span>
                            </div>
                        </div>
                        <Button variant="outline" type="button" className="w-full" onClick={handleWebAuthnLogin} disabled={loading}>
                            {loading ? <LoaderCircle className="animate-spin" /> : <Fingerprint className="mr-2 h-4 w-4" />}
                            Masuk dengan Sidik Jari
                        </Button>
                    </>
                )}
              </CardContent>
            </form>
          </Card>
        </TabsContent>
        <TabsContent value="register">
          <Card>
            <CardHeader>
              <CardTitle>Daftar</CardTitle>
              <CardDescription>
                Buat akun baru untuk mulai mengelola keuangan Anda.
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleRegister}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="register-name">Nama</Label>
                  <Input 
                    id="register-name" 
                    placeholder="Nama Lengkap Anda" 
                    required 
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input 
                    id="register-email" 
                    type="email" 
                    placeholder="nama@email.com" 
                    required 
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    disabled={loading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input 
                    id="register-password" 
                    type="password" 
                    required 
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    disabled={loading}
                  />
                </div>
                 <Button type="submit" className="w-full" disabled={loading}>
                    {loading ? <LoaderCircle className="animate-spin" /> : "Daftar"}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
