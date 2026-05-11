# PRICING_DATA.md

Source of truth for Planit pricing intelligence. All numbers below are traceable to official vendor pages and verified on 2026-05-11.

## Windsurf (Codeium)
- Pro: $20/month — https://codeium.com/pricing — verified 2026-05-11
- Max: $200/month — https://codeium.com/pricing — verified 2026-05-11
- Teams: $40/user/month — https://codeium.com/pricing — verified 2026-05-11
- Enterprise: custom — https://codeium.com/pricing — verified 2026-05-11
- Audit logic implications: Team plans should be benchmarked against per-seat alternatives when seat count <10.

## OpenAI / ChatGPT
- GPT-5.5 API: input $5.00 / output $30.00 per 1M tokens — https://openai.com/api/pricing — verified 2026-05-11
- GPT-5.4 API: input $2.50 / output $15.00 per 1M tokens — https://openai.com/api/pricing — verified 2026-05-11
- GPT-5.4 mini API: input $0.75 / output $4.50 per 1M tokens — https://openai.com/api/pricing — verified 2026-05-11
- ChatGPT Business: ~ $25/user/month billed monthly — https://openai.com/api/pricing — verified 2026-05-11
- Audit logic implications: Suggest API-tier shift when seat product usage is low and tokenized workload is stable.

## Anthropic Claude
- Pro: $20 monthly or $17/mo annual equivalent — https://claude.ai/pricing — verified 2026-05-11
- Team Standard: $25/seat monthly or $20/seat annual — https://claude.ai/pricing — verified 2026-05-11
- Team Premium: $125/seat monthly or $100/seat annual — https://claude.ai/pricing — verified 2026-05-11
- Sonnet 4.6 API: input $3.00 / output $15.00 per 1M tokens — https://anthropic.com/pricing — verified 2026-05-11
- Audit logic implications: Prompt cache economics matter for repetitive workloads.

## Cursor
- Pro: $20/month — https://cursor.com/pricing — verified 2026-05-11
- Pro+: $60/month — https://cursor.com/pricing — verified 2026-05-11
- Ultra: $200/month — https://cursor.com/pricing — verified 2026-05-11
- Teams: $40/user/month — https://cursor.com/pricing — verified 2026-05-11
- Audit logic implications: Significant step-function pricing; right-size by actual agent request utilization.

## GitHub Copilot
- Pro: $10/user/month (or $100/year) — https://github.com/features/copilot/plans — verified 2026-05-11
- Pro+: $39/user/month — https://github.com/features/copilot/plans — verified 2026-05-11
- Audit logic implications: Premium request quotas can make Pro+ inefficient for low-volume teams.

## Google Gemini API
- Gemini 2.5 Flash: input $0.30 / output $2.50 per 1M tokens — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-11
- Gemini 2.5 Flash-Lite: input $0.10 / output $0.40 per 1M tokens — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-11
- Gemini 3.1 Pro Preview: input $2.00 (<=200K) / output $12.00 (<=200K) per 1M tokens — https://ai.google.dev/gemini-api/docs/pricing — verified 2026-05-11
- Audit logic implications: Route non-critical workloads to Flash-Lite where quality threshold allows.

## Ingestion and versioning
1. Human verifies prices from official URLs and updates this file.
2. Mirror values into `pricing/pricingConfig.ts`.
3. Bump `PRICING_VERSION` and commit.
4. Runtime key changes invalidate Redis cache automatically via `pricingVersion` in key namespace.
