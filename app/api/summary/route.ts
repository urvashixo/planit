import crypto from "node:crypto";
import { generateAuditSummary } from "../../../lib/gemini";
import { cacheKey, getRedis } from "../../../lib/redis";
import { getPricingVersion } from "../../../lib/pricing";
import { enforceRateLimit } from "../../../lib/rateLimit";
import { getClientIp, hashIp, jsonError } from "../../../lib/http";
import { getSupabaseAdmin } from "../../../lib/supabase";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  if (typeof body?.monthlySavings !== "number" || typeof body?.annualSavings !== "number") {
    return jsonError("summary_payload_invalid", 400);
  }

  const ipHash = hashIp(getClientIp(req));
  const limiter = await enforceRateLimit(ipHash);
  if (!limiter.ok) {
    return Response.json({ error: "rate_limited", retryAfter: limiter.retryAfter }, { status: 429 });
  }

  const hash = crypto.createHash("sha256").update(JSON.stringify(body)).digest("hex").slice(0, 16);
  const key = cacheKey("summary", getPricingVersion(), hash);
  const redis = getRedis();
  const cached = await redis.get(key);
  if (cached) return Response.json({ ...cached, cached: true, rateLimitRemaining: limiter.remaining });

  const generated = await generateAuditSummary(body);
  if (body.auditId) {
    await getSupabaseAdmin().from("ai_logs").insert({
      audit_id: body.auditId,
      provider: "gemini",
      prompt_version: "v1",
      fallback_used: generated.fallback
    });
  }

  await redis.set(key, generated, { ex: 60 * 60 * 24 });
  return Response.json({ ...generated, cached: false, rateLimitRemaining: limiter.remaining });
}
