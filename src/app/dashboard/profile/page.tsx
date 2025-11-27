'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { getUser, updateUser, type UserProfile } from '@/lib/user-data';
import { useUser, useFirestore, useDoc, useMemoFirebase } from '@/firebase';
import { User as UserIcon, LoaderCircle } from 'lucide-react';
import { doc } from 'firebase/firestore';

export default function ProfilePage() {
  const { user: authUser, isUserLoading } = useUser();
  const db = useFirestore();
  const { toast } = useToast();
  
  const userDocRef = useMemoFirebase(() => {
    if (!db || !authUser) return null;
    return doc(db, 'users', authUser.uid);
  }, [db, authUser]);

  const { data: user, isLoading: isProfileLoading, error } = useDoc<UserProfile>(userDocRef);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (user) {
      setName(user.name || '');
      setEmail(user.email || '');
      setPhone(user.phone || '');
      setAvatarPreview(user.avatar || null);
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setAvatarPreview(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) return;

    const updatedProfile: Partial<UserProfile> = {
        name,
        email,
        phone,
        avatar: avatarPreview || '',
    };

    updateUser(db, authUser.uid, updatedProfile);
    toast({
      title: 'Profil Diperbarui',
      description: 'Informasi profil Anda telah berhasil disimpan.',
    });
  };

  if (isUserLoading || isProfileLoading) {
    return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (error) {
    return <div className="text-red-500">Error: {error.message}</div>
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">Profil Pengguna</h1>
        <p className="text-muted-foreground">Kelola informasi profil dan pengaturan akun Anda.</p>
      </div>
      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>Informasi Profil</CardTitle>
            <CardDescription>Perbarui foto dan detail pribadi Anda di sini.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="flex items-center gap-6">
              <Avatar className="h-24 w-24 cursor-pointer" onClick={handleAvatarClick}>
                <AvatarImage src={avatarPreview || undefined} alt="User Avatar" />
                <AvatarFallback>
                    <UserIcon className="h-12 w-12" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col gap-2">
                <Button type="button" onClick={handleAvatarClick}>
                  Unggah Foto
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF hingga 10MB.</p>
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileChange}
                  className="hidden"
                  accept="image/png, image/jpeg, image/gif"
                />
              </div>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Nama</Label>
                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit">Simpan Perubahan</Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
