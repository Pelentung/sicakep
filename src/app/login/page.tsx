'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth, useUser } from '@/firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const formSchema = z.object({
  email: z.string().email({ message: 'Email tidak valid.' }),
  password: z.string().min(1, { message: 'Kata sandi tidak boleh kosong.' }),
});

export default function LoginPage() {
  const router = useRouter();
  const auth = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();

   if (user) {
    router.replace('/dashboard');
    return null;
  }

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({ title: 'Login berhasil!' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      const errorCode = error.code;
      let description = 'Terjadi kesalahan saat login.';
      if (errorCode === 'auth/user-not-found' || errorCode === 'auth/wrong-password' || errorCode === 'auth/invalid-credential') {
        description = 'Email atau kata sandi salah.';
      }
      toast({
        variant: 'destructive',
        title: 'Login Gagal',
        description,
      });
    } finally {
        setIsLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center">
            <Logo className="mb-4 justify-center" />
          <CardTitle className="text-2xl">Login</CardTitle>
          <CardDescription>
            Masukkan email dan kata sandi Anda untuk masuk.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="email@contoh.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kata Sandi</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Memuat...' : 'Login'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Belum punya akun?{' '}
            <Link href="/signup" className="underline">
              Daftar
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
