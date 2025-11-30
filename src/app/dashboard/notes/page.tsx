'use client';

import { AddNoteDialog } from '@/components/notes/add-note-dialog';
import { NoteCard } from '@/components/notes/note-card';
import { Button } from '@/components/ui/button';
import { useData } from '@/context/data-context';
import { PlusCircle, LoaderCircle } from 'lucide-react';

export default function NotesPage() {
  const { notes, loading, addNote, updateNote, deleteNote } = useData();

  if (loading) {
    return <div className="flex h-full w-full items-center justify-center"><LoaderCircle className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-foreground md:text-3xl">
          Catatan Pribadi
        </h1>
        <AddNoteDialog onNoteAdded={addNote}>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Tambah Catatan
          </Button>
        </AddNoteDialog>
      </div>

      {notes.length > 0 ? (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {notes.map(note => (
                <NoteCard key={note.id} note={note} onUpdate={updateNote} onDelete={deleteNote} />
            ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-muted-foreground/30 bg-muted/20 py-12 text-center">
            <h3 className="text-lg font-semibold text-foreground">Belum Ada Catatan</h3>
            <p className="mt-2 text-sm text-muted-foreground">Klik "Tambah Catatan" untuk membuat catatan pertama Anda.</p>
        </div>
      )}
    </div>
  );
}
