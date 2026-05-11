# Planit Architecture

```mermaid
flowchart TD
  U[Founder enters spend data] --> F[Spend Form + Validation]
  F --> A[/api/audit]
  A --> P[Pricing Engine pricingConfig.ts]
  A --> R[(Upstash Redis)]
  P --> AR[Audit Result JSON]
  AR --> S[/api/summary]
  S --> G[Gemini]
  S --> R
  AR --> DB[(Supabase audits + audit_tools)]
  L[Lead Form] --> LE[/api/leads]
  LE --> DB
  DB --> SH[Public share page by slug]
```

## Data flow
1. User submits multi-tool spend input.
2. `/api/audit` checks Redis by `audit:pricingVersion:auditHash`.
3. Cache miss runs deterministic audit engine using pricing mirror from `PRICING_DATA.md`.
4. Audit result persists in Supabase (`audits`, `audit_tools`) and returns to UI.
5. `/api/summary` generates Gemini explanation; cached by `summary:pricingVersion:auditHash`.
6. Lead form posts to `/api/leads` and stores in `users_leads` regardless of email provider.
7. Share page renders by `public_slug` with no private lead fields.

## Stack choices
- Next.js app router for product + API surfaces.
- Supabase for transactional data and RLS.
- Upstash Redis for cost and latency control.
- Gemini for narrative layer only (not financial truth).
- TypeScript + vitest for deterministic audit testing.

## Supabase integration notes
- Existing tables used: `audits`, `audit_tools`, `users_leads`, `pricing_snapshots`, `ai_logs`, `share_events`, `rate_limits`, `email_events`.
- Public routes insert audits/tools/leads; sensitive writes and admin reads must use server-only service role key.
- RLS recommendation: tighten `audits` select policy to slug-scoped public records only and keep lead tables unreadable to anon.
- `SUPABASE_SERVICE_ROLE_KEY` must never appear in client bundles or public env vars.

## 10k audits/day upgrades
- Add queue-backed async summary generation (Edge Queue / server worker).
- Add regional Redis and read replicas.
- Add stricter IP/device fingerprint rate limiting + WAF.
- Batch write audit events and use partitioning for `share_events`.
- Add materialized metrics views for cohort and funnel analytics.
