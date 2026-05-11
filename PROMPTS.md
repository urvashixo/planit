# Gemini prompt system

## Primary prompt (v1)
"You are a finance-grade AI spend auditor. Return <=120 words. Monthly savings: $X. Annual savings: $Y. Optimization score: Z/100. Confidence: C. Tools analyzed: N. Explain practical next actions and risk caveats."

## Why this structure
- Forces concise founder-readable output.
- Anchors to deterministic metrics from audit engine.
- Adds caveat requirement to avoid overclaiming.

## Prompt versioning
- Stored in code as `PROMPT_VERSION`.
- Logged to `ai_logs.prompt_version`.
- Bump when semantics change materially.

## Failed prompts tried
1. Long narrative prompt with open style: produced vague advice and too much text.
2. Prompt asking for “aggressive savings”: overfit recommendations and reduced trust.
3. Prompt without confidence context: made certainty sound higher than warranted.

## Fallback logic
- If Gemini fails or times out, return deterministic fallback summary from server.
- Mark fallback state for observability and future replay.
