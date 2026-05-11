# Complete Credex AI Spend Audit Operating System — Planit Product, Docs, Database, Pricing File, Env Architecture, Redis, Supabase, Gemini, Lead Capture, and Growth

Planit is a finance-grade AI spend auditor for startup founders, CTOs, and engineering managers who want to cut AI tooling waste fast. It combines a pricing-backed audit engine, personalized Gemini narrative, and Supabase-native lead capture to create both immediate user value and qualified pipeline for Credex. The current repo is production blueprint + runnable core engine/tests, designed for Product Hunt launch readiness.

## Screens / Demo
- Screenshot 1 (Landing): `ss1`
- Screenshot 2 (Spend Input): `ss2`
- Screenshot 3 (Results Dashboard): `ss3`


## Quick start
```bash
npm install
npm test
```

For full app wiring (Next.js pages + API routes + Supabase project), set `.env.local` values from `.env.example`, then deploy via Vercel with the same env keys.

## Decisions (Trade-offs)
1. Supabase-only lead persistence first, transactional email deferred: protects reliability without paid email vendor dependency.
2. Pricing mirrored in typed TS (`pricing/pricingConfig.ts`) from `PRICING_DATA.md`: faster lookup and deterministic testability vs runtime markdown parsing complexity.
3. Redis caching for audits + summaries: lower Gemini/API cost at expense of cache invalidation complexity.
4. Deterministic audit core + optional LLM summary: keeps financial logic explainable and testable.
5. Service-role usage only in server handlers: stricter security model but requires careful route boundaries.

## Environment model
Copy `.env.example` to `.env.local`.

| Variable | Purpose | Scope |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Client-safe |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Public anon key for browser Supabase calls | Client-safe |
| `SUPABASE_SERVICE_ROLE_KEY` | Admin DB writes and protected operations | Server-only |
| `UPSTASH_REDIS_REST_URL` | Redis REST endpoint | Server-only |
| `UPSTASH_REDIS_REST_TOKEN` | Redis auth token | Server-only |
| `GEMINI_API_KEY` | Gemini model access for summaries | Server-only |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per rate window | Server-only |
| `RATE_LIMIT_WINDOW_SECONDS` | Window duration | Server-only |

- Client-safe (`NEXT_PUBLIC_*`):
  - `NEXT_PUBLIC_SUPABASE_URL`
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- Server-only (never expose in client bundles):
  - `SUPABASE_SERVICE_ROLE_KEY`
  - `UPSTASH_REDIS_REST_TOKEN`
  - `GEMINI_API_KEY`

Security notes:
- Never prefix server secrets with `NEXT_PUBLIC_`.
- Keep `SUPABASE_SERVICE_ROLE_KEY` only in server runtime env.
- Rotate secrets quarterly or on exposure suspicion; revoke old keys immediately.
- In Vercel: set variables per environment (Development/Preview/Production), disable plaintext sharing in logs.

## Vercel deployment
1. Import repo into Vercel.
2. Add all variables from `.env.example` in Project Settings -> Environment Variables.
3. Ensure `SUPABASE_SERVICE_ROLE_KEY`, `GEMINI_API_KEY`, and `UPSTASH_REDIS_REST_TOKEN` are only server-side envs.
4. Deploy preview, run smoke test on `/api/audit`, `/api/summary`, and `/api/leads`.
5. Promote to production after CI green checks.

## Pricing source-of-truth flow
1. Update `PRICING_DATA.md` from official vendor pages.
2. Mirror into `pricing/pricingConfig.ts` and bump `PRICING_VERSION`.
3. `getPricingVersion()` hash changes automatically.
4. Redis keys include version (`audit:pricingVersion:auditHash`), so stale pricing cache is bypassed automatically.

## No Resend dependency
- Lead capture is preserved via Supabase insert (`app/api/leads/route.ts`).
- Confirmation emails are explicitly deferred for MVP, with optional future free-tier integrations (Supabase Edge Functions / Firebase triggers / Formspree / Web3Forms / EmailJS).
