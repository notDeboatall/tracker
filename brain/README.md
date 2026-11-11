# BRAIN: Adaptive Day Planner

This folder is the single source of truth for the project. **Read this file first, then the files in order.**

## One-line summary
A personal web app (mobile-first PWA) that holds my normal weekly routine and **automatically re-plans the rest of today** the moment I add urgent work, declare a holiday, or tell it my day changed, while always protecting my priorities: **Gym, Java DSA course, AIML Python course**.

## File index (read in this order)
| File | Purpose |
|---|---|
| `00_PROJECT_OVERVIEW.md` | Why this exists, goals, non-goals, success criteria |
| `01_USER_PROFILE.md` | My real routine, constraints, priorities, seed data |
| `02_REQUIREMENTS.md` | Features and user stories with acceptance criteria |
| `03_SCHEDULING_RULES.md` | The re-planning algorithm and priority rules (the heart of the app) |
| `04_TECH_STACK_AND_ARCHITECTURE.md` | Stack, folder structure, module boundaries |
| `05_DATA_MODEL.md` | TypeScript types and storage schema |
| `06_UI_UX_SPEC.md` | Screens, components, interactions |
| `07_SCENARIOS_AND_TESTS.md` | Concrete scenarios the engine must pass |
| `08_BUILD_PLAN.md` | Phased milestones with definition of done |
| `09_AGENT_RULES.md` | Coding rules and guardrails for the AI agent |
| `10_PROMPTS.md` | Copy-paste prompts for each build phase |
| `12_DESIGN_SYSTEM.md` | UI style (Paper & Ink): personal, anti-generic design, plus `references/` screenshots |
| `11_AI_QUICK_ADD.md` | Optional Gemini-powered sentence-to-task parser (Phase 9) |

## How to use with Antigravity
1. Create a new empty project folder and put this `brain/` folder inside it.
2. Open the project in Antigravity.
3. Paste the **Kickoff prompt** from `10_PROMPTS.md`.
4. Build **one phase at a time** from `08_BUILD_PLAN.md`. Do not skip ahead.
5. After each phase, run the app and the tests before starting the next one.
6. If the agent's behaviour drifts from these docs, the docs win. Update the docs first, then the code.

## Golden rules (short version)
- The scheduling engine is **pure functions + unit tests**, with no UI code inside it.
- Local-first: all data stays in the browser. No backend in v1.
- AI is optional and only drafts tasks (Gemini free tier). It never edits the schedule; the rule-based engine does.
- Every re-plan must **explain itself** ("Moved DSA to 9:30 pm because Assignment (2h) was added").
- Never silently delete a habit block. Shrink, move, or ask.
