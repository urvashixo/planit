import crypto from "node:crypto";
import { runAudit } from "../../../lib/auditEngine";
import { cacheKey, getRedis } from "../../../lib/redis";
import { getPricingVersion } from "../../../lib/pricing";
import { getSupabaseAdmin } from "../../../lib/supabase";
import { enforceRateLimit } from "../../../lib/rateLimit";
import { getClientIp, hashIp, jsonError } from "../../../lib/http";

function toSlug(auditHash: string): string {
  const suffix = Math.random().toString(36).slice(2, 8);
  return `pln-${auditHash}-${suffix}`;
}

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  if (!Array.isArray(body.tools) || body.tools.length === 0) {
    return jsonError("tools_required", 400);
  }

  const ipHash = hashIp(getClientIp(req));
  const limiter = await enforceRateLimit(ipHash);
  if (!limiter.ok) {
    return Response.json({ error: "rate_limited", retryAfter: limiter.retryAfter }, { status: 429 });
  }

  const auditHash = crypto.createHash("sha256").update(JSON.stringify(body.tools ?? [])).digest("hex").slice(0, 16);
  const pricingVersion = getPricingVersion();
  const key = cacheKey("audit", pricingVersion, auditHash);
  const redis = getRedis();

  const cached = await redis.get(key);
  if (cached) {
    return Response.json({ ...cached, cached: true, rateLimitRemaining: limiter.remaining });
  }

  const result = runAudit(body.tools ?? []);

  const publicSlug = toSlug(auditHash);
  const supabase = getSupabaseAdmin();
  const { data: auditRow, error: auditError } = await supabase
    .from("audits")
    .insert({
      public_slug: publicSlug,
      session_id: body.sessionId ?? null,
      total_current_spend: result.totalCurrentSpend,
      total_optimized_spend: result.totalOptimizedSpend,
      monthly_savings: result.monthlySavings,
      annual_savings: result.annualSavings,
      optimization_score: result.optimizationScore,
      confidence_score: result.confidenceScore,
      use_case_mix: body.useCaseMix ?? null,
      pricing_version: result.pricingVersion,
      lead_captured: false,
      high_savings_flag: result.monthlySavings >= 500
    })
    .select("id")
    .single();

  if (auditError || !auditRow) return jsonError("audit_persist_failed", 500);

  const toolRows = body.tools.map((tool: any, i: number) => {
    const out = result.tools[i];
    return {
      audit_id: auditRow.id,
      tool_name: tool.tool,
      vendor: tool.vendor,
      current_plan: tool.currentPlan ?? null,
      current_monthly_spend: tool.monthlySpend ?? 0,
      seats: tool.seats ?? 1,
      api_spend: tool.apiSpend ?? 0,
      use_case: tool.useCase ?? null,
      recommended_plan: out?.recommendedPlan ?? null,
      recommended_vendor: out?.recommendedVendor ?? null,
      optimized_monthly_spend: out?.optimizedMonthlySpend ?? tool.monthlySpend ?? 0,
      monthly_savings: out?.monthlySavings ?? 0,
      annual_savings: out?.annualSavings ?? 0,
      recommendation_type: out?.recommendationType === "no_savings" ? "optimized" : out?.recommendationType ?? "optimized",
      rationale: out?.rationale ?? null,
      confidence_score: out?.confidenceScore ?? 0.7
    };
  });

  const { error: toolsError } = await supabase.from("audit_tools").insert(toolRows);
  if (toolsError) return jsonError("audit_tools_persist_failed", 500);

  const responsePayload = { ...result, auditId: auditRow.id, publicSlug };
  await redis.set(key, responsePayload, { ex: 60 * 60 });
  return Response.json({ ...responsePayload, cached: false, rateLimitRemaining: limiter.remaining });
}
