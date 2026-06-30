# NINA Web — Design System (Master)

> Source of truth for `nina-web` (Next.js). Widget (`Nina-AI/sdk`) uses separate WhatsApp UX.

## Product

B2B AI chatbot control plane for Indian merchants. Light surfaces for merchant flows; dark variant for admin (later).

## Tokens

| Token | Value | Use |
|-------|-------|-----|
| Primary | `#5b8cff` | CTAs, active step, links |
| Primary hover | `#3a6bde` | Button hover |
| Success | `#1aab6d` | Live, done steps |
| Warning | `#d97706` | Incomplete setup |
| Error | `#e0344b` | Failures |
| Background | `#f4f6fb` | Page bg |
| Card | `#ffffff` | Panels |
| Border | `#e2e8f4` | Dividers |
| Text | `#1a1e2e` | Body |
| Muted | `#6b7594` | Hints |

## Typography

- **Font:** Geist Sans (bundled with Next)
- Page title: 1.5–2rem / 800
- Section: 1.1rem / 700
- Body: 0.875–1rem / 400
- Caption: 0.75rem / 500 muted

## Components

- `StepProgress` — segmented onboarding bar
- `JourneyRail` — Store → Contract → Key → Live
- `ContextCard` — what / what-next hints
- `StatusChip` — Live, Setup, Plan badges
- shadcn: Button, Card, Input, Label, Alert, Badge, Progress, Textarea

## Motion

150–250ms ease; respect `prefers-reduced-motion`.

## Checklist (every PR)

- [ ] SVG icons (lucide), not emoji as UI icons
- [ ] Focus rings on interactive elements
- [ ] 4.5:1 text contrast on light bg
- [ ] Responsive: 375px, 768px, 1024px
- [ ] One primary CTA per step
- [ ] Empty states have action

## Anti-patterns

- AI purple gradients
- Neumorphic inset buttons on forms
- Merchant name in console chrome (use org badge only)
