# Complete Credex AI Spend Audit Operating System — Planit Product, Docs, Database, Pricing File, Env Architecture, Redis, Supabase, Gemini, Lead Capture, and Growth

Planit is a founder-grade AI spend audit platform for startup teams that want to reduce AI tooling waste without hurting velocity. It combines deterministic pricing math, use-case intelligence, team-fit logic, and optional Gemini quality reasoning to produce actionable plan/vendor/hybrid recommendations with exact monthly and annual savings. It also acts as a Credex lead-generation engine by capturing high-intent users after value delivery.

## Screens / Demo
- Screenshot 1 (Landing): `ss1`
- Screenshot 2 (Spend Input): `ss2`
- Screenshot 3 (Results Dashboard): `ss3`


## Quick start
```bash
npm install
npm run dev
```

For full app wiring (Next.js pages + API routes + Supabase project), set `.env.local` values from `.env.example`, then deploy via Vercel with the same env keys.

## Product purpose
- Help founders answer: Are we overpaying for AI tools, and what should we change now?
- Detect overbuy patterns (for example enterprise plans on tiny teams without compliance needs).
- Recommend same-vendor downgrade, best-vendor alternative, and hybrid stack options.
- Quantify ROI with deterministic savings math from verified pricing sources.
- Convert high-savings audits into qualified Credex advisory/credit leads.

## What users input
- Team context: `team_size`, `primary_use_case`, optional `compliance_required`
- Per-tool rows: `tool`, `vendor`, `plan`, `monthly_spend`, `seats`, `api_spend`, `use_case`
- Multi-tool audit supported with dynamic rows on `/audit`

## What Planit outputs
- Totals: `total_current_spend`, `total_optimized_spend`, `monthly_savings`, `annual_savings`
- Scoring: `optimization_score`, `confidence_score`
- Per-tool recommendations with rationale and savings
- Deep strategy block (`deepAudit`):
  - `current_stack_analysis`
  - `same_vendor_fix`
  - `best_vendor_fix`
  - `best_hybrid_option`
  - `recommendation_type`
  - `reasoning`
- Founder-readable summary from Gemini (cached, with fallback)

## Decision logic (short)
1. Use-case intelligence ranks best-fit tools for coding/writing/research/data/mixed.
2. Plan efficiency layer checks team-size appropriateness, overbuy, and API-vs-seat mix.
3. Recommendation layer computes same-vendor, competitor, and hybrid paths.
4. Scoring layer uses weighted formula:
   - 40% cost efficiency
   - 35% use-case fit
   - 15% team-size appropriateness
   - 10% operational practicality
5. Results are cached in Redis and persisted in Supabase for share and lead flows.

## Live pages and APIs
- UI pages: `/`, `/how-it-works`, `/pricing`, `/audit`, `/results?slug=...`
- API routes: `/api/audit`, `/api/summary`, `/api/leads`, `/api/share/[slug]`

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
