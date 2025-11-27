'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

interface CurrencyInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onValueChange: (value: number | undefined) => void;
  value: number | undefined;
}

const CurrencyInput = React.forwardRef<HTMLInputElement, CurrencyInputProps>(
  ({ className, onValueChange, value, ...props }, ref) => {
    const [displayValue, setDisplayValue] = React.useState<string>('');

    React.useEffect(() => {
      if (value !== undefined && value !== null) {
        // Only format if the value is not already what's displayed (to avoid reformatting during typing)
        const numericValue = Number(String(displayValue).replace(/[^0-9]/g, ''));
        if (numericValue !== value) {
          setDisplayValue(new Intl.NumberFormat('id-ID').format(value));
        }
      } else {
        setDisplayValue('');
      }
    }, [value]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      const numericValue = Number(rawValue.replace(/[^0-9]/g, ''));

      if (isNaN(numericValue)) {
        setDisplayValue('');
        onValueChange(undefined);
        return;
      }

      setDisplayValue(new Intl.NumberFormat('id-ID').format(numericValue));
      onValueChange(numericValue);
    };

    return (
      <div className="relative">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-muted-foreground text-sm">Rp</span>
        <input
          type="text"
          inputMode="numeric"
          className={cn(
            'flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
            className
          )}
          ref={ref}
          value={displayValue}
          onChange={handleChange}
          placeholder="0"
          {...props}
        />
      </div>
    );
  }
);
CurrencyInput.displayName = 'CurrencyInput';

export { CurrencyInput };
