# Onboarding page overrides

Inherits `MASTER.md`. Deviations:

## Layout

- Max width 520px form column; optional illustration column ≥1024px (future)
- Sticky top nav with NINA logo

## Steps

1. **Your store** — name, URL, email → `POST /v1/wizard/init`
2. **AI setup** — auto-generate OR upload contract OR skip
3. **Install** — embed snippet, API key, dashboard token (show once)

## Hint elements

- `StepProgress` always visible during wizard
- `JourneyRail` below hero on step 1; compact in header on steps 2–3
- `ContextCard` on each step explaining purpose
- Inline probe status on generate (spinner → success/error)

## Persistence

- `sessionStorage` key `nina_onboarding` for siteId, keys, org (tab session)
