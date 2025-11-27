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
import { useAuth, useFirestore, useUser } from '@/firebase';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc } from 'firebase/firestore';
import { setDocumentNonBlocking } from '@/firebase/non-blocking-updates';
import { useToast } from '@/hooks/use-toast';
import { Logo } from '@/components/logo';

const formSchema = z
  .object({
    name: z.string().min(1, { message: 'Nama tidak boleh kosong.' }),
    email: z.string().email({ message: 'Email tidak valid.' }),
    password: z
      .string()
      .min(6, { message: 'Kata sandi minimal 6 karakter.' }),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'Konfirmasi kata sandi tidak cocok.',
    path: ['confirmPassword'],
  });

export default function SignUpPage() {
  const router = useRouter();
  const auth = useAuth();
  const db = useFirestore();
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
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        values.email,
        values.password
      );
      const user = userCredential.user;

      // Update Firebase Auth profile
      await updateProfile(user, {
        displayName: values.name,
      });

      // Create user document in Firestore
      const userDocRef = doc(db, 'users', user.uid);
      const userProfileData = {
        id: user.uid,
        name: values.name,
        email: values.email,
        phone: '',
        avatar: '',
      };
      setDocumentNonBlocking(userDocRef, userProfileData, { merge: true });

      toast({ title: 'Pendaftaran berhasil!' });
      router.push('/dashboard');
    } catch (error: any) {
      console.error(error);
      let description = 'Terjadi kesalahan saat pendaftaran.';
       if (error.code === 'auth/email-already-in-use') {
        description = 'Email ini sudah terdaftar. Silakan gunakan email lain.';
      }
      toast({
        variant: 'destructive',
        title: 'Pendaftaran Gagal',
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
          <CardTitle className="text-2xl">Buat Akun</CardTitle>
          <CardDescription>
            Masukkan data Anda untuk mendaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nama Lengkap</FormLabel>
                    <FormControl>
                      <Input placeholder="Nama Anda" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
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
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Konfirmasi Kata Sandi</FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Membuat akun...' : 'Daftar'}
              </Button>
            </form>
          </Form>
          <div className="mt-4 text-center text-sm">
            Sudah punya akun?{' '}
            <Link href="/login" className="underline">
              Login
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
