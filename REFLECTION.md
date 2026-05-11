# 1) The hardest bug this week
The hardest bug was a cache correctness bug where audit results were being reused even after pricing updates. My first hypothesis was that Redis TTLs were too long, so I reduced TTL from 24h to 1h and re-ran tests, but stale results still appeared. Then I suspected payload hashing collisions and logged the raw input payload and hash; those were unique. The real issue was key design: keys were based only on `audit_hash`, not `pricing_version`. That meant a user with identical spend input got old recommendations even after pricing changed. I fixed this by changing the key format to `audit:pricing_version:audit_hash` and mirroring the same pattern for summaries. I also added a deterministic pricing dataset hash derived from the typed config so version bumps become explicit and testable. What worked was stepping through hypotheses one at a time and validating each with logs instead of making multiple changes blindly.

# 2) A decision I reversed
I reversed a decision to parse pricing directly from markdown at runtime. Initially this looked elegant because `PRICING_DATA.md` is the source of truth, but in practice runtime markdown parsing introduced fragility around table formatting, extra notes, and inconsistent units (seat/month vs per-million-token vs annual discounts). It also made test fixtures noisy and complicated. Mid-week I switched to a typed mirror file (`pricing/pricingConfig.ts`) that is manually synced from `PRICING_DATA.md` using a documented process. This gave me type-safe lookups, deterministic unit tests, simpler calculations, and explicit versioning. The markdown file remains the auditable source with URLs and verification dates, while the TypeScript mirror is the execution layer. The reversal improved reliability and reduced implementation risk for an MVP timeline.

# 3) What I would build in week 2
Week 2 would focus on shipping user-visible trust and conversion improvements. First, I would add a transparent “why this recommendation” breakdown with formula-level explainability and confidence drivers per tool. Second, I’d add scenario modeling (team grows from 8 to 20, API usage doubles, compliance requirement toggles) so founders can forecast spend before signing annual contracts. Third, I’d operationalize lead routing: high-savings leads auto-tagged for fast Credex follow-up, medium-savings leads nurtured with benchmark content, and no-savings leads offered a re-audit reminder. Fourth, I’d harden security and abuse controls: slug-only audit reads, stricter RLS policies, and edge rate limiting with IP + device fingerprinting. Finally, I’d launch instrumentation dashboards for completion rate, median savings, consultation bookings, and recommendation acceptance, then iterate landing copy based on drop-off points.

# 4) How I used AI tools
I used AI tools as accelerators for drafting documentation structures, edge-case brainstorming for audit rules, and generating initial copy alternatives for landing and GTM messaging. I did not trust AI for pricing facts, security boundaries, or database policy details; those need source verification and explicit reasoning. One concrete failure I caught: an AI draft suggested making lead capture inserts with anon client-side writes only, which would have exposed data quality and abuse risks. I replaced that with server-side insertion via protected route and service-role usage only on the server. Another case was model pricing hallucination where output rates were blended across tiers; I discarded that and relied on the provided pricing source data and vendor URLs. The pattern that worked best was “AI for first draft, human for validation and decision.”

# 5) Self-rating
Discipline: 8/10 — I kept daily progress and maintained deterministic logic before optional AI layers.

Code quality: 7/10 — Core audit paths are typed and tested, but production hardening (full app UI, broader integration tests) still needs week-2 work.

Design sense: 7/10 — Product narrative and flow are strong, but visual system implementation is still blueprint-level.

Problem-solving: 8/10 — I used hypothesis-driven debugging and resolved key cache correctness and architecture trade-offs.

Entrepreneurial thinking: 9/10 — The system is built as a lead-gen + trust engine, not just a calculator, with clear GTM and economics logic.
