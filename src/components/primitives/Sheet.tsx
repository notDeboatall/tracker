import type { ReactNode } from 'react';
import { Drawer } from 'vaul';
import { cn } from '@/lib/utils';

export interface SheetProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  children: ReactNode;
  className?: string;
}

export function Sheet({
  open,
  onOpenChange,
  title,
  description,
  children,
  className,
}: SheetProps) {
  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 bg-ink/40 backdrop-blur-xs z-50 transition-opacity" />
        <Drawer.Content
          className={cn(
            'fixed bottom-0 left-0 right-0 z-50 flex flex-col',
            'max-w-[600px] mx-auto w-full max-h-[90vh]',
            'bg-surface border-t border-x border-line rounded-t-sheet outline-none p-5 shadow-xl',
            className
          )}
        >
          {title ? (
            <Drawer.Title className="text-lg font-display font-semibold text-ink mb-1">
              {title}
            </Drawer.Title>
          ) : (
            <Drawer.Title className="sr-only">Sheet</Drawer.Title>
          )}
          {description ? (
            <Drawer.Description className="text-xs text-ink-muted mb-4">
              {description}
            </Drawer.Description>
          ) : (
            <Drawer.Description className="sr-only">Sheet content</Drawer.Description>
          )}

          {/* Drag Handle */}
          <div className="mx-auto w-12 h-1.5 flex-shrink-0 rounded-full bg-line mb-4 -mt-2 cursor-grab" />

          {/* Content */}
          <div className="flex-1 overflow-y-auto">{children}</div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
