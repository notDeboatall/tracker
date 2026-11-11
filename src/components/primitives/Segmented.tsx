import { cn } from '@/lib/utils';

export interface SegmentOption<T extends string = string> {
  value: T;
  label: string;
}

export interface SegmentedProps<T extends string = string> {
  options: SegmentOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  name?: string;
}

export function Segmented<T extends string>({
  options,
  value,
  onChange,
  className,
}: SegmentedProps<T>) {
  return (
    <div
      role="radiogroup"
      className={cn(
        'inline-flex p-1 rounded-full bg-surface-2 border border-line select-none',
        className
      )}
    >
      {options.map((option) => {
        const isSelected = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="radio"
            aria-checked={isSelected}
            onClick={() => onChange(option.value)}
            className={cn(
              'flex-1 text-xs font-medium py-1.5 px-3 rounded-full transition-all text-center min-h-[36px] flex items-center justify-center',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink',
              isSelected
                ? 'bg-ink text-paper font-semibold shadow-xs'
                : 'text-ink-muted hover:text-ink'
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
