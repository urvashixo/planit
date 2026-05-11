import { getSupabaseAdmin } from "../../../lib/supabase";
import { enforceRateLimit } from "../../../lib/rateLimit";
import { emailLooksValid, getClientIp, hashIp, jsonError } from "../../../lib/http";

export async function POST(req: Request): Promise<Response> {
  const body = await req.json();
  const { email, company, role, teamSize, auditId } = body;
  if (!email) return jsonError("email_required", 400);
  if (!emailLooksValid(email)) return jsonError("email_invalid", 400);

  const ipHash = hashIp(getClientIp(req));
  const limiter = await enforceRateLimit(ipHash);
  if (!limiter.ok) {
    return Response.json({ error: "rate_limited", retryAfter: limiter.retryAfter }, { status: 429 });
  }

  const supabase = getSupabaseAdmin();

  if (auditId) {
    await supabase.from("audits").update({ lead_captured: true }).eq("id", auditId);
  }

  const { error } = await supabase.from("users_leads").insert({
    email,
    company_name: company ?? null,
    role: role ?? null,
    team_size: teamSize ?? null,
    audit_id: auditId ?? null,
    source_channel: body.sourceChannel ?? "direct",
    consent_status: true,
    high_savings_flag: Boolean(body.highSavingsFlag)
  });

  if (error) return jsonError("lead_insert_failed", 500);

  return Response.json({
    ok: true,
    provider: "supabase_only",
    transactionalEmail: "deferred_for_mvp",
    rateLimitRemaining: limiter.remaining
  });
}
