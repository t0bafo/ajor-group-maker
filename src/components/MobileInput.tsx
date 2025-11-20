import { InputHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface MobileInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const MobileInput = forwardRef<HTMLInputElement, MobileInputProps>(
  ({ label, error, className = '', ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-foreground mb-2">
            {label}
          </label>
        )}
        <input
          ref={ref}
          className={cn(
            'w-full px-4 py-3',
            'text-base',
            'min-h-[48px]',
            'border border-input rounded-lg',
            'bg-background text-foreground',
            'focus:ring-2 focus:ring-ring focus:border-input',
            'placeholder:text-muted-foreground',
            error && 'border-destructive',
            className
          )}
          {...props}
        />
        {error && (
          <p className="mt-1 text-sm text-destructive">{error}</p>
        )}
      </div>
    );
  }
);

MobileInput.displayName = 'MobileInput';
