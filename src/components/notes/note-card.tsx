'use client';

import {
    Card,
    CardContent,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from "@/components/ui/card"
import type { Note } from "@/lib/types"
import { formatDistanceToNow } from "date-fns";
import { id } from "date-fns/locale";
import { MoreVertical } from "lucide-react";
import { EditNoteDialog } from "./edit-note-dialog";
import { Button } from "../ui/button";


interface NoteCardProps {
    note: Note;
    onUpdate: (id: string, updates: Partial<Omit<Note, 'id' | 'createdAt'>>) => Promise<void>;
    onDelete: (id: string) => Promise<void>;
}

export function NoteCard({ note, onUpdate, onDelete }: NoteCardProps) {
    
    const formattedDate = note.createdAt ? formatDistanceToNow(new Date(note.createdAt), { addSuffix: true, locale: id }) : 'Beberapa saat yang lalu';

    return (
        <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-start justify-between pb-2">
                <CardTitle className="text-lg font-semibold">{note.title}</CardTitle>
                <EditNoteDialog note={note} onUpdate={onUpdate} onDelete={onDelete}>
                     <Button variant="ghost" size="icon" className="h-8 w-8 -mt-2 -mr-2">
                        <MoreVertical className="h-4 w-4" />
                    </Button>
                </EditNoteDialog>
            </CardHeader>
            <CardContent className="flex-1">
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">{note.content}</p>
            </CardContent>
            <CardFooter>
                <p className="text-xs text-muted-foreground">{formattedDate}</p>
            </CardFooter>
        </Card>
    )
}
