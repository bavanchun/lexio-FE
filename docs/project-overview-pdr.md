# Product overview — Lexio PDR

> Distilled from doc §1–§3. Source of truth: `../docs/Lexio_Complete_Documentation.docx` (parent monorepo umbrella).

## Vision

Lexio is an enterprise-grade vocabulary learning platform for IT/Tech professionals, combining SM-2 spaced repetition with gamification and AI-driven content generation. The goal: help practitioners master domain-specific English vocabulary efficiently, with measurable retention outcomes, across web and mobile.

## Primary user persona

| Attribute          | Detail                                                                                       |
| ------------------ | -------------------------------------------------------------------------------------------- |
| **Name**           | Nam / Linh (representative)                                                                  |
| **Role**           | Vietnamese software engineer, 2–5 years experience                                           |
| **Goal**           | Master English IT/Tech vocabulary for professional communication, interviews, documentation  |
| **Pain point**     | Generic vocabulary apps lack domain-specific content; passive reading doesn't stick          |
| **Device**         | MacBook (work) + Android/iPhone (commute)                                                    |
| **Session length** | 5–15 min daily, mobile-first during commute                                                  |
| **Motivation**     | Career advancement, reading technical docs without lookups, international team communication |

## Scope

### In scope (v0.1 prototype through v0.6)

- SM-2 spaced repetition flashcard system (doc §4)
- IT/Tech vocabulary deck library, seeded + user-created
- Gamification: streak, XP, levels, achievements (doc §5)
- PWA: installable, offline study, web push reminders
- Dashboard: due count, heatmap, streak, XP
- Multi-exercise types: flashcard, type-in, listening, multiple choice (v0.6)
- User authentication: email/password + Google/GitHub OAuth (v0.2)
- Vietnamese locale (v0.6)
- Social: follows, shared decks, leaderboards (v0.6)
- AI content generation: card suggestions, pronunciation feedback (Phase 2)
- Mobile: React Native iOS + Android (Phase 2)

### Out of scope (explicitly)

- General-purpose (non-IT) vocabulary domains in v0.1
- Payment processing in v0.1–v0.3
- Native desktop app
- Offline-first sync conflict resolution (v0.1 uses local-only IndexedDB)
- Enterprise SSO / SAML
- Classroom / teacher management features
- Public API for third-party integrations

## Success metrics (doc §2.6)

| Metric                    | Target                     | Measurement                        |
| ------------------------- | -------------------------- | ---------------------------------- |
| Day-7 retention           | ≥40%                       | Users returning after 7 days       |
| Daily active users (DAU)  | Growth MoM                 | Analytics                          |
| Average session length    | ≥8 min                     | Session duration tracking          |
| Study streak ≥7 days      | ≥25% of active users       | Gamification data                  |
| Lighthouse Perf score     | ≥95                        | Lighthouse CI per PR               |
| Initial route JS          | ≤200 KB gzip               | Bundle size CI gate                |
| SM-2 scheduling accuracy  | ≥95% branch coverage       | Vitest coverage                    |
| App crash rate            | <0.1%                      | Error monitoring (Sentry, Phase 2) |
| Card retention at 30 days | ≥80% correct recall        | Review history analysis            |
| NPS                       | ≥50 at 90 days post-launch | In-app survey                      |
