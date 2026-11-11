# 02. Requirements

Priority tags: **[MUST]** v1, **[SHOULD]** v1 if time allows, **[LATER]** after v1.

## Epic A: Daily plan
- **A1 [MUST]** As a user, I see today's plan as a timeline from wake to sleep, with blocks colour-coded by type (fixed, habit, task, routine, free).
  - *Accept:* The correct template loads based on the weekday. The current block is highlighted and a "now" line is shown.
- **A2 [MUST]** I can mark a habit/task block as Done, Skipped, or Partially done.
  - *Accept:* Done/Skipped is stored; blocks in the past are locked from re-planning.
- **A3 [SHOULD]** Tapping a block shows details and lets me shorten, extend, or move it manually.

## Epic B: Add work on the fly (the core feature)
- **B1 [MUST]** I can add a task with: title, duration, deadline (today/tomorrow/date+time or none), importance (Low/Normal/High/Urgent), and optional "must be done at a fixed time".
  - *Accept:* After saving, the remaining day re-plans automatically and shows a **change summary** (what moved, what shrank, why).
- **B2 [MUST]** If the work cannot fit without cutting protected habits below their minimum, the app shows a **conflict dialog** with 2 to 3 concrete options (e.g. "Move AIML to tomorrow", "Split task across today and tomorrow", "Extend day by 45 min until 23:15"). It never silently drops things.
- **B3 [SHOULD]** Tasks can be split into chunks and spread over multiple days up to the deadline.
- **B4 [SHOULD]** A task can be edited, deleted, or marked done; the plan re-computes each time.

## Epic C: Day modes
- **C1 [MUST]** One-tap **Holiday** mode: removes college and its travel from today and re-plans.
- **C2 [MUST]** **Partial change**: "College ends at 11:00 today", "college starts late", "free from X to Y".
- **C3 [SHOULD]** **Low energy / sick** mode: all habits drop to minimum, extra rest added.
- **C4 [SHOULD]** **Exam / deadline crunch** mode: course blocks shrink to minimum, gym stays at least minimum, tasks get priority.
- **C5 [MUST]** Modes can be set for **future dates** too (e.g. announce a holiday next Tuesday).

## Epic D: Consistency tracking
- **D1 [MUST]** Per-habit streak counters (Gym, DSA, AIML), where "done" means minimum or more.
- **D2 [MUST]** "Never miss twice" protection: if a habit was missed yesterday, today's plan marks it **Protected** and it cannot be cut below minimum or moved without a warning.
- **D3 [SHOULD]** Week view with a tick grid (Gym / DSA / AIML x 7 days).
- **D4 [LATER]** 21-day challenge view with phases (Show up, Full schedule, Lock in).

## Epic E: Settings
- **E1 [MUST]** Edit weekly templates (times, durations), wake and sleep times, travel times.
- **E2 [MUST]** Edit habit full and minimum durations.
- **E3 [SHOULD]** Export and import data as JSON.

## Epic F: Platform
- **F1 [MUST]** Mobile-first responsive layout; works on desktop too.
- **F2 [MUST]** Local-first storage (IndexedDB or localStorage); no network required.
- **F3 [SHOULD]** Installable PWA; offline works.
- **F4 [SHOULD]** Browser notifications for the next block (5 min before).
- **F5 [LATER]** Natural-language quick add ("3 hr DSA assignment due tomorrow 6pm") via the Gemini API free tier; user pastes their own key in Settings; falls back to the form if unavailable. Full spec in `11_AI_QUICK_ADD.md`.

## Epic G: Personal layer
- **G1 [MUST]** Short onboarding: name, one-line "why", wake/sleep times, confirm habits. Skippable; the app must work without a name.
- **G2 [MUST]** Today header shows a time-aware greeting with the name, the date as a large numeral, the "why" line, and a day label derived from the template (e.g. "Gym day, college afternoon").
- **G3 [MUST]** Streaks are shown as tally marks plus a number (no flame icons); tiles for Gym, DSA, AIML.
- **G4 [SHOULD]** Sunday review: two short free-text prompts ("What worked?", "What do I change?"); last note shown the next Sunday.
- **G5 [SHOULD]** Accent (highlighter) colour picker from 4 curated options.
- **G6 [MUST]** Copy follows the voice table in `12_DESIGN_SYSTEM.md`: plain, dry, no emoji, no cheerleading.
- **G7 [SHOULD]** Honest weekly numbers ("Gym 5 of 6 this week") instead of praise.

## Non-functional requirements
- Re-plan computation < 100 ms.
- Deterministic: same inputs always produce the same plan (important for tests).
- Accessible: colour is never the only signal; labels are always present.
- Time handling uses the **local timezone (Asia/Kolkata)**; store ISO strings or minutes-from-midnight consistently (see `05_DATA_MODEL.md`).
