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
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { MoreHorizontal, Trash2, Edit } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import type { Note } from '@/lib/types';
import { Textarea } from '../ui/textarea';

interface EditNoteDialogProps {
  note: Note;
  onUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
  children: React.ReactNode;
}

export function EditNoteDialog({ note, onUpdate, onDelete, children }: EditNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [showDeleteAlert, setShowDeleteAlert] = useState(false);
  const [title, setTitle] = useState(note.title);
  const [content, setContent] = useState(note.content);
  const { toast } = useToast();

  const handleUpdate = async () => {
    if (!title) {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Judul tidak boleh kosong.',
      });
      return;
    }

    await onUpdate(note.id, { title, content });
    toast({
      title: 'Sukses',
      description: 'Catatan telah diperbarui.',
    });
    setOpen(false);
  };

  const handleDelete = async () => {
    await onDelete(note.id);
    toast({
      title: 'Sukses',
      description: 'Catatan telah dihapus.',
    });
    setShowDeleteAlert(false);
  };

  return (
    <>
      <div onClick={(e) => e.stopPropagation()}>
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                {children}
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" onClick={(e) => e.stopPropagation()}>
            <DropdownMenuItem onClick={() => setOpen(true)}>
              <Edit className="mr-2 h-4 w-4" />
              Edit
            </DropdownMenuItem>
            <DropdownMenuItem
                onClick={() => setShowDeleteAlert(true)}
                className="text-red-600"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
      </div>


      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Edit Catatan</DialogTitle>
            <DialogDescription>
              Perbarui detail catatan Anda di sini.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="title-edit">Judul</Label>
              <Input
                id="title-edit"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content-edit">Isi</Label>
              <Textarea
                id="content-edit"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button onClick={handleUpdate}>Simpan Perubahan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteAlert} onOpenChange={setShowDeleteAlert}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Apakah Anda yakin?</AlertDialogTitle>
            <AlertDialogDescription>
              Tindakan ini tidak dapat dibatalkan. Ini akan menghapus catatan berjudul{' '}
              <span className="font-bold">{note.title}</span> secara permanen.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Hapus
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
