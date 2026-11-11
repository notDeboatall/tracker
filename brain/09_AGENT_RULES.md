# 09. Agent Rules (guardrails for the AI coding agent)

> If your Antigravity version supports workspace rules, copy this file's content into a workspace rule so it's always applied.

## Always do
1. **Read `brain/README.md` and the relevant brain files before coding.** The brain docs are the spec; if code and docs disagree, ask me or follow the docs.
2. **Work one phase at a time** as defined in `08_BUILD_PLAN.md`. Do not implement features from later phases.
3. **Plan first:** before writing code, post a short plan (files to create/change, approach, risks).
4. **Test the engine:** every rule in `03_SCHEDULING_RULES.md` must be covered by a test derived from `07_SCENARIOS_AND_TESTS.md`.
5. **Run tests, type-check and lint** after changes and report the results honestly, including failures.
6. **Keep the engine pure:** `src/engine` must not import React, browser APIs, storage, or call `Date.now()`/`new Date()`. `now` is injected.
7. **Explain every plan change** with a human-readable summary line.
8. **Never silently drop** a habit minimum, a task, or sleep. Raise a conflict with concrete options.
9. **Small, reviewable commits/changes.** Prefer many small files with clear names over one giant file.
10. **Verify external APIs against current docs.** For the Gemini API, check https://ai.google.dev/gemini-api/docs for the current model name and request format before writing code; don't rely on memory.
11. **Ask when unsure.** If a rule is ambiguous, ask me instead of inventing behaviour; then update the brain docs with the decision.

## Never do
- Never add a backend, auth, or paid third-party services in v1. (The only allowed external service is the optional Gemini API free tier in Phase 9, called from the browser with the user's own key.)
- Never store data outside the browser in v1.
- Never use `any` in `src/engine`.
- Never hardcode, commit, log, or export an API key. Never let AI output change the schedule directly; it may only pre-fill forms the user confirms.
- Never import anything from `src/ai` into `src/engine`.
- Never hardcode my schedule inside UI components; templates live in `engine/templates.ts` and settings.
- Never rewrite working modules without a reason; minimise diffs.
- Never fake test results or skip failing tests.

## Design
- Follow `12_DESIGN_SYSTEM.md` for every visual decision, including its **anti-slop list** and copy-voice table. If a screen looks like generic UI-generator output (gradients, emoji, centred card grids, cheerleader copy), redo it.
- Use the screenshots in `brain/references/` as mood references only; follow the README there for what to take and leave. Do not invent new colours, fonts, or component styles; extend the design doc first if something is missing.

## Code style
- TypeScript strict; functional style in the engine; descriptive names (`findFreeWindows`, not `ffw`).
- Small pure functions; each exported function has a short doc comment describing inputs/outputs.
- UI: React function components + hooks, Tailwind utility classes, mobile-first.
- File naming: `PascalCase.tsx` for components, `camelCase.ts` for modules.
- Constants (defaults, magic numbers) live in one `engine/constants.ts`.

## Definition of Done (every change)
- [ ] Matches the brain docs
- [ ] Tests added/updated and passing
- [ ] Type-check and lint clean
- [ ] Works at 380 px wide
- [ ] Change is explained in a short summary to me

## When the brain needs updating
If we discover a new rule or edge case, add it to the right brain file (`03`, `07`, etc.) **before** or together with the code change, and say so.
