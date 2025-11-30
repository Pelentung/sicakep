'use client';

import { UploadDocumentDialog } from '@/components/documents/upload-document-dialog';
import { DocumentList } from '@/components/documents/document-list';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/data-context';
import { PlusCircle, LoaderCircle, FileText } from 'lucide-react';

export default function DocumentsPage() {
  const { documents, loading, uploadDocument, deleteDocument } = useData();

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Dokumen Penting
        </h1>
        <UploadDocumentDialog onDocumentUploaded={uploadDocument}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Unggah Dokumen
          </Button>
        </UploadDocumentDialog>
      </div>

      {documents.length > 0 ? (
        <DocumentList documents={documents} onDeleteDocument={deleteDocument} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-12 text-center">
            <FileText className="h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold text-foreground">Belum Ada Dokumen</h3>
            <p className="mt-2 text-sm text-muted-foreground">Klik "Unggah Dokumen" untuk menyimpan file pertama Anda.</p>
        </div>
      )}
    </div>
  );
}
