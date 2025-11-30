'use client';

import { useState, useRef, useEffect } from 'react';
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
  onDocumentUploaded: (file: File, name: string, onProgress: (progress: number) => void) => Promise<void>;
}

export function UploadDocumentDialog({ children, onDocumentUploaded }: UploadDocumentDialogProps) {
  const [open, setOpen] = useState(false);
  const [file, setFile] = useState<File | null>(null);
  const [docName, setDocName] = useState('');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();
  
  useEffect(() => {
    if (file) {
      // Pre-fill name input without extension
      setDocName(file.name.replace(/\.[^/.]+$/, ""));
    } else {
      setDocName('');
    }
  }, [file]);


  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
        if (selectedFile.type !== 'application/pdf') {
             toast({
                variant: 'destructive',
                title: 'Jenis file tidak valid',
                description: 'Hanya file PDF yang diizinkan.',
            });
            return;
        }
        if (selectedFile.size > 500 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File terlalu besar',
                description: 'Ukuran file maksimal adalah 500KB.',
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
        if (droppedFile.type !== 'application/pdf') {
             toast({
                variant: 'destructive',
                title: 'Jenis file tidak valid',
                description: 'Hanya file PDF yang diizinkan.',
            });
            return;
        }
        if (droppedFile.size > 500 * 1024) {
            toast({
                variant: 'destructive',
                title: 'File terlalu besar',
                description: 'Ukuran file maksimal adalah 500KB.',
            });
            return;
        }
        setFile(droppedFile);
    }
  };

  const resetState = () => {
    setFile(null);
    setDocName('');
    setIsUploading(false);
    setUploadProgress(0);
    if(fileInputRef.current) {
        fileInputRef.current.value = "";
    }
  };

  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen && !isUploading) {
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
     if (!docName.trim()) {
      toast({
        variant: 'destructive',
        title: 'Nama dokumen kosong',
        description: 'Silakan beri nama untuk dokumen Anda.',
      });
      return;
    }

    setIsUploading(true);
    try {
      const finalName = docName.trim() + '.pdf';
      await onDocumentUploaded(file, finalName, setUploadProgress);
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
            Pilih file PDF untuk diunggah. Ukuran file maksimal 500KB.
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
                        accept="application/pdf"
                    />
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="p-4 border rounded-lg flex items-center justify-between">
                        <div className="flex items-center gap-3 overflow-hidden">
                            <FileIcon className="h-6 w-6 text-primary flex-shrink-0" />
                            <span className="text-sm font-medium truncate">{file.name}</span>
                        </div>
                        <Button variant="ghost" size="icon" onClick={() => setFile(null)} disabled={isUploading}>
                            <X className="h-4 w-4" />
                        </Button>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="docName">Nama Dokumen (tanpa .pdf)</Label>
                        <Input
                            id="docName"
                            value={docName}
                            onChange={(e) => setDocName(e.target.value)}
                            placeholder="Nama file baru Anda"
                            disabled={isUploading}
                        />
                    </div>
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
