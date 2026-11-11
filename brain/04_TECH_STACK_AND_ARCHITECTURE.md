# 04. Tech Stack and Architecture

## Stack (keep it boring and fast)
- **Vite + React + TypeScript** (strict mode on)
- **Tailwind CSS** for styling
- **Radix UI** (primitives), **vaul** (bottom sheets), **lucide-react** (icons), **framer-motion** (light transitions), fonts Bricolage Grotesque + Instrument Sans + IBM Plex Mono; styling rules in `12_DESIGN_SYSTEM.md`
- **Zustand** for app state
- **Dexie (IndexedDB)** for persistence (fallback: localStorage is acceptable for the first milestone)
- **date-fns** for date helpers (engine itself uses minutes-from-midnight)
- **Vitest** for unit tests (engine first, UI later)
- **vite-plugin-pwa** for installability and offline (phase 8)
- No backend, no database server, no auth in v1.
- **Optional AI (Phase 9):** Google Gemini API (free tier, Flash-Lite class) called from `src/ai/geminiClient.ts` with the user's own key stored locally. Zod for validating AI output.

If the agent proposes a different stack, it must justify it in writing; default to the above.

## Architecture principles
1. **Engine is isolated.** `src/engine/*` imports nothing from React, the DOM, or storage. It is pure TypeScript.
2. **Single direction of data:** UI dispatches actions -> store updates data -> store calls `replan()` -> UI renders the resulting plan.
3. **Plan is derived data.** Store the *inputs* (templates, tasks, logs, overrides); recompute the plan on demand. Persist a snapshot only for history/debugging.
4. **Time is injected.** Never call `new Date()` in the engine; pass `now`.

## Folder structure
```
project-root/
  brain/                      # these docs (do not delete)
  src/
    engine/                   # PURE LOGIC (heavily tested)
      time.ts                 # minutes<->HH:mm helpers
      templates.ts            # seed templates (Mon-Wed, Thu-Sat, Sun)
      modes.ts                # holiday / partial / low-energy / crunch transforms
      freeWindows.ts          # compute free windows between fixed blocks
      place.ts                # placement of habits and tasks
      extend.ts               # habit extension
      conflicts.ts            # conflict detection and options
      explain.ts              # diff -> human summary
      replan.ts               # orchestrates everything
      index.ts
    store/
      useAppStore.ts          # zustand store
      db.ts                   # Dexie schema and persistence
    components/
      Timeline/               # day timeline, block cards, now-line
      QuickAddTask/           # bottom sheet form
      ModeSwitcher/           # Holiday / Partial / Low energy / Crunch
      ChangeSummary/          # what-changed toast and sheet
      ConflictDialog/
      StreakCards/
      WeekGrid/
      Settings/
    pages/
      Today.tsx
      Week.tsx
      Tasks.tsx
      Tracker.tsx
      Settings.tsx
    ai/                       # OPTIONAL (Phase 9); isolated from the engine
      geminiClient.ts         # the only file that calls the Gemini API
      parseSchema.ts          # Zod schema + validators
      prompt.ts               # system prompt template
    lib/
      dates.ts                # local timezone helpers
    types/
      index.ts                # shared types (see 05_DATA_MODEL.md)
    main.tsx
    App.tsx
  tests/
    engine/                   # unit tests mirroring 07_SCENARIOS_AND_TESTS.md
  public/
    manifest.webmanifest
```

## Module responsibilities
| Module | Responsibility | Must NOT |
|---|---|---|
| `engine/replan.ts` | Orchestrate steps from `03_SCHEDULING_RULES.md` | Touch DOM/storage |
| `engine/modes.ts` | Transform base day by mode | Place tasks |
| `engine/place.ts` | Put items into free windows | Decide priorities (reads layer from item) |
| `store/useAppStore.ts` | Hold inputs, call `replan`, expose derived plan | Contain scheduling logic |
| `components/*` | Render and dispatch | Compute schedules |

## State flow example (add urgent task)
```
QuickAddTask submit
  -> store.addTask(task)
  -> store persists task (Dexie)
  -> store calls replan({date, mode, template, now, logs, tasks, history, settings})
  -> store sets plan, summary, conflicts
  -> Timeline re-renders; ChangeSummary toast shows; ConflictDialog opens if conflicts
```

## Performance and quality bars
- `replan` < 100 ms on a normal day.
- TypeScript strict, no `any` in `src/engine`.
- ESLint + Prettier configured.
- Test coverage for `src/engine` >= 90% of branches.

## Deployment (later)
- Static hosting (Vercel/Netlify/GitHub Pages). No server needed.
