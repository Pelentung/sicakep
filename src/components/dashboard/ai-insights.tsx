'use client';

import { useState, useTransition } from 'react';
import { Lightbulb, LoaderCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { getAIInsightsAction } from '@/app/actions';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { useUser } from '@/firebase';

export function AiInsights({ selectedMonth }: { selectedMonth: Date }) {
  const [isPending, startTransition] = useTransition();
  const [insights, setInsights] = useState<string[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { user } = useUser();

  const handleGetInsights = () => {
    if (!user) {
        setError("Anda harus login untuk mendapatkan wawasan.");
        return;
    }

    startTransition(async () => {
      setError(null);
      setInsights(null);
      const result = await getAIInsightsAction(user.uid, selectedMonth);
      if (result.success) {
        setInsights(result.insights);
      } else {
        setError(result.error);
      }
    });
  };

  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between">
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-accent" />
          Wawasan Belanja AI
        </CardTitle>
        <Button onClick={handleGetInsights} disabled={isPending || !user} size="sm">
          {isPending ? (
            <LoaderCircle className="animate-spin" />
          ) : (
            'Dapatkan Wawasan'
          )}
        </Button>
      </CardHeader>
      <CardContent>
        {isPending && (
          <div className="flex items-center justify-center py-8">
            <LoaderCircle className="h-8 w-8 animate-spin text-primary" />
            <p className="ml-2 text-muted-foreground">Menganalisis data Anda...</p>
          </div>
        )}
        {error && (
            <Alert variant="destructive">
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
            </Alert>
        )}
        {insights && (
            <div className="space-y-2 text-sm text-foreground">
                {insights.map((insight, index) => (
                    <div key={index} className="flex items-start gap-2">
                        <span className="text-primary mt-1">◆</span>
                        <p>{insight}</p>
                    </div>
                ))}
            </div>
        )}
        {!isPending && !insights && !error && (
            <p className="py-4 text-center text-sm text-muted-foreground">
                Klik tombol untuk mendapatkan analisis AI tentang kebiasaan belanja Anda.
            </p>
        )}
      </CardContent>
    </Card>
  );
}
