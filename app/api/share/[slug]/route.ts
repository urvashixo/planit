import { getSupabaseAdmin } from "../../../../lib/supabase";
import { jsonError } from "../../../../lib/http";
import { runAudit } from "../../../../lib/auditEngine";

export async function GET(_: Request, { params }: { params: { slug: string } }): Promise<Response> {
  if (!params.slug) return jsonError("slug_required", 400);

  const supabase = getSupabaseAdmin();
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("id,public_slug,total_current_spend,total_optimized_spend,monthly_savings,annual_savings,optimization_score,confidence_score,pricing_version,created_at,use_case_mix")
    .eq("public_slug", params.slug)
    .single();

  if (auditError || !audit) return jsonError("share_not_found", 404);

  const { data: tools, error: toolsError } = await supabase
    .from("audit_tools")
    .select("tool_name,vendor,current_plan,current_monthly_spend,seats,api_spend,use_case,recommended_plan,recommended_vendor,optimized_monthly_spend,monthly_savings,annual_savings,recommendation_type,rationale,confidence_score")
    .eq("audit_id", audit.id);

  if (toolsError) return jsonError("share_tools_not_found", 404);

  const reconstructedInput = (tools ?? []).map((t) => ({
    tool: t.tool_name,
    vendor: t.vendor,
    currentPlan: t.current_plan ?? "",
    monthlySpend: Number(t.current_monthly_spend ?? 0),
    seats: Number(t.seats ?? 1),
    apiSpend: Number(t.api_spend ?? 0),
    useCase: t.use_case ?? "mixed"
  }));

  const maxSeats = Math.max(1, ...reconstructedInput.map((t) => t.seats || 1));
  const recomputed = runAudit(reconstructedInput, {
    teamSize: maxSeats,
    primaryUseCase: audit.use_case_mix ?? reconstructedInput[0]?.useCase ?? "mixed"
  });

  return Response.json({ audit, tools, deepAudit: recomputed.deepAudit });
}
