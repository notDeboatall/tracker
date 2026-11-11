# 07. Scenarios and Tests

Turn every scenario into a Vitest test in `tests/engine/`. All use an injected `now`. Times are shown as HH:mm for readability.

Base: Mon-Wed template, Settings defaults (see `01_USER_PROFILE.md` and `03_SCHEDULING_RULES.md`).

## S1. Normal day, no changes (Mon, now = 06:30)
- **Expect:** the plan equals the seed template exactly. No summary lines. No conflicts.

## S2. Normal day, midday (Mon, now = 14:12, nothing logged)
- **Expect:** blocks before 14:12 locked; DSA 14:00 to 15:30 is `in_progress`; rest unchanged.

## S3. Add urgent 3h assignment at 14:00 (Mon), deadline today 23:59
- Free time before sleep after fixed blocks is limited.
- **Expect:**
  - Assignment is placed (3h) before 22:30.
  - Gym and DSA and AIML all still appear at **least at minimum** (30 / 45 / 30), or a conflict is raised offering options. Never silently dropped.
  - Habit extension is reduced first (Gym 120 -> shrinks, DSA 90 -> shrinks).
  - Summary lists every shrink/move with reasons.
  - Nothing scheduled past 22:30.

## S4. Add small task (30 min, deadline tomorrow) at 14:00 (Mon)
- **Expect:** task fits into free/wind-down time or squeezes habit extension minimally; no habit goes below full size if free time exists; minimal diff (blocks that still fit are unchanged).

## S5. Holiday declared at 06:30 (Tue)
- **Expect:**
  - No College, no college rides.
  - Gym at 07:30 for 120 min.
  - DSA and AIML at full size in sensible slots.
  - At least 90 min of unplanned free time remains.
  - Summary: "College removed (holiday). Gym moved to 07:30. ..."

## S6. Holiday declared mid-day at 10:00 (Tue, college already partially attended)
- **Expect:** blocks before 10:00 stay as logged; from 10:00 the day re-plans without the remaining college hours; Gym and DSA are placed in the freed window.

## S7. College ends early (Mon, college 08:00 to 11:00 today)
- **Expect:** ride home moves to 11:00; freed 11:30 to 13:00 is used (DSA moves earlier or habit extension grows); no overlaps.

## S8. Thu-Sat template, urgent task added at 20:45
- Little time left before 22:30.
- **Expect:** if AIML (20:30 to 21:30) already in progress it stays; urgent task placed in remaining time or a conflict offering "Split today/tomorrow" or "Extend +60 min". The engine never schedules past 22:30 without user acceptance.

## S9. Never miss twice
- Yesterday Gym was skipped.
- **Expect:** today's Gym block has `protected = true`; if a conflict arises, Gym is never offered as "move to tomorrow" before other options; Gym keeps at least 30 min.

## S10. Overload (cannot fit)
- Add two 3h urgent tasks due today at 14:00 on a Mon.
- **Expect:** `conflicts.length >= 1`; options include split, extend day (+60 max), and move AIML; **no** option silently applied; the plan returned is the best-effort valid plan (fixed + minimums + as much as fits), with unplaced tasks listed in the conflict.

## S11. Task with fixed start time
- Task pinned at 17:00 to 18:00 on a Mon (overlaps the gym).
- **Expect:** task stays at 17:00; Gym moves to the nearest valid window or is split/shrunk to minimum; reason shown.

## S12. Low energy mode
- **Expect:** all habits at minimum; 60 min rest block added; non-urgent tasks deferred; streak logic still counts minimums.

## S13. Crunch mode
- **Expect:** DSA/AIML at minimum; gym at least minimum; tasks get the rest; sleep untouched.

## S14. Sunday
- **Expect:** no gym, catch-up study 2 to 3 h, weekly plan 20 min, carry-over list of missed blocks from the week.

## S15. Stability / idempotence
- Run `replan` twice with identical inputs.
- **Expect:** identical output. Re-run after an irrelevant change (e.g. add a task for next week): today's blocks unchanged.

## S16. Past is locked
- At 18:30, mark Gym as skipped, then add a task.
- **Expect:** the skipped Gym remains `skipped`; it is not resurrected in the past; a "move gym to later" option may be offered but only to a future slot before the 20:30 latest start.

## S17. Future-date mode
- Declare Holiday for next Tuesday while today is Wed.
- **Expect:** today unchanged; next Tuesday's plan uses holiday transform when opened.

## S18. Invalid/edge inputs
- Task duration 0, negative, or > 12h; deadline in the past; `now` before wake or after sleep.
- **Expect:** validation errors or graceful handling, never a crash or an infinite loop.

## Property-style checks (run on random inputs)
- No overlapping blocks.
- All blocks inside `[wake, sleep]` (unless extension accepted).
- Every habit appears at `>= minMin` unless a conflict explicitly lists it.
- Total planned minutes <= available minutes.
- Output is deterministic.

## UI smoke tests (later phases)
- Add task flow shows the Change Summary.
- Holiday toggle removes college from the timeline.
- Undo restores the previous plan.
