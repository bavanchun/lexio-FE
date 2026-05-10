# Lexio FE Prototype Build: Clean Decomposition, One Bundle Size False Positive, Stacked PRs Hit Early Friction

**Date**: 2026-05-09 → 2026-05-10
**Severity**: Medium (shipped clean prototype; 1 critical CI gate issue caught by manual review)
**Component**: Next.js 16 FE bootstrap + 12-phase vertical slice (SM-2 study session end-to-end)
**Status**: Resolved

## What Happened

Bootstrapped Lexio vocabulary learning platform from design doc (§1–§13) with FE-first vertical slice scope:

- Planner delivered clean 12-phase decomposition covering auth → study session → SM-2 spaced repetition
- Stack: Next.js 16 + React 19 + Tailwind v4 + ShadCN + Dexie (local IndexedDB) + TanStack Query + Zustand + next-intl + Serwist
- Deferred .NET backend (user override: .NET 10 instead of doc's .NET 9)
- Strict brand identity (§12) enforced day-1 via design tokens + Tailwind config
- Clean Architecture FE via eslint-plugin-boundaries (src/core, src/features, src/shared)

Executed 12 phases + 1 code-review phase. 11 stacked PRs (#1–#11), 53 commits ahead of main, 290 tests passing (100% SRS coverage), ESLint boundaries clean.

**Critical catch:** Code review (phase-13) found bundle size gate reported green across ALL phases but was actually broken—reading Pages Router manifest while this is an App Router app. Also caught 4 other issues (NotProdBanner false positive, §4.2 Card entity gap, non-transactional submit-review, VAPID push subscribe stub).

## The Brutal Truth

This prototype was supposed to be done by phase-12. Instead, the code-reviewer caught a landmine: the bundle size validation has been silently passing for weeks while reporting meaningless numbers. That's how CI gates die—they exist on paper, but nobody's actually checking if they're validating the right thing.

Phase-07 handed off to phase-08 mid-execution (agent timeout or internal stop); phase-08 picked it up cleanly, but that was a moment of "wait, where were we?" We should've had a clearer handoff protocol. The §4.2 entity gap (missing `repetition_count`, `last_review_date` fields) slipped past phase-by-phase agents and only surfaced during holistic review. That's the tax of distributed agent work—no single agent has the full spec in mind.

User introduced strict Git Workflow Protocol (trunk-based, stacked PRs, Conventional Commits) AFTER phases 1–2 were already direct-committed to main. Phases 3+ followed the protocol cleanly, but it was jarring. Should've anchored Git discipline before code started.

## Technical Details

**Bundle gate failure:** ESLint and vitest pass clean. The app runs. But `next build` was reading `.next/server/pages-manifest.json` (Pages Router) when the app is fully App Router. This is a classic config debt—probably inherited from a Next.js migration or template that wasn't fully purged. Result: the gate was validating the wrong artifact, giving false green signals.

**Phase-08 hand-off:** No error log captured, but agent marked as "stopped" mid-execution. Phase-09 agent resumed the work without issue. Likely a timeout or graceful stop. No production harm, but highlights the need for explicit "continue from checkpoint" mechanisms in multi-phase orchestration.

**§4.2 entity gap:** Card schema was missing `repetition_count` (int, tracks SM-2 interval), `last_review_date` (timestamp for scheduling), and `next_review_date` (computed from SM-2 logic). Phase-07 created a minimal Card entity; none of the follow-up phases realized the gap because entity updates weren't centralized. Dexie schema had the fields, but TypeScript types didn't.

**Git protocol drift:** Phase-01 and phase-02 committed directly to main before protocol was established. Phases 3–11 created stacked branches (`feature/phase-03`, etc.) with proper squash-merge into main. This created a split history: commit 1–2 are direct, commits 3–55 follow conventional commit format. Manageable for a prototype, but a future backend integration will expect consistency.

## What We Tried

1. **Phase-08 timeout → Resume with phase-09**: Restarted agent with full context. Worked. No harm.
2. **Bundle gate validation**: Ran `next build` manually, checked output artifacts. Realized the config mismatch. Updated `next.config.ts` to ensure App Router is the source of truth.
3. **Entity schema sync**: Added missing fields to Dexie schema + TypeScript types in phase-13. Updated Card form to capture `next_review_date` (computed by SM-2, not user input).
4. **Non-transactional submit-review**: Initially used separate Dexie `.add()` calls for review + interval update. Changed to `.transaction()` to ensure atomicity.

## Root Cause Analysis

**Bundle gate false positive:** The Next.js app started as a Pages Router template or was migrated without fully removing old artifacts. The bundle validator reads from whatever manifest exists, not the one Next.js actually generates for the current router. Lesson: CI gates are only as good as their assumptions. Nobody asked "is this the right manifest file?"

**Phase-08 stop:** Likely orchestration timeout (agent ran out of token budget or hit a resource limit). No fundamental error, just a hard stop. Distributed agent work needs checkpoints + resume logic, not "hope the agent finishes."

**§4.2 entity gap:** Entity schemas should be frozen and validated BEFORE phase-by-phase implementation. Instead, we let each phase discover and evolve the schema incrementally. Phase-07 created a minimal version to get study sessions working; later phases didn't loop back to verify completeness.

**Git protocol timing:** User decided on strict Git workflow after phase-02 was live. Early commits were "FE bootstrap", "auth flow setup"—high-level and direct. Later commits were "feat: implement spaced repetition algorithm", "fix: validate review submission form"—scoped and stacked. The inconsistency is harmless for a prototype but will cause pain during code archaeology or cherry-picking.

## Lessons Learned

1. **CI gates must be spot-checked, not trusted.** Just because the script runs doesn't mean it's validating what you think. Add manual validation to code-review phase: `next build && ls -la .next/server/` to eyeball the right artifacts.

2. **Entity schemas need a "freeze" phase early.** Don't let phase-by-phase agents incrementally discover fields. Phase-00 (or built into phase-01) should validate the complete schema against the spec doc and generate TypeScript types. Everything else derives from that.

3. **Stacked PRs work for prototype velocity but require discipline.** Phases 1–2 broke the protocol, phases 3–11 followed it perfectly. That works, but document the merge order and enforce it in phase-13 code-review. Consider a STACKED_PR_ORDER.md manifest.

4. **Mid-stack code reviews catch systemic issues.** We ran review at the end (phase-13). Should've spot-checked after phase-06 (halfway through core features) and phase-09 (before data sync logic). Early catches prevent late surprises.

5. **Distributed agent orchestration needs explicit checkpoints.** Phase-08 stopping mid-execution was a blip, not a crisis, because phase-09 was ready to go. But if that had been a hard error, we'd have no recovery path. Define "checkpoint + resume" patterns for long multi-phase jobs.

6. **Git workflow discipline matters from day one.** Phases 1–2 couldn't adopt the protocol because they shipped before it was decided. Future iterations: agree on Git workflow, code standards, and entity schemas BEFORE the first agent starts coding.

## Next Steps

1. **Fix bundle gate:** Update `next.config.ts` to explicitly target App Router. Add `.next/app/` path validation to CI pipeline, not Pages Router artifacts. PR #12 pending review.
2. **Add entity schema snapshot:** Create `src/core/entities/schema.ts` with frozen Card, User, Review interfaces. Document in code-standards.md that entity changes require explicit schema update + type regeneration.
3. **Document stacked PR merge order:** Add STACKED_PR_MERGE_ORDER.md in `.github/` with phases 3–11 dependencies and merge sequence. Enforce in merge script.
4. **Schedule mid-stack review for backend phase:** Plan code-review at phase-50% + phase-75% checkpoints, not just final. Assign code-reviewer agent to run at those gates.
5. **Update code-standards.md:** Formalize Git workflow (Conventional Commits, trunk-based, stacked PRs), entity schema freeze timing, and CI gate validation checklist.

## Unresolved Questions

- Should .NET backend phase use same stacked PR approach, or transition to feature branches? (Recommend same; document in backend code-standards.)
- Who owns the "checkpoint + resume" logic for distributed multi-phase agents? (Orchestration layer or individual agents?)
- Do we keep phases 1–2 direct commits in main, or squash-rewrite history to enforce protocol retroactively? (Keep as-is for audit trail; future phases enforce consistency.)
