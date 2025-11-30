'use client';

import { useEffect, useState } from 'react';
import { errorEmitter } from '@/lib/events';
import { FirestorePermissionError } from '@/firebase/errors';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
} from './ui/alert-dialog';
import { Button } from './ui/button';
import { ShieldAlert } from 'lucide-react';
import { useAuth } from '@/context/auth-context';

export function FirebaseErrorListener() {
  const [error, setError] = useState<FirestorePermissionError | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    const handleError = (e: FirestorePermissionError) => {
      setError(e);
    };

    errorEmitter.on('permission-error', handleError);

    return () => {
      errorEmitter.off('permission-error', handleError);
    };
  }, []);

  const handleClose = () => {
    setError(null);
  };

  if (!error) {
    return null;
  }

  return (
    <AlertDialog open={!!error} onOpenChange={(open) => !open && handleClose()}>
      <AlertDialogContent className="max-w-2xl">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-destructive" />
            Firestore Security Rule Error
          </AlertDialogTitle>
          <AlertDialogDescription>
            A security rule prevented a Firestore operation. Below is the detailed context needed for debugging.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="mt-4 space-y-4 text-sm bg-muted p-4 rounded-md overflow-x-auto">
          <div className="space-y-1">
            <h3 className="font-bold">Operation</h3>
            <p className="font-mono bg-background p-2 rounded-md">{error.operation}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold">Path</h3>
            <p className="font-mono bg-background p-2 rounded-md">{error.path}</p>
          </div>
          <div className="space-y-1">
            <h3 className="font-bold">Authenticated User (request.auth)</h3>
            <pre className="font-mono bg-background p-2 rounded-md whitespace-pre-wrap">
              {JSON.stringify(user ? { uid: user.uid, email: user.email } : null, null, 2)}
            </pre>
          </div>
          {error.resource && (
            <div className="space-y-1">
                <h3 className="font-bold">Request Resource Data (request.resource.data)</h3>
                <pre className="font-mono bg-background p-2 rounded-md whitespace-pre-wrap">
                    {JSON.stringify(error.resource, null, 2)}
                </pre>
            </div>
          )}
        </div>
        <AlertDialogFooter>
          <Button onClick={handleClose}>Close</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
