import { ButtonHTMLAttributes, forwardRef } from 'react';
import { cn } from '@/lib/utils';

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
}

export const TouchButton = forwardRef<HTMLButtonElement, TouchButtonProps>(
  ({ variant = 'primary', size = 'md', className = '', children, ...props }, ref) => {
    const baseStyles = 'font-semibold rounded-lg transition-all active:scale-95 disabled:opacity-50';
    
    const variantStyles = {
      primary: 'bg-primary text-primary-foreground active:bg-primary/90',
      secondary: 'bg-secondary text-secondary-foreground active:bg-secondary/80',
      ghost: 'bg-transparent text-primary active:bg-accent'
    };
    
    const sizeStyles = {
      sm: 'px-4 py-2 text-sm min-h-[40px]',
      md: 'px-6 py-3 text-base min-h-[48px]',
      lg: 'px-8 py-4 text-lg min-h-[56px]'
    };
    
    return (
      <button
        ref={ref}
        className={cn(baseStyles, variantStyles[variant], sizeStyles[size], className)}
        {...props}
      >
        {children}
      </button>
    );
  }
);

TouchButton.displayName = 'TouchButton';
