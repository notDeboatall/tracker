import { cn } from '@/lib/utils';

export interface TallyMarksProps {
  count: number;
  className?: string;
  strokeWidth?: number;
}

// Deterministic wobble parameters to simulate hand-drawn strokes consistently
const STROKE_OFFSETS = [
  { xTop: 0, xBottom: 1, yTop: 2, yBottom: 22 },
  { xTop: 6, xBottom: 5, yTop: 3, yBottom: 21 },
  { xTop: 12, xBottom: 13, yTop: 1, yBottom: 23 },
  { xTop: 18, xBottom: 17, yTop: 2, yBottom: 22 },
  // Cross stroke (from bottom-left to top-right across the 4 lines)
  { x1: -2, y1: 18, x2: 21, y2: 6 },
];

export function TallyMarks({
  count,
  className,
  strokeWidth = 2,
}: TallyMarksProps) {
  if (count <= 0) {
    return <span className="font-mono text-xs text-ink-muted">0</span>;
  }

  const groups = Math.floor(count / 5);
  const remainder = count % 5;

  return (
    <div
      className={cn('inline-flex items-center gap-2 select-none', className)}
      aria-label={`${count} tally`}
    >
      {/* Full 5-stroke groups */}
      {Array.from({ length: groups }).map((_, groupIdx) => (
        <svg
          key={`group-${groupIdx}`}
          viewBox="-4 0 28 24"
          className="w-6 h-5 stroke-ink fill-none overflow-visible"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          aria-hidden="true"
        >
          {/* 4 vertical strokes */}
          {STROKE_OFFSETS.slice(0, 4).map((stroke, i) => (
            <line
              key={i}
              x1={stroke.xTop}
              y1={stroke.yTop}
              x2={stroke.xBottom}
              y2={stroke.yBottom}
            />
          ))}
          {/* Diagonal slash */}
          <line
            x1={STROKE_OFFSETS[4].x1}
            y1={STROKE_OFFSETS[4].y1}
            x2={STROKE_OFFSETS[4].x2}
            y2={STROKE_OFFSETS[4].y2}
          />
        </svg>
      ))}

      {/* Remainder strokes (1 to 4) */}
      {remainder > 0 && (
        <svg
          viewBox={`-2 0 ${remainder * 6 + 2} 24`}
          style={{ width: `${Math.max(8, remainder * 6)}px`, height: '20px' }}
          className="stroke-ink fill-none overflow-visible"
          strokeLinecap="round"
          strokeWidth={strokeWidth}
          aria-hidden="true"
        >
          {STROKE_OFFSETS.slice(0, remainder).map((stroke, i) => (
            <line
              key={i}
              x1={stroke.xTop}
              y1={stroke.yTop}
              x2={stroke.xBottom}
              y2={stroke.yBottom}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
