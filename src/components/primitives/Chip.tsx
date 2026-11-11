import { forwardRef, type ButtonHTMLAttributes } from 'react';
import { cn } from '@/lib/utils';

export interface ChipProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  selected?: boolean;
}

export const Chip = forwardRef<HTMLButtonElement, ChipProps>(
  ({ className, selected = false, children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        type="button"
        className={cn(
          'inline-flex items-center justify-center font-mono text-xs font-medium h-8 px-3 rounded-full transition-all min-h-[36px]',
          'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1 select-none',
          selected
            ? 'bg-hi text-ink font-semibold shadow-xs'
            : 'border border-line bg-surface text-ink-muted hover:text-ink hover:bg-surface-2',
          className
        )}
        {...props}
      >
        {children}
      </button>
    );
  }
);

Chip.displayName = 'Chip';
