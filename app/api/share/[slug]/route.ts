import { getSupabaseAdmin } from "../../../../lib/supabase";
import { jsonError } from "../../../../lib/http";

export async function GET(_: Request, { params }: { params: { slug: string } }): Promise<Response> {
  if (!params.slug) return jsonError("slug_required", 400);

  const supabase = getSupabaseAdmin();
  const { data: audit, error: auditError } = await supabase
    .from("audits")
    .select("id,public_slug,total_current_spend,total_optimized_spend,monthly_savings,annual_savings,optimization_score,confidence_score,pricing_version,created_at")
    .eq("public_slug", params.slug)
    .single();

  if (auditError || !audit) return jsonError("share_not_found", 404);

  const { data: tools, error: toolsError } = await supabase
    .from("audit_tools")
    .select("tool_name,vendor,current_plan,current_monthly_spend,seats,api_spend,recommended_plan,recommended_vendor,optimized_monthly_spend,monthly_savings,annual_savings,recommendation_type,rationale,confidence_score")
    .eq("audit_id", audit.id);

  if (toolsError) return jsonError("share_tools_not_found", 404);

  return Response.json({ audit, tools });
}
