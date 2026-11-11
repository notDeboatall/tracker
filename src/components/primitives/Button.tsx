import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, disabled, ...props }, ref) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none select-none';

    const variants = {
      primary: 'bg-ink text-paper hover:opacity-90 active:scale-[0.98]',
      secondary: 'border border-line bg-surface text-ink hover:bg-surface-2 active:scale-[0.98]',
      tertiary: 'text-ink-muted hover:text-ink active:scale-[0.98]',
      danger: 'bg-danger text-surface hover:opacity-90 active:scale-[0.98]',
    };

    const sizes = {
      sm: 'h-8 px-3 text-xs',
      md: 'h-11 px-5 text-sm min-h-[44px] min-w-[44px]',
      lg: 'h-13 px-6 text-base min-h-[48px]',
    };

    return (
      <button
        ref={ref}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        disabled={disabled}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Button.displayName = 'Button';
