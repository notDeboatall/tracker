# 11. AI Quick Add (Gemini, optional, Phase 9)

## Purpose
Let me type one natural sentence and get a pre-filled task, e.g.:
- "3h DSA assignment due tomorrow 6pm"
- "college cancelled today"
- "lab record submission friday 10am, 2 hours, urgent"

The AI **only converts text into a structured draft**. It never edits the schedule directly. The deterministic engine (`03_SCHEDULING_RULES.md`) still does all planning.

## Provider
- **Google Gemini API (free tier via Google AI Studio)**, REST call from the browser.
- Use a **Flash-Lite** class model for speed and generous free limits. The model name is a **setting** (default can be changed), because model names change. The agent must **verify the current model name and request format at https://ai.google.dev/gemini-api/docs** before coding.
- Free-tier per-model limits are visible per project in the Google AI Studio console; the app must not assume specific numbers.

## API key handling (important)
- v1 is a browser-only app, so **never hardcode a key in source code or commit it**.
- Settings has an **"AI key"** field. The user pastes their own Gemini key; it is stored **only in this browser** (IndexedDB/localStorage), never exported in the JSON backup, never logged.
- UI note beside the field: "Your key stays on this device. Free-tier requests may be used by Google to improve its products, so don't type sensitive info."
- If the app is ever shared with others, move the call behind a small serverless proxy that holds the key. (Out of scope for now; keep the call in one module, `src/ai/geminiClient.ts`, so it is easy to swap.)

## Behaviour
1. A text box at the top of Quick Add: "Describe it in a sentence" + **Parse** button. The normal form is always visible below and always works.
2. On Parse: send the text plus the context below to Gemini, request **JSON only**, validate the response.
3. Fill the form fields with the result. **The user must review and tap "Add and re-plan".** Nothing auto-saves.
4. If the AI is unavailable (no key, offline, 429 rate limit, timeout, invalid JSON), show a short friendly message and leave the form for manual entry. Never block the user.
5. Rate-limit handling: on HTTP 429, show "AI limit reached, use the form", and don't retry more than once (exponential backoff with jitter). Add a simple client-side cooldown (e.g. at most 1 parse per 5 seconds).

## Context sent with each request
Send only what's needed (keep it small and non-sensitive):
- Today's date, weekday, and current local time (Asia/Kolkata)
- The user's text

Do **not** send the full schedule, habit logs, or other personal data.

## Output contract (JSON only)
The model must return exactly one object of this shape:

```json
{
  "intent": "add_task | set_mode | unknown",
  "task": {
    "title": "string",
    "durationMin": 180,
    "deadline": "2026-11-12T18:00",
    "importance": "low | normal | high | urgent",
    "fixedStart": null,
    "splittable": true
  },
  "mode": {
    "type": "holiday | partial | low_energy | crunch | normal",
    "date": "2026-11-11",
    "collegeStart": null,
    "collegeEnd": null
  },
  "confidence": 0.0,
  "clarification": "string or null"
}
```
Rules:
- Use the model's **structured output / JSON mode** (response MIME type JSON plus a response schema) if available; still validate defensively.
- `task` is present only when `intent = add_task`; `mode` only when `intent = set_mode`.
- Dates must be resolved relative to the injected "today" and "now". If something is ambiguous (no duration, no deadline), set `null` and put a short question in `clarification` rather than guessing wildly.
- Default `importance = normal` unless the text implies urgency ("urgent", "asap", "due today").
- Default `durationMin`: leave `null` if unknown; the form then asks the user.

## Validation (in code, not in the prompt)
- Parse JSON in a try/catch; strip code fences if the model adds them.
- Validate with a schema (e.g. Zod) against the `Task` / `DayConfig` types in `05_DATA_MODEL.md`.
- Reject: duration <= 0 or > 720 min, deadline in the past, unknown fields that break the schema.
- On failure: treat as "unknown" and fall back to the form.

## System prompt for the model (starting point)
```
You convert a student's short message into a JSON object for a day-planner app.
Output ONLY valid JSON matching the schema. No prose, no markdown.
Today is {{DATE}} ({{WEEKDAY}}), current time is {{TIME}} (Asia/Kolkata).
Resolve relative dates (today, tomorrow, Friday) from this.
intent is "add_task" for work to do, "set_mode" for day changes like holiday or college cancelled
or sick or exam crunch, otherwise "unknown".
Durations are in minutes. If a value is not stated, use null. If unclear, put one short question in "clarification".
importance is "urgent" only if the text says urgent/asap/due today; otherwise "normal".
```

## Mapping to app actions
| AI intent | App action |
|---|---|
| `add_task` | Pre-fill Quick Add form, user confirms, then `store.addTask` and `replan` |
| `set_mode` | Pre-select the mode in the Mode Switcher, user confirms, then `store.setDayConfig` and `replan` |
| `unknown` | Show the clarification (if any) and keep the manual form |

## Tests
- Unit tests for the validator with good, malformed, fenced, and hostile outputs.
- Mock `fetch`; test: success, 429, timeout, invalid JSON, missing key, offline.
- A test that confirms **no auto-save** happens without user confirmation.
- A test that confirms the key never appears in the exported JSON.

## Optional later ideas
- Voice input via the browser speech API feeding the same parser.
- "Explain my day" button that asks the model to summarise the plan text (read-only, no changes).
