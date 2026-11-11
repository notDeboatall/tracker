import { cn } from '@/lib/utils';

export interface ToastProps {
  visible: boolean;
  message: string;
  timestamp?: string; // mono timestamp e.g. "14:15"
  onUndo?: () => void;
  onDetails?: () => void;
  className?: string;
}

export function Toast({
  visible,
  message,
  timestamp,
  onUndo,
  onDetails,
  className,
}: ToastProps) {
  if (!visible) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        'fixed bottom-20 left-4 right-4 max-w-[560px] mx-auto z-40',
        'bg-ink text-paper rounded-full py-2.5 px-4 shadow-lg border border-line/30',
        'flex items-center justify-between gap-3 text-xs animate-in fade-in slide-in-from-bottom-2 duration-200',
        className
      )}
    >
      <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
        {timestamp && (
          <span className="font-mono text-hi font-semibold">{timestamp}</span>
        )}
        <span className="truncate">{message}</span>
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {onUndo && (
          <button
            type="button"
            onClick={onUndo}
            className="font-medium text-hi hover:underline cursor-pointer px-1 py-0.5 rounded select-none"
          >
            Undo
          </button>
        )}
        {onDetails && (
          <button
            type="button"
            onClick={onDetails}
            className="text-paper/80 hover:text-paper cursor-pointer px-1 py-0.5 rounded select-none"
          >
            Details
          </button>
        )}
      </div>
    </div>
  );
}
