# 06. UI / UX Spec

**Mobile-first** (design for ~380 px wide first, then scale up). One-handed use. Big tap targets (>= 44 px).

> Full style guide (tokens, components, motion) is in `12_DESIGN_SYSTEM.md`. If anything here conflicts, `12_DESIGN_SYSTEM.md` wins for visuals; this file wins for screen content and behaviour.

## Visual language
- Clean, calm, high-contrast. Light and dark mode (follow system).
- Block colours (always paired with an icon and label; colour is never the only signal):
  - Gym: red/coral, dumbbell icon
  - Java DSA: blue, code icon
  - AIML Python: green, brain/chip icon
  - Tasks: purple/orange by importance, checkbox icon
  - Fixed (college, rides, sleep): grey, lock icon
  - Routine/free: pale yellow/transparent
- Protected habits show a shield badge. Minimum-size habits show a small "MIN" chip.

## Navigation
Bottom bar: **Today** | **Week** | **[ + ]** (centre black circle = Quick Add) | **Tasks** | **Tracker**. Settings opens from a gear in the Today header.

## Screen 1: Today (home)
```
+----------------------------------+
| Wed 11 Nov   [Normal v]  (mode)  |
| 🔥 Gym 4  DSA 3  AIML 3          |  streak chips
+----------------------------------+
| 06:30  Wake up                   |
| 08:00  ▓ College ▓ (fixed)       |
| ---- NOW 14:12 ----------------- |
| 14:00  Java DSA (90m)  [Done][Skip]
| 16:10  Gym (120m) 🛡             |
| 19:45  AIML (90m)                |
| ...                              |
+----------------------------------+
|  Today  Week  (+)  Tasks  Track |  tab bar, centre + = add work
+----------------------------------+
```
- Vertical timeline with proportional block heights (min height for tiny blocks).
- "Now" line auto-scrolls into view.
- Tapping a block opens a bottom sheet: details, Done / Partial / Skip, Shorten, Move, Pin.
- Header **mode chip** opens the Mode Switcher.

**Today header (personal):** time-aware greeting with the name ("Morning, Rahul."), the date as a big numeral with weekday and month, the user's one-line "why" in small text, and a derived day label ("Gym day, college afternoon"). Below it, three streak tiles (Gym, DSA, AIML) with big mono numbers and tally marks. See `12_DESIGN_SYSTEM.md` (Personal layer) for exact rules.

## Screen 1b: Onboarding (first run, skippable)
Three short steps: (1) name and one-line why, (2) confirm wake/sleep and the weekly routine from `01_USER_PROFILE.md`, (3) optional: pick highlighter accent. No marketing screens, no illustrations. Ends on Today.

## Screen 1c: Sunday review
Shown on Sundays (dismissible). Two one-line text fields: "What worked this week?" and "What do I change?". Shows last Sunday's note first, plus honest numbers for the week (gym sessions, DSA/AIML minimums met, tasks done).

## Screen 2: Quick Add Task (bottom sheet, opens from + Work)
Optional (when AI is enabled): a "Describe it in a sentence" box with a **Parse** button at the top that pre-fills the fields below. The user always reviews and confirms. See `11_AI_QUICK_ADD.md`.

Fields (in this order, big and thumb-friendly):
1. Title (autofocus)
2. Duration: chips `30m 1h 2h 3h` + custom
3. Deadline: chips `Today` `Tomorrow` `Pick date/time` `None`
4. Importance: segmented `Low | Normal | High | Urgent`
5. Toggle: "Must happen at a specific time" (shows time picker)
6. Toggle: "Can be split across days"
- Primary button: **Add and re-plan**.
- On submit: close sheet, run `replan`, show **Change Summary** toast with "View details".

## Screen 3: Change Summary (sheet)
Shows the plain-English diff lines from the engine (see `03_SCHEDULING_RULES.md` section 7), with an **Undo** button (reverts the last change set).

## Screen 4: Conflict Dialog
- Title: "This doesn't fully fit today".
- Short explanation, then 2 to 3 option cards (one tap each). Example:
  - "Do 1h now, 1h tomorrow morning"
  - "Move AIML to tomorrow (Gym and DSA stay)"
  - "Extend today until 23:15"
- Always include **"Keep as is and decide later"**.

## Screen 5: Mode Switcher (sheet)
Cards:
- 🏖 **Holiday** (no college today)
- ⏱ **College changed** (start/end time pickers)
- 🤒 **Low energy / sick**
- 📚 **Exam / crunch**
- **Back to normal**
- Date picker at top: apply to **today** (default) or a **future date**.
After choosing, re-plan immediately and show the Change Summary.

## Screen 6: Week
- 7 columns (Mon to Sun) as compact timelines or a summary grid.
- Tick grid below: rows Gym/DSA/AIML, columns days. Tap to toggle done.
- Badges for days with non-normal modes (holiday etc.).

## Screen 7: Tasks
- Sections: **Due today**, **Upcoming**, **No deadline**, **Done**.
- Each row: title, duration, deadline, importance badge, quick complete checkbox.

## Screen 8: Tracker
- Month heatmap like `references/ref-1`: round day cells (filled = minimum met, ring = rest day, empty = missed, highlighter ring = today), tally-mark streaks per habit, the 21-day challenge phases as a thin labelled bar, and "never miss twice" status (shield).

## Screen 9: Settings
- Wake/sleep, travel times, habit full/min durations, preferred times.
- Template editor (list of blocks with time pickers).
- Export/Import JSON, reset data, notification toggle.
- **AI (optional):** enable toggle, Gemini API key field (masked, stored locally only), model name field, privacy note.

## Interaction principles
- **Never surprise me.** Every automatic change must be visible and explainable, with Undo.
- **Fast.** Quick add should be doable in under 10 seconds.
- **Gentle on failure.** Missed blocks show a neutral "Move to later" option, not guilt messaging.
- **Empty states** guide the next action (e.g. "No tasks. Add work when it comes up.").

## Accessibility
- Labels on all icons, focus order logical, `aria-live` for change summaries, minimum contrast AA.
