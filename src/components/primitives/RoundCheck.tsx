import type { MouseEvent } from 'react';
import { Check, Minus, X } from 'lucide-react';
import { cn } from '@/lib/utils';

export type CheckStatus = 'unmarked' | 'done' | 'partial' | 'skipped';

export interface RoundCheckProps {
  status: CheckStatus;
  onChange?: (status: CheckStatus) => void;
  className?: string;
  ariaLabel?: string;
}

export function RoundCheck({
  status,
  onChange,
  className,
  ariaLabel = 'Toggle block completion status',
}: RoundCheckProps) {
  const handleClick = (e: MouseEvent) => {
    e.stopPropagation();
    if (!onChange) return;
    if (status === 'unmarked') {
      onChange('done');
    } else if (status === 'done') {
      onChange('unmarked');
    } else {
      onChange('unmarked');
    }
  };

  return (
    <button
      type="button"
      role="checkbox"
      aria-checked={status === 'done'}
      aria-label={ariaLabel}
      onClick={handleClick}
      className={cn(
        'w-6 h-6 rounded-full flex items-center justify-center transition-all cursor-pointer flex-shrink-0',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-1',
        status === 'done' && 'bg-success text-paper border border-success',
        status === 'partial' && 'bg-hi text-ink border border-hi',
        status === 'skipped' && 'bg-surface-2 text-ink-muted border border-line line-through',
        status === 'unmarked' && 'border-2 border-line hover:border-ink-muted bg-transparent',
        className
      )}
    >
      {status === 'done' && <Check className="w-3.5 h-3.5 stroke-[2.5]" />}
      {status === 'partial' && <Minus className="w-3.5 h-3.5 stroke-[2.5]" />}
      {status === 'skipped' && <X className="w-3.5 h-3.5 stroke-[2]" />}
    </button>
  );
}
