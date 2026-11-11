# 10. Copy-Paste Prompts for Antigravity

Use these in order. Replace nothing unless noted. Always wait for the agent's plan and approve before it writes code.

---
## Kickoff prompt (paste first)
```
You are building a personal "Adaptive Day Planner" web app.

Read every file in the /brain folder in order, starting with README.md.
These files are the spec: 00_PROJECT_OVERVIEW, 01_USER_PROFILE, 02_REQUIREMENTS,
03_SCHEDULING_RULES, 04_TECH_STACK_AND_ARCHITECTURE, 05_DATA_MODEL, 06_UI_UX_SPEC,
07_SCENARIOS_AND_TESTS, 08_BUILD_PLAN, 09_AGENT_RULES, 12_DESIGN_SYSTEM, and 11_AI_QUICK_ADD (read it, but do not build it until Phase 9).

Then:
1. Summarise your understanding in under 15 bullets.
2. List any ambiguities or questions (max 5).
3. Do NOT write code yet. Wait for my go-ahead.

Follow 09_AGENT_RULES.md strictly.
```

---
## Phase 0: Scaffold
```
Start Phase 0 from brain/08_BUILD_PLAN.md.
Scaffold the project exactly per brain/04_TECH_STACK_AND_ARCHITECTURE.md
(Vite + React + TypeScript strict, Tailwind, Zustand, Dexie, date-fns, Vitest, ESLint/Prettier)
and set up the design tokens and base primitives from brain/12_DESIGN_SYSTEM.md (Paper & Ink: light + dark mode, Bricolage Grotesque / Instrument Sans / IBM Plex Mono fonts).
Look at the screenshots in brain/references/ and read its README for what to take and what to leave.
Create the folder structure. First post a plan, wait for approval, then implement.
Finish by running dev server, tests and lint, and report results.
```

## Phase 1: Types, time helpers, templates
```
Start Phase 1 from brain/08_BUILD_PLAN.md.
Implement src/types/index.ts from brain/05_DATA_MODEL.md, engine/time.ts, and engine/templates.ts
using the exact seed data in brain/01_USER_PROFILE.md (Mon-Wed, Thu-Sat, Sunday).
Write tests proving templates have no overlaps and match the profile (scenario S1).
Post a plan first.
```

## Phase 2: Engine
```
Start Phase 2 from brain/08_BUILD_PLAN.md: the scheduling engine.
Implement in this order: freeWindows, modes, place, extend, conflicts, explain, replan.
Follow brain/03_SCHEDULING_RULES.md exactly (layers L0-L5, algorithm steps, conflicts, explainability).
Write tests for every scenario S1-S18 and the property checks in brain/07_SCENARIOS_AND_TESTS.md.
The engine must stay pure (no React, DOM, storage, or Date calls; "now" is injected).
Work module by module: after each module, run its tests and show me the results before continuing.
Post a plan first.
```

## Phase 3: Today screen
```
Start Phase 3 from brain/08_BUILD_PLAN.md.
Build the Today screen per brain/06_UI_UX_SPEC.md (Screen 1) and brain/12_DESIGN_SYSTEM.md: editorial date header with
the personal greeting and 'why' line, vertical timeline with now-marker, colour + icon coding, streak tiles with tally
marks (static for now), mode chip placeholder. Avoid everything on the anti-slop list. Mobile-first at 380px.
It must call replan() through the Zustand store; no scheduling logic in components.
Post a plan first, then implement and show me how to view it.
```

## Phase 4: Quick add + live replanning
```
Start Phase 4 from brain/08_BUILD_PLAN.md.
Build QuickAddTask (Screen 2), Change Summary with Undo (Screen 3), and the Conflict Dialog (Screen 4).
Persist tasks with Dexie. Adding a task must re-plan instantly and show the summary.
Verify scenarios S3, S4 and S10 in the UI. Post a plan first.
```

## Phase 5: Day modes
```
Start Phase 5 from brain/08_BUILD_PLAN.md.
Build the Mode Switcher (Screen 5): Holiday, College changed (start/end), Low energy, Crunch,
Back to normal, for today or a future date. Persist dayConfigs.
Verify S5, S6, S7, S12, S13, S17. Post a plan first.
```

## Phase 6: Logging and streaks
```
Start Phase 6 from brain/08_BUILD_PLAN.md.
Add Done / Partial / Skip on blocks, habit log persistence, real streak calculation,
and the "never miss twice" shield (brain/02_REQUIREMENTS.md D1-D2, rules in brain/03).
Verify S9 and S16. Post a plan first.
```

## Phase 7: Week, Tasks, Tracker, Settings
```
Start Phase 7 from brain/08_BUILD_PLAN.md.
Build the Week, Tasks, Tracker (with 21-day challenge grid) and Settings screens per brain/06_UI_UX_SPEC.md,
including a template editor and JSON export/import. Post a plan first.
```

## Phase 8: PWA + notifications
```
Start Phase 8 from brain/08_BUILD_PLAN.md.
Add vite-plugin-pwa (manifest, service worker, offline), install prompt, and optional
"next block in 5 min" notifications behind a settings toggle. Post a plan first.
```

## Phase 9 (optional): AI quick add with Gemini
```
Start Phase 9 from brain/08_BUILD_PLAN.md. Read brain/11_AI_QUICK_ADD.md fully.
Before coding, check the current Gemini API docs (https://ai.google.dev/gemini-api/docs) for the
correct REST endpoint, auth header, a current Flash-Lite model name, and the JSON/structured-output option.
Tell me what you found.

Then implement:
- Settings: AI enable toggle, masked API key field (stored locally only, excluded from export), model name field.
- src/ai/geminiClient.ts (only file that calls the API), parseSchema.ts (Zod), prompt.ts.
- Quick Add: "Describe it in a sentence" box + Parse button that pre-fills the form (add_task)
  or pre-selects a mode (set_mode). The user must confirm before anything is saved.
- Graceful fallback to the manual form on: no key, offline, 429, timeout, invalid JSON.
- Cooldown of 5 seconds between parses; at most one retry with backoff on 429.
- Tests listed in brain/11_AI_QUICK_ADD.md, with fetch mocked.
The engine must not import anything from src/ai. Post a plan first.
```

---
## Useful helper prompts

**Review against the spec**
```
Review the current code against brain/03_SCHEDULING_RULES.md and brain/07_SCENARIOS_AND_TESTS.md.
List every rule or scenario that is missing, wrong, or untested. Do not change code yet.
```

**Debug a bad plan**
```
Here is the input and the plan the engine produced: <paste>.
Explain which rule in brain/03 was applied or violated, write a failing test that captures the bug,
then fix it with the smallest change.
```

**Add a new rule**
```
I want a new rule: <describe>. First update the right brain file (03 and 07), show me the diff,
then add tests, then implement.
```
