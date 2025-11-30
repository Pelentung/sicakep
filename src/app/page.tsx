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
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { LoaderCircle, Wallet } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/auth-context';

export default function WelcomePage() {
  const router = useRouter();
  const { toast } = useToast();
  const { user, signUp, login, loading: authLoading } = useAuth();

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      router.replace('/dashboard');
    }
  }, [user, router]);


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
        description: 'Akun Anda telah dibuat. Silakan login.',
      });
      // This will automatically log the user in due to onAuthStateChanged
      // and the useEffect will redirect.
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
        description: error.message || 'Gagal membuat akun. Mungkin email sudah digunakan.',
      });
    }
  };
  
  if (authLoading || user) {
     return (
        <div className="flex h-screen w-full items-center justify-center bg-background">
            <LoaderCircle className="h-10 w-10 animate-spin text-primary" />
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
                    disabled={authLoading}
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
                    disabled={authLoading}
                  />
                </div>
                <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? <LoaderCircle className="animate-spin" /> : "Masuk"}
                </Button>
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
                    disabled={authLoading}
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
                    disabled={authLoading}
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
                    disabled={authLoading}
                  />
                </div>
                 <Button type="submit" className="w-full" disabled={authLoading}>
                    {authLoading ? <LoaderCircle className="animate-spin" /> : "Daftar"}
                </Button>
              </CardContent>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
