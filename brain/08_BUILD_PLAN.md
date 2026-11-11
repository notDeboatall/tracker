# 08. Build Plan

Build in phases. **Finish and verify each phase before starting the next.** Each phase has a Definition of Done (DoD).

## Phase 0: Scaffold (about 30 min)
- Vite + React + TS (strict), Tailwind, Vitest, ESLint/Prettier, Zustand, Dexie, date-fns.
- Create the folder structure from `04_TECH_STACK_AND_ARCHITECTURE.md`.
- Set up design tokens (CSS variables, Tailwind config, Bricolage/Instrument Sans/Plex Mono fonts, light/dark) from `12_DESIGN_SYSTEM.md`, plus primitives `Button`, `Chip`, `Segmented`, `Sheet`, `Toast`, `RoundCheck`.
- **DoD:** `npm run dev` shows a placeholder page; `npm test` runs; lint passes.

## Phase 1: Types, time helpers, seed templates
- Implement `types/index.ts` from `05_DATA_MODEL.md`.
- `engine/time.ts`: `toMin("14:30")`, `toHHMM(870)`, clamp helpers.
- `engine/templates.ts`: Mon-Wed, Thu-Sat, Sunday templates from `01_USER_PROFILE.md`.
- **DoD:** tests confirm templates have no overlaps and match the profile exactly (scenario S1).

## Phase 2: Scheduling engine (the big one)
Implement in this order, testing each:
1. `freeWindows.ts` (free time between L0 blocks, after `now`)
2. `modes.ts` (holiday, partial, low energy, crunch)
3. `place.ts` (L1 minimums, L2/L3 tasks)
4. `extend.ts` (L4 extension)
5. `conflicts.ts` (+ options)
6. `explain.ts` (diff -> summary lines)
7. `replan.ts` (orchestrator)
- **DoD:** all scenarios S1 to S18 and the property checks in `07_SCENARIOS_AND_TESTS.md` pass; engine has no React/DOM imports.

## Phase 3: Today screen (read-only)
- Look at `brain/references/` and `brain/12_DESIGN_SYSTEM.md` (Paper & Ink) first; avoid everything on its anti-slop list.
- Store with seed settings; compute today's plan with `replan`.
- Timeline UI with now-line, colour/icon coding, streak chips (static for now).
- **DoD:** the app shows the correct day template for any weekday and highlights the current block.

## Phase 4: Quick add and live re-planning
- `QuickAddTask` bottom sheet, store `addTask`, persistence with Dexie.
- Change Summary toast + Undo; Conflict Dialog applying chosen options.
- **DoD:** adding tasks re-plans instantly; scenarios S3, S4, S10 behave correctly in the UI.

## Phase 5: Day modes
- Mode Switcher (Holiday, College changed, Low energy, Crunch, Back to normal) for today and future dates.
- **DoD:** S5, S6, S7, S12, S13, S17 work end to end in the UI.

## Phase 6: Logging and streaks
- Done/Partial/Skip on blocks, habit log, streak calculation, "never miss twice" shield.
- **DoD:** S9 and S16 work in UI; streak chips are real.

## Phase 7: Week, Tasks, Tracker, Settings
- Week grid, Tasks page, 21-day tracker view, Settings with template editor, JSON export/import.
- **DoD:** I can change my routine times in Settings and see the plan update.

## Phase 8: PWA and notifications
- Manifest, service worker, offline, install prompt; optional "next block in 5 min" notification.
- **DoD:** installable on my phone; works offline.

## Phase 9 (optional): AI quick add with Gemini
- Full spec: `brain/11_AI_QUICK_ADD.md`.
- Add Settings fields (enable toggle, API key stored locally, model name).
- `src/ai/geminiClient.ts`: single module that calls the Gemini API (free tier) and requests JSON-only output.
- Validate output with Zod; map `add_task` to a pre-filled Quick Add form and `set_mode` to a pre-selected mode.
- User must always confirm before anything is saved.
- Handle: no key, offline, 429, timeout, invalid JSON, with a graceful fallback to the manual form.
- **DoD:** all tests in `11_AI_QUICK_ADD.md` pass; with AI disabled or failing the app works exactly as before; the key is never committed, logged, or exported.

## Out of scope until after Phase 8
Cloud sync, calendar integration, multi-user.

## Working agreement per phase
1. Agent produces a short plan and lists files it will touch.
2. Agent implements + writes/updates tests.
3. Agent runs tests and lint, reports results.
4. I review in the browser, then approve the next phase.
