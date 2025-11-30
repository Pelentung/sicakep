'use client';

import { useState, useRef } from 'react';
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
import { UploadCloud, LoaderCircle, File as FileIcon, X } from 'lucide-react';
import { Progress } from '../ui/progress';

interface UploadDocumentDialogProps {
  children: React.ReactNode;
  onDocumentUploaded: (file: File, onProgress: (progress: number) => void) => Promise<void>;
}

export function UploadDocumentDialog({ children, onDocumentUploaded }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        // Limit file size to 10MB
        if (selectedFile.size > 10 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File terlalu besar',
                description: 'Ukuran file maksimal adalah 10MB.',
            });
            return;
        }
      setFile(selectedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    const droppedFile = e.dataTransfer.files?.[0];
     if (droppedFile) {
        if (droppedFile.size > 10 * 1024 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File terlalu besar',
                description: 'Ukuran file maksimal adalah 10MB.',
            });
            return;
        }
        setFile(droppedFile);
    }
  };

  const resetState = () => {
    setFile(null);
    setIsUploading(false);
    setUploadProgress(0);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
        resetState();
    }
    setOpen(isOpen);
  }

  const handleSubmit = async () => {
    if (!file) {
      toast({
        variant: 'destructive',
        title: 'Tidak ada file dipilih',
        description: 'Silakan pilih file untuk diunggah.',
      });
      return;
    }

    setIsUploading(true);
    try {
      await onDocumentUploaded(file, setUploadProgress);
      toast({
        title: 'Sukses',
        description: 'Dokumen Anda telah berhasil diunggah.',
      });
      handleOpenChange(false);
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Gagal mengunggah',
        description: 'Terjadi kesalahan saat mengunggah file.',
      });
      setIsUploading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[480px]" onInteractOutside={(e) => {
          if (isUploading) {
            e.preventDefault();
          }
      }}>
        <DialogHeader>
          <DialogTitle>Unggah Dokumen</DialogTitle>
          <DialogDescription>
            Pilih atau seret file untuk diunggah. Ukuran file maksimal 10MB.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4 py-4">
            {!file ? (
                <div
                    className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-lg cursor-pointer hover:bg-muted/50"
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                >
                    <UploadCloud className="w-10 h-10 text-muted-foreground" />
                    <p className="mt-2 text-sm text-muted-foreground">Seret & lepas file, atau klik untuk memilih</p>
                    <Input
                        id="file-upload"
                        ref={fileInputRef}
                        type="file"
                        className="hidden"
                        onChange={handleFileSelect}
                        disabled={isUploading}
                    />
                </div>
            ) : (
                <div className="p-4 border rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-3 overflow-hidden">
                        <FileIcon className="h-6 w-6 text-primary flex-shrink-0" />
                        <span className="text-sm font-medium truncate">{file.name}</span>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading}>
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
            {isUploading && (
                <div className="space-y-2">
                    <Label>Mengunggah...</Label>
                    <Progress value={uploadProgress} />
                    <p className="text-xs text-muted-foreground text-center">{Math.round(uploadProgress)}%</p>
                </div>
            )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => handleOpenChange(false)} disabled={isUploading}>
              Batal
          </Button>
          <Button onClick={handleSubmit} disabled={!file || isUploading}>
            {isUploading ? <LoaderCircle className="animate-spin" /> : 'Unggah & Simpan'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
