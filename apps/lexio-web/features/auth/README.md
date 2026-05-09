# auth feature

## Scope

Handles user identity: sign-in (magic-link/OTP), sign-out, session hydration, and role-based access guards.

## Layers owned

- `components/` — SignInForm, AuthGuard wrapper
- `hooks/` — useCurrentUser, useSignIn, useSignOut
- `services/` — TanStack Query wrappers over IAuthService port
- `store/` — Zustand auth slice (userId, role, hydrated flag)
- `types/` — feature-local TS types (not exported to other features)

## Public API

Import exclusively from `features/auth` (the barrel). Internal paths are private.

## Dependencies

- `core/ports/auth-service` (IAuthService)
- `core/entities/user` (User, Role)
- `shared/components/ui/*`
