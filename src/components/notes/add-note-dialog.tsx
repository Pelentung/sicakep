'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import type { Note } from '@/lib/types';
import { Textarea } from '../ui/textarea';

interface AddNoteDialogProps {
  children: React.ReactNode;
  onNoteAdded: (note: Omit<Note, 'id' | 'createdAt'>) => Promise<void>;
}

export function AddNoteDialog({ children, onNoteAdded }: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Judul catatan tidak boleh kosong.',
      });
      return;
    }
    
    await onNoteAdded({ title, content });

    toast({
      title: 'Sukses',
      description: 'Catatan baru telah ditambahkan.',
    });
    setOpen(false);
    setTitle('');
    setContent('');
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Tambah Catatan</DialogTitle>
          <DialogDescription>
            Buat catatan baru untuk ide atau pengingat penting.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Judul</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Judul catatan Anda"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="content">Isi</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tulis apa saja di sini..."
              rows={6}
            />
          </div>
        </div>
        <DialogFooter>
          <Button onClick={handleSubmit}>Simpan</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
