# 05. Data Model

All times in the engine are **minutes from midnight** (`number`, 0 to 1439). Dates are `YYYY-MM-DD` strings in the local timezone (Asia/Kolkata).

## Core types (put in `src/types/index.ts`)

```ts
export type HabitId = 'gym' | 'dsa' | 'aiml' | 'catchup' | 'weeklyplan';

export type BlockKind =
  | 'fixed'      // college, rides, sleep, meals: immovable (L0)
  | 'habit'      // gym, dsa, aiml, catchup
  | 'task'       // user work
  | 'routine'    // wake-up, snack, wind-down
  | 'free';      // unplanned time

export type BlockStatus = 'planned' | 'in_progress' | 'done' | 'partial' | 'skipped' | 'missed';

export type Layer = 'L0' | 'L1' | 'L2' | 'L3' | 'L4' | 'L5';

export interface Block {
  id: string;
  kind: BlockKind;
  title: string;
  habitId?: HabitId;
  taskId?: string;
  start: number;          // minutes from midnight
  end: number;
  layer: Layer;
  status: BlockStatus;
  pinned: boolean;        // user pinned -> acts as L0
  isMinimum?: boolean;    // habit shown at minimum size
  protected?: boolean;    // never-miss-twice shield
  reason?: string;        // why it is here / why it changed
}

export type DayMode = 'normal' | 'holiday' | 'partial' | 'low_energy' | 'crunch';

export interface PartialChange {
  collegeStart?: number;
  collegeEnd?: number;
  freeFrom?: number;
  freeTo?: number;
}

export interface DayConfig {
  date: string;                 // YYYY-MM-DD
  mode: DayMode;
  partial?: PartialChange;
  note?: string;
}

export type Importance = 'low' | 'normal' | 'high' | 'urgent';

export interface Task {
  id: string;
  title: string;
  durationMin: number;
  deadline?: string;            // ISO local datetime or YYYY-MM-DD
  importance: Importance;
  fixedStart?: { date: string; start: number };  // must be done at exact time
  splittable: boolean;
  remainingMin: number;         // for partially done tasks
  status: 'open' | 'done' | 'dropped';
  createdAt: string;            // ISO
}

export interface HabitConfig {
  id: HabitId;
  label: string;
  fullMin: number;
  minMin: number;
  priority: number;             // 1 = highest (gym=1, dsa=2, aiml=3)
  preferredStart?: number;      // minutes from midnight
  latestStart?: number;         // e.g. gym 20:30
}

export interface DayTemplate {
  id: 'mon_wed' | 'thu_sat' | 'sunday' | 'holiday_weekday';
  weekdays: number[];           // 0=Sun ... 6=Sat
  blocks: Omit<Block, 'status' | 'id'>[];
}

export interface HabitLogEntry {
  date: string;
  habitId: HabitId;
  minutesDone: number;
  status: 'done' | 'partial' | 'skipped';
  metMinimum: boolean;
}

export interface Settings {
  wake: number;                 // 390 (06:30)
  sleep: number;                // 1350 (22:30)
  maxExtensionMin: number;      // 60
  minBlockMin: number;          // 15
  transitionBufferMin: number;  // 10
  windDownMin: number;          // 30
  holidayMinFreeMin: number;    // 90
  habits: HabitConfig[];
  collegeTravelMin: number;     // 25
  gymTravelMin: number;         // 10
  ai?: {
    enabled: boolean;
    model: string;              // configurable Gemini model name
    // The API key is stored separately (local only) and is NEVER part of exports.
  };
}

export interface Profile {
  name?: string;               // optional; never show a placeholder if missing
  why?: string;                // one line in the user's own words
  accent: 'lime' | 'sky' | 'peach' | 'lilac';
  onboarded: boolean;
}

export interface WeeklyReview {
  weekStart: string;           // YYYY-MM-DD (Monday)
  worked: string;
  change: string;
  createdAt: string;           // ISO
}

export interface ReplanInput {
  date: string;
  now: number;                  // minutes from midnight (injected)
  dayConfig: DayConfig;
  template: DayTemplate;
  loggedBlocks: Block[];        // past/in-progress blocks with status
  tasks: Task[];
  habitLog: HabitLogEntry[];    // recent history for streaks + protection
  settings: Settings;
}

export interface Conflict {
  id: string;
  reason: string;
  affected: string[];           // block/task ids
  options: ConflictOption[];
}

export interface ConflictOption {
  id: string;
  label: string;                // "Move AIML to tomorrow"
  kind: 'split_task' | 'move_habit' | 'extend_day' | 'shrink_task';
  payload: unknown;
}

export interface ReplanResult {
  blocks: Block[];
  summary: string[];            // human-readable change lines
  conflicts: Conflict[];
  stats: { freeMin: number; plannedHabitMin: number; plannedTaskMin: number };
}
```

## Storage (Dexie tables)
| Table | Key | Content |
|---|---|---|
| `settings` | `id='main'` | `Settings` |
| `templates` | `id` | `DayTemplate` (editable) |
| `dayConfigs` | `date` | `DayConfig` (mode overrides, incl. future dates) |
| `tasks` | `id` | `Task` |
| `blockLogs` | `[date+id]` | Block status for the day (done/skipped/partial, actual minutes) |
| `habitLog` | `[date+habitId]` | `HabitLogEntry` |
| `snapshots` | `date` | Last computed plan (optional, for history/debug) |
| `profile` | `id='main'` | `Profile` |
| `weeklyReviews` | `weekStart` | `WeeklyReview` |
| `secrets` | `id='gemini_key'` | Gemini API key (local only, excluded from export) |

## Derived values (not stored)
- Today's plan = `replan(...)` output.
- Streak(habit) = consecutive days up to today where `metMinimum === true` (rest days like Sunday for gym are skipped, not counted as breaks).
- Protected(habit, today) = habit was **not** done (`metMinimum=false`) on the previous applicable day.

## Export format
`export.json` = `{ version: 1, settings, templates, dayConfigs, tasks, blockLogs, habitLog }`. Import validates `version`.
