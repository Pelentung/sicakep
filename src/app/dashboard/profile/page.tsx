'use client';

import { useState, useRef, useEffect } from 'react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { User as UserIcon, LoaderCircle } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export default function ProfilePage() {
  const { toast } = useToast();
  const { user, loading: authLoading, updateUser } = useAuth();
  
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (user) {
      setName(user.displayName || '');
      setPhone(user.phone || '');
      setAvatarPreview(user.photoURL || null);
    }
  }, [user]);

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setAvatarFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setIsSaving(true);
    try {
      await updateUser({
          displayName: name,
          phone,
      }, avatarFile);

      toast({
        title: 'Profil Diperbarui',
        description: 'Informasi profil Anda telah berhasil disimpan.',
      });
      setAvatarFile(null); // Reset file input after successful upload
    } catch (error) {
        console.error("Profile update error:", error);
        toast({
            title: 'Gagal Memperbarui Profil',
            description: 'Terjadi kesalahan saat menyimpan data.',
            variant: 'destructive'
        });
    } finally {
        setIsSaving(false);
    }
  };

  if (authLoading) {
    return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }
  
  if (!user) {
    return <div className="flex h-full w-full items-center justify-center">Silakan login untuk melihat profil Anda.</div>;
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
                <Button type="button" onClick={handleAvatarClick} disabled={isSaving}>
                  Unggah Foto
                </Button>
                <p className="text-xs text-muted-foreground">PNG, JPG, GIF hingga 1MB.</p>
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
                <Input id="name" name="name" value={name} onChange={(e) => setName(e.target.value)} disabled={isSaving}/>
              </div>
               <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" name="email" type="email" value={user.email || ''} disabled />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telepon</Label>
                <Input id="phone" name="phone" type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} disabled={isSaving}/>
              </div>
            </div>
          </CardContent>
          <CardFooter className="border-t px-6 py-4">
            <Button type="submit" disabled={isSaving}>
                {isSaving && <LoaderCircle className="mr-2 h-4 w-4 animate-spin" />}
                Simpan Perubahan
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
