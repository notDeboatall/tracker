import { useState } from 'react';
import {
  Button,
  Chip,
  Segmented,
  Sheet,
  Toast,
  RoundCheck,
  TallyMarks,
  type CheckStatus,
} from './components/primitives';
import { Dumbbell, Code2, BrainCircuit, Moon, Sun } from 'lucide-react';

export function App() {
  const [dark, setDark] = useState(false);
  const [chipSelected, setChipSelected] = useState<string>('90m');
  const [segmentVal, setSegmentVal] = useState<string>('normal');
  const [checkStatus, setCheckStatus] = useState<CheckStatus>('unmarked');
  const [sheetOpen, setSheetOpen] = useState(false);
  const [toastOpen, setToastOpen] = useState(false);

  const toggleDark = () => {
    setDark((prev) => {
      const next = !prev;
      if (next) {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
      return next;
    });
  };

  return (
    <div className="min-h-screen bg-paper text-ink p-4 flex flex-col items-center justify-start transition-colors">
      <main className="w-full max-w-[420px] flex flex-col gap-6 py-4">
        {/* Header */}
        <header className="flex items-start justify-between border-b border-line pb-4">
          <div>
            <div className="font-mono text-xs uppercase tracking-wider text-ink-muted">
              WEDNESDAY, 11 NOV
            </div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-ink mt-1">
              Phase 0
            </h1>
            <p className="font-sans text-xs text-ink-muted mt-1">
              Scaffold, design tokens and base primitives.
            </p>
          </div>
          <button
            type="button"
            onClick={toggleDark}
            aria-label="Toggle dark mode"
            className="p-2 rounded-full border border-line bg-surface text-ink hover:bg-surface-2 transition-colors cursor-pointer"
          >
            {dark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
          </button>
        </header>

        {/* Priority Tally / Streak Tokens Preview */}
        <section className="flex flex-col gap-2">
          <div className="font-sans text-xs uppercase font-medium tracking-wider text-ink-muted">
            Priorities & Tally Marks
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="p-3 rounded-card border border-line bg-block-gym-tint/20 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-block-gym-strong font-medium text-xs">
                <Dumbbell className="w-3.5 h-3.5" />
                <span>Gym</span>
              </div>
              <div className="font-mono text-xl font-semibold text-ink">4</div>
              <TallyMarks count={4} />
            </div>

            <div className="p-3 rounded-card border border-line bg-block-dsa-tint/20 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-block-dsa-strong font-medium text-xs">
                <Code2 className="w-3.5 h-3.5" />
                <span>DSA</span>
              </div>
              <div className="font-mono text-xl font-semibold text-ink">7</div>
              <TallyMarks count={7} />
            </div>

            <div className="p-3 rounded-card border border-line bg-block-aiml-tint/20 flex flex-col gap-1">
              <div className="flex items-center gap-1.5 text-block-aiml-strong font-medium text-xs">
                <BrainCircuit className="w-3.5 h-3.5" />
                <span>AIML</span>
              </div>
              <div className="font-mono text-xl font-semibold text-ink">3</div>
              <TallyMarks count={3} />
            </div>
          </div>
        </section>

        {/* Primitives Section */}
        <section className="flex flex-col gap-3">
          <div className="font-sans text-xs uppercase font-medium tracking-wider text-ink-muted">
            Primitives
          </div>

          {/* Segmented Control */}
          <div>
            <div className="text-xs text-ink-muted mb-1 font-mono">Segmented:</div>
            <Segmented
              options={[
                { value: 'low', label: 'Low' },
                { value: 'normal', label: 'Normal' },
                { value: 'high', label: 'High' },
                { value: 'urgent', label: 'Urgent' },
              ]}
              value={segmentVal}
              onChange={setSegmentVal}
              className="w-full"
            />
          </div>

          {/* Chips */}
          <div>
            <div className="text-xs text-ink-muted mb-1 font-mono">Preset Chips:</div>
            <div className="flex flex-wrap gap-1.5">
              {['30m', '45m', '1h', '90m', '2h'].map((val) => (
                <Chip
                  key={val}
                  selected={chipSelected === val}
                  onClick={() => setChipSelected(val)}
                >
                  {val}
                </Chip>
              ))}
            </div>
          </div>

          {/* RoundCheck */}
          <div className="flex items-center justify-between p-3 rounded-card border border-line bg-surface">
            <span className="text-sm font-sans">
              Status: <span className="font-mono text-xs">{checkStatus}</span>
            </span>
            <RoundCheck status={checkStatus} onChange={setCheckStatus} />
          </div>

          {/* Buttons & Sheet Trigger */}
          <div className="flex flex-col gap-2 pt-2">
            <Button variant="primary" onClick={() => setSheetOpen(true)}>
              Open Bottom Sheet (Vaul)
            </Button>
            <Button
              variant="secondary"
              onClick={() => {
                setToastOpen(true);
                setTimeout(() => setToastOpen(false), 5000);
              }}
            >
              Trigger Summary Toast
            </Button>
          </div>
        </section>

        {/* Sheet */}
        <Sheet
          open={sheetOpen}
          onOpenChange={setSheetOpen}
          title="Change Details"
          description="Deterministic diff summary from the scheduling engine."
        >
          <div className="space-y-4 py-2">
            <div className="p-3 rounded-input bg-surface-2 border border-line font-mono text-xs text-ink">
              14:15 - DSA reduced to 45m (minimum) to fit urgent task.
            </div>
            <Button
              variant="primary"
              className="w-full"
              onClick={() => setSheetOpen(false)}
            >
              Dismiss
            </Button>
          </div>
        </Sheet>

        {/* Toast */}
        <Toast
          visible={toastOpen}
          message="DSA cut to 45m. Plan updated."
          timestamp="14:15"
          onUndo={() => setToastOpen(false)}
          onDetails={() => {
            setToastOpen(false);
            setSheetOpen(true);
          }}
        />
      </main>
    </div>
  );
}

export default App;
