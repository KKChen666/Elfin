---
name: elfin-code-review-and-hardening
description: Use this skill when reviewing Elfin code for bugs, broken flows, security issues, missing user ownership filters, routing mistakes, data leaks, or validation gaps.
---

# Elfin Code Review And Hardening

Use this skill for review, debugging, and hardening tasks.

## Review Priorities

1. Security and privacy: secrets, API keys, auth, ownership filters.
2. Broken flows: frontend API paths, backend route order, response shape mismatch.
3. Data integrity: cascade behavior, archive vs delete, schema/model mismatches.
4. Runtime failures: async generator DB sessions, missing dependencies, import errors.
5. User experience: silent failures, stale UI, confusing empty states.
6. Validation: TypeScript, ESLint, Python syntax, health endpoint.

## Backend Checklist

- Every user-owned entity query includes `user_id == current_user.id`.
- Response models do not leak internal fields such as `password_hash` or encrypted API keys.
- Dynamic routes do not shadow static routes.
- SQLAlchemy model changes are reflected in startup migration or Alembic.
- Streaming endpoints handle errors without leaving partial DB state when practical.
- `SECRET_KEY` changes are treated as breaking encrypted LLM key decryption.

## Frontend Checklist

- API clients match backend routes and response shapes.
- Authenticated calls include token via `client` or explicit headers for streaming fetch.
- Long-running operations show enough state to avoid "nothing happened" confusion.
- Conversation sidebar refreshes after chat mutations.
- Forms do not persist secrets in browser storage.
- `npm run check` and `npm run lint` pass.

## Findings Format

When reporting a review, lead with findings:

- Severity and file reference.
- Concrete user-visible or runtime impact.
- Suggested fix.

Then include validation results and residual risks.

