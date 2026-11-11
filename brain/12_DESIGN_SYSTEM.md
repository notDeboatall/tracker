# 12. Design System: "Paper & Ink"

## Style in one line
A **personal paper planner on your phone**: warm paper background, ink-black actions, a single highlighter-yellow marker, muted pastel blocks that each *mean* something, monospaced times like a timetable, and copy that sounds like a person, not a product.

References: see `brain/references/` (and its README for exactly what to take and what to leave).

## What this app must NOT look like (anti-"AI slop" list)
The agent must treat these as hard no's:
- No purple/indigo gradients, no glow, no glassmorphism, no blurred backdrops.
- No emoji in the UI (use real icons or text). No flame emoji for streaks (see tally marks below).
- No "Welcome back! 👋", "Great job!", "Let's crush it", "Schedule optimised!" or any cheerleader copy.
- No centred-everything layouts, no identical rows of icon + heading + paragraph.
- No stock illustrations, no sparkline/squiggle decoration, no fake charts that carry no data.
- No default Inter/Roboto + indigo + rounded-2xl-on-everything combination.
- No lorem ipsum, no placeholder names like "John Doe" or "User".
- Every colour, number, and label on screen must carry real information from the user's data.

If a design choice feels like the default output of a UI generator, change it.

## Personality
- **Left-aligned and editorial.** Big date numeral, small caps labels, hairline rules like a diary page.
- **Quiet.** Paper-tone background, almost no shadows, colour only where it means something.
- **Dry and direct.** Writes like a friend who's slightly blunt, never like a coach.
- **Mine.** The user's own name, own words, own goal appear on the main screen (see "Personal layer").

## Libraries
- Tailwind CSS with the tokens below as CSS variables (dark mode = variable swap)
- **Radix UI** primitives, **vaul** bottom sheets, **lucide-react** icons, **framer-motion** (small transitions only; honour `prefers-reduced-motion`)
- Fonts, self-hosted for offline use (verify package names on npm before installing):
  - Display/headings: **Bricolage Grotesque** (`@fontsource-variable/bricolage-grotesque`)
  - Body/UI: **Instrument Sans** (`@fontsource-variable/instrument-sans`)
  - Times, durations, numbers in tables: **IBM Plex Mono** (`@fontsource/ibm-plex-mono`)
  - Fallbacks: `system-ui`, `ui-monospace`

## Colour tokens (CSS variables)
| Token | Light | Dark | Use |
|---|---|---|---|
| `--paper` | #F5F2EA | #141412 | App background |
| `--surface` | #FFFDF8 | #1C1C19 | Cards, sheets |
| `--surface-2` | #ECE8DD | #262622 | Inputs, subtle fills |
| `--line` | #DDD8CA | #34342E | Hairlines |
| `--ink` | #17181A | #F1EEE6 | Text, primary buttons (black pill), tab bar "+" |
| `--ink-muted` | #6A665C | #A09B8E | Secondary text |
| `--hi` | #DDEB5A | #D6E655 | **Highlighter**: now-marker, selected state, "today" ring. Use sparingly. |
| `--danger` | #C8412F | #F0705F | Conflicts that lose data, destructive actions |
| `--success` | #2E7D52 | #4BC083 | Done check |

Primary buttons are **ink black with paper-coloured text** (like the black "+" in reference 2). The highlighter is never used as text colour (low contrast); only as a fill behind ink text.

### Block colours (muted pastel tint + strong ink-tone, always icon + label)
| Block | Tint | Strong (text/edge) | Icon |
|---|---|---|---|
| Gym | #FADBD0 | #A8391F | `Dumbbell` |
| Java DSA | #D6E6F5 | #234F85 | `Code2` |
| AIML Python | #D8EBD0 | #2D6A35 | `BrainCircuit` |
| Task (normal/high) | #E6DCF3 | #5A3A8C | `SquareCheck` |
| Task (urgent) | #F8E0A8 | #8A5200 | `AlarmClock` |
| Fixed (college, sleep) | #E4E1D8 | #5B584E | `Lock` |
| Ride (bike) | #E4E1D8 | #5B584E | `Bike` |
| Routine (meals, wake) | none, ink-muted text | | `Coffee` |
| Free time | **dashed outline, no fill** | `--ink-muted` | none |
Dark mode: tint = strong colour at ~20% over `--surface`; lighten strong colours until text meets contrast. **Agent must check WCAG AA (4.5:1) for every text/background pair.**

## Typography
- Date numeral on Today: Bricolage 56/56 semibold, tight tracking.
- Page title 24/28 semibold (Bricolage); section label 12/16 uppercase, +0.06em tracking, `--ink-muted` (Instrument Sans medium).
- Body 15/22 (Instrument Sans). Caption 12/16.
- **All times and durations in IBM Plex Mono** (`06:30`, `90m`) so columns line up like a timetable.

## Shape, spacing, depth
- 4 px base grid. Screen padding 20 px (left-aligned content, not centred).
- Radius: cards 14, chips/pills full, inputs 10, sheets 22 (top corners only). Not everything is a big rounded card: **timeline rows are flat strips with a 4 px coloured left edge** separated by hairlines.
- Depth: no shadows on cards (1 px `--line` border only). Sheets get a soft shadow + dim backdrop. Nothing else floats.
- Max content width 600 px, left-aligned on desktop.

## Navigation
Bottom bar, 5 slots: **Today | Week | [ + ] | Tasks | Tracker**. The centre **+** is a 52 px ink-black circle that opens Quick Add (reference 2). Settings opens from the gear in the Today header.

## Timeline rules
- Scale 1.1 px/min, min row height 32 px.
- Left gutter: hour labels in mono, muted. Hairline per hour like diary rules.
- Each row: coloured left edge, tinted fill, icon, title, mono time range. Fixed/ride rows are quiet; habit and task rows carry the colour.
- **Now marker:** 2 px ink line across, with a small `--hi` highlighter dot and the current time in mono. Auto-scrolls into view.
- Past rows 55% opacity. Done = check. Skipped = struck-through title + "skipped" label.
- Badges: `MIN` (habit at minimum size), shield icon (protected by "never miss twice"), `PINNED`.
- When a re-plan moves a block, flash a `--hi` highlight behind it for ~1.2 s then fade. This is the *only* place the highlighter animates.

## Streaks: tally marks, not flames
- Streak count is shown as **hand-drawn-style tally marks** (four strokes + a diagonal for five) in `--ink`, with the number beside it in mono.
- On Today: three small tiles (Gym, DSA, AIML) in the block tints, big mono number, tally marks below, as in reference 2's overview tiles but meaningful.
- Tracker: month heatmap like reference 1: round day cells; filled = met minimum, ring = rest day (Sunday gym), empty = missed, `--hi` ring = today. Show the 21-day challenge phases (Show up / Full schedule / Lock in) as a thin labelled bar above it.

## Personal layer (this is what makes it mine)
Stored locally in a `Profile` (see `05_DATA_MODEL.md`), set in a short onboarding and editable in Settings:
1. **Name.** Today header reads "Morning, Rahul." / "Afternoon, Rahul." / "Late one, Rahul." depending on time. If no name, it shows nothing rather than "User".
2. **One line, in my words.** A "why" sentence the user writes (e.g. "Placements by next summer. Gym is non-negotiable."). Shown small under the date on Today, and on the Sunday review.
3. **Day label from my real routine**, derived from the template, not generic: "Gym day, college afternoon", "College morning, gym at 16:10", "Holiday", "Sunday: catch-up".
4. **Bike awareness.** Ride blocks show a bike icon and "ride, 25 min".
5. **Weekly note.** On Sunday the review screen asks two things: "What worked this week?" and "What do I change?" (free text, one or two lines each). The last note is shown next Sunday so I see my own words.
6. **Accent pick.** User can pick the highlighter from 4 curated colours (lime, sky, peach, lilac). Default lime.
7. **Honest numbers.** Show real counts ("Gym 5 of 6 this week", "DSA minimum met 4 days") not praise.

## Copy voice
Plain, short, a little dry. No exclamation marks, no emoji, no coach-speak. Examples:
| Situation | Say | Don't say |
|---|---|---|
| Task added, plan changed | "Added. DSA cut to 45m. AIML moved to 20:30." | "Schedule optimised! ✨" |
| Holiday set | "No college today. Gym at 07:30, rest of the day is open." | "Enjoy your day off! 🎉" |
| Missed gym yesterday | "Gym is protected today. Minimum 30m, no moving it." | "Don't give up! You've got this!" |
| Can't fit everything | "This doesn't fit before 22:30. Pick one." | "Oops! Something went wrong." |
| Empty tasks | "Nothing pending." | "You're all caught up! 🚀" |
| Block skipped | "Skipped. Move it to later?" | "Streak lost 😢" |
| After 21 days | "21 days. Gym 18, DSA 19, AIML 17. Keep or change the plan?" | "Congratulations, champion!" |

## Core components
- **Black pill button** (primary), **outlined pill** (secondary), text button (tertiary).
- **Segmented control** for importance (Low | Normal | High | Urgent), selected = ink fill.
- **Chips** for duration and deadline presets; selected = `--hi` fill with ink text.
- **Bottom sheet** (vaul), drag handle, 22 radius.
- **Change summary toast** above the tab bar: mono timestamps, "Undo" and "Details", 6 s.
- **Conflict sheet:** outlined option rows, neutral tone, red only if data would be lost.
- **Streak tile**, **tally mark** component, **heatmap cell**.
- **Round check** on the right of rows (like references) for Done; long-press for Partial/Skip.

## Motion
150 to 220 ms ease-out. Sheets slide, toasts fade. No looping animation, no parallax, no confetti. Reduced-motion: no highlights, instant transitions.

## Accessibility
Icon + text always (never colour alone). 2 px ink focus ring with offset. Touch targets >= 44 px. `aria-live="polite"` on the change summary. Use rem so system text size works.

## Build order for the agent
1. Tokens (CSS variables, Tailwind config, fonts, dark mode) and verify contrast.
2. Primitives: `Button`, `Chip`, `Segmented`, `Sheet`, `Toast`, `RoundCheck`.
3. Domain components: `BlockRow`, `NowMarker`, `TallyMarks`, `StreakTile`, `HeatmapCell`.
4. Screens.
Do not add new colours or fonts without updating this file first.
