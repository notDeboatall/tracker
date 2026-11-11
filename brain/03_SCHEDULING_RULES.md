# 03. Scheduling Rules (the heart of the app)

The engine is a **pure function**:

```
replan(input: ReplanInput): ReplanResult
```
- Input: date, day mode, base template for the day, current time ("now"), logged progress, tasks, habit history, settings.
- Output: a new list of blocks for the day, a **change summary** (human-readable list), and any **conflicts** needing the user's decision.

No UI, no storage, no `Date.now()` inside; "now" is always passed in so tests are deterministic.

## 1. Time model
- Work in **minutes from midnight** (0 to 1439) inside the engine. Convert at the edges.
- Day window = `wake` to `sleep` (default 06:30 to 22:30). Sleep is a hard wall unless the user explicitly accepts an extension (max +60 min, a conflict option).
- **Past is locked.** Anything before `now` is frozen: blocks already done/skipped/missed stay as logged. Only the future is re-planned. A block currently in progress is kept unless the user changes it.

## 2. Block layers (priority order, highest first)
| Layer | Name | Examples | Movable? | Shrinkable? |
|---|---|---|---|---|
| L0 | **Fixed** | College, rides, sleep, meals, user-pinned tasks | No | No |
| L1 | **Protected minimums** | Gym 30, DSA 45, AIML 30 | Yes (within day) | No (this is the floor) |
| L2 | **Urgent tasks** | Deadline within 24h, or importance = Urgent | Yes | No |
| L3 | **Normal tasks** | Deadline later, importance Normal/High | Yes | Can be split across days |
| L4 | **Habit extension** | Gym 30 to 120, DSA 45 to 90, AIML 30 to 90 | Yes | Yes (first thing to shrink) |
| L5 | **Routine / free** | Snacks, wind-down, buffers | Yes | Yes (first thing to drop) |

Meaning: fixed commitments are sacred; then every habit gets at least its minimum; then work gets time; then habits grow back to full size with whatever is left.

> Exception: **Urgent** tasks with a deadline today may be placed **before** habit minimums in the *ordering of time slots* (e.g. do the assignment first), but the habit minimums must still be scheduled somewhere in the day. If both cannot fit, raise a conflict (section 6). Never silently drop a minimum.

## 3. Algorithm (step by step)

```
1. Build the base day from the template for (weekday, mode).
   - Apply mode transformations (Holiday, Partial change, Low energy, Crunch). See section 5.
2. Lock the past: blocks ending <= now keep their logged status.
3. Compute free windows: future time between L0 blocks, between max(now, wake) and sleep.
4. Collect work to place:
   a. Habit minimums not yet done today        -> L1
   b. Tasks due today or marked Urgent          -> L2
   c. Other tasks (sorted by deadline, then importance) -> L3
5. Place L1, then L2, then L3 into free windows:
   - Preference order for habits: their preferred time window, then the nearest free window to it.
   - Tasks: earliest suitable free window; prefer a long contiguous window if the task is deep work (duration >= 60 min).
   - Don't create blocks shorter than 15 min (merge or push).
   - Add a 10 min transition buffer after any block >= 90 min if space allows.
6. Extend: use remaining free time to grow L4 (habit extension), in order of priority: Gym -> DSA -> AIML.
   - Never extend a habit beyond its full duration.
   - Leave at least 30 min of L5 wind-down before sleep if possible.
7. Detect conflicts (section 6). If any L1 or L2 item cannot be placed, do not drop it: return conflicts with options.
8. Produce the change summary by diffing old plan vs new plan.
```

## 4. Priority and ordering rules
- **Gym > DSA > AIML** when two habits compete for the same space.
- **Protected habits** (missed yesterday): treat the minimum as L0-like. It cannot be moved to tomorrow without an explicit warning, and the UI marks it with a shield.
- **Urgent task vs habit extension:** the task always wins.
- **Urgent task vs habit minimum:** both must fit; if not, conflict.
- **Task vs task:** earlier deadline first; tie-break with higher importance; then shorter duration first.
- **Gym time preference:** avoid starting a gym session later than 20:30. If it cannot happen before then, offer a reduced session (minimum) rather than a late full session.
- **Evening rule:** nothing heavy (DSA, tasks needing focus) after 22:00, so use the wind-down for light items only.
- **Energy rule:** deep tasks (>= 60 min) go in daytime free windows first, evening second.

## 5. Mode transformations

### Normal
Use the weekday template as is (`01_USER_PROFILE.md`).

### Holiday (college off)
- Remove `College` and the two rides to/from college.
- Gym preferred time becomes **morning** (07:30), full length.
- DSA moves to the first free late-morning window (about 10:15), AIML to a mid-afternoon window.
- The freed hours become free windows for tasks; leftover time goes to habit extension, then a visible **Free / rest** block. Do not fill every minute: keep at least 90 min of unplanned free time on a holiday.
- If the holiday is announced **mid-day**, past blocks stay locked and only the remainder re-plans.

### Partial change
Parameters: `collegeStart?`, `collegeEnd?`, `freeFrom?`, `freeTo?`.
- Shorten/shift the college block accordingly (rides move with it).
- New free windows are filled by the normal algorithm.

### Low energy / sick
- All habits switch to **minimum** size (Gym minimum may be replaced by a walk if the user selects "sick").
- Add a 60 min rest block.
- Tasks with deadlines still get placed; non-urgent tasks are deferred.
- Streak still counts if minimums are done.

### Exam / crunch
- Course blocks (DSA, AIML) = minimum.
- Gym = at least minimum, never zero.
- Tasks and study-for-exam tasks take all remaining time.
- Sleep stays protected.

### Sunday
Template: catch-up study + weekly plan. Missed blocks from the week are suggested here ("carry-over list").

## 6. Conflicts and options
A conflict exists when an L0/L1/L2 item cannot be placed inside the day window.

Return `Conflict { reason, affectedItems, options[] }` where each option is **concrete and one-tap**, chosen from:
1. **Split the task:** do X min today, the remainder tomorrow (only if deadline allows).
2. **Move a habit to tomorrow** (never allowed for Protected habits without warning; Gym last to be offered).
3. **Extend the day** until at most 23:30 (+60 min), once.
4. **Shrink the task** to a stated shorter duration (user must confirm; warn it changes the estimate).
5. **Skip a low-priority routine/free block** (always safe; applied automatically before raising a conflict).

The engine must never pick options 2 to 4 on its own. It applies option 5 automatically and then asks.

## 7. Explainability
Every change produces one line in the summary, in plain English:
- "Added 'DBMS assignment' (2h) at 17:00 to 19:00."
- "Shrunk Java DSA from 90 to 45 min (minimum) to fit the assignment."
- "Moved AIML Python from 19:45 to 20:30."
- "Dropped the 21:15 wind-down buffer."
- "Gym is protected today because you missed it yesterday."

## 8. Idempotence and stability
- Re-running `replan` with unchanged inputs returns an identical plan.
- Avoid unnecessary shuffling: if a block still fits where it was, **leave it** (minimise diff). Stability matters because I plan my day around the timeline.
- Manual edits (user pins a block) become L0 until unpinned.

## 9. Defaults (configurable in settings)
- Min block size 15 min; transition buffer 10 min; wind-down 30 min.
- Day window 06:30 to 22:30; max extension +60 min.
- Holiday min free time 90 min.
- Latest gym start 20:30.
