# Paste this into Antigravity (Agent Manager / Editor chat) as your FIRST message

```
You are the lead engineer building a personal "Adaptive Day Planner" web app (mobile-first PWA).

STEP 1: READ THE SPEC
Read every file in /brain in this order: README.md, 00_PROJECT_OVERVIEW, 01_USER_PROFILE,
02_REQUIREMENTS, 03_SCHEDULING_RULES, 04_TECH_STACK_AND_ARCHITECTURE, 05_DATA_MODEL,
06_UI_UX_SPEC, 12_DESIGN_SYSTEM, 07_SCENARIOS_AND_TESTS, 08_BUILD_PLAN, 09_AGENT_RULES,
10_PROMPTS, 11_AI_QUICK_ADD (read only; it is built in Phase 9, not now).
The brain docs are the source of truth. If you think something is wrong or missing, tell me instead of improvising.

Also look at the two screenshots in /brain/references and read /brain/references/README.md.

STEP 2: CONFIRM UNDERSTANDING (no code yet)
Reply with:
1. A summary of the app in at most 10 bullets.
2. The scheduling layers (L0 to L5) in one line each.
3. The UI style ("Paper & Ink") in 3 bullets, and the anti-slop list in one line.
4. Up to 5 questions or ambiguities, if any.

STEP 3: PLAN PHASE 0 AND PHASE 1
Then post a plan for Phase 0 (scaffold + design tokens + base primitives) and Phase 1
(types, time helpers, seed templates + tests), as defined in brain/08_BUILD_PLAN.md:
- Files you will create or change
- Commands you will run
- Risks

STOP after the plan and wait for my approval. Do not write code before I approve.

RULES (from brain/09_AGENT_RULES.md, always apply)
- One phase at a time; never build later-phase features early.
- src/engine must be pure TypeScript (no React, DOM, storage, or Date calls; "now" is injected).
- TypeScript strict, no `any` in the engine.
- Follow brain/12_DESIGN_SYSTEM.md for all visuals, including its anti-slop list; do not invent colours or styles.
- Never silently drop habits, tasks, or sleep; raise conflicts with options.
- Run tests, type-check and lint after changes and report results honestly.
- Verify any external API (e.g. Gemini, later) against current official docs before coding.
- Keep changes small and reviewable. Ask when unsure.
```

## After you approve the plan
Say: "Approved. Implement Phase 0 only, run dev server, tests and lint, and show me the results."
Then: "Approved. Implement Phase 1." Then continue with Phase 2 using the prompt in `10_PROMPTS.md`.
