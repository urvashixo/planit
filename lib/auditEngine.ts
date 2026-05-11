import { findPlan, getPricingVersion, lookupAlternatives } from "./pricing";

export type AuditInputTool = {
  tool: string;
  vendor: string;
  currentPlan: string;
  monthlySpend: number;
  seats: number;
  apiSpend: number;
  useCase: string;
};

export type AuditResultTool = {
  tool: string;
  recommendationType: "downgrade" | "switch" | "api" | "credex" | "optimized" | "no_savings";
  recommendedPlan: string;
  recommendedVendor: string;
  optimizedMonthlySpend: number;
  monthlySavings: number;
  annualSavings: number;
  rationale: string;
  confidenceScore: number;
};

export type AuditResult = {
  pricingVersion: string;
  totalCurrentSpend: number;
  totalOptimizedSpend: number;
  monthlySavings: number;
  annualSavings: number;
  optimizationScore: number;
  confidenceScore: number;
  leadNudge: boolean;
  tools: AuditResultTool[];
  deepAudit: {
    current_stack_analysis: {
      waste_level: "low" | "medium" | "high";
      issue: string;
    };
    same_vendor_fix: {
      recommended_plan: string;
      monthly_savings: number;
    };
    best_vendor_fix: {
      recommended_vendor: string;
      recommended_plan: string;
      monthly_savings: number;
    };
    best_hybrid_option: {
      stack: string[];
      monthly_savings: number;
    };
    reasoning: string[];
    confidence_score: number;
    recommendation_type: "downgrade" | "switch_vendor" | "hybrid_stack" | "api" | "already_optimized";
  };
};

type UseCaseKey = "coding" | "writing" | "research" | "data" | "mixed";

const USE_CASE_RANKINGS: Record<UseCaseKey, string[]> = {
  coding: ["Cursor", "Claude", "GitHub Copilot", "ChatGPT", "Gemini"],
  writing: ["Claude", "ChatGPT", "Gemini"],
  research: ["ChatGPT", "Gemini", "Claude"],
  data: ["ChatGPT", "Gemini", "Claude"],
  mixed: ["ChatGPT", "Claude", "Cursor", "Gemini", "GitHub Copilot"]
};

function normalizeUseCase(input: string): UseCaseKey {
  const text = input.toLowerCase();
  if (text.includes("code") || text.includes("dev") || text.includes("engineering")) return "coding";
  if (text.includes("write") || text.includes("content")) return "writing";
  if (text.includes("research")) return "research";
  if (text.includes("data") || text.includes("analysis") || text.includes("bi")) return "data";
  if (text.includes("mix")) return "mixed";
  return "mixed";
}

function planOversized(plan: string, teamSize: number, complianceRequired: boolean): boolean {
  const p = plan.toLowerCase();
  if (complianceRequired) return false;
  if (teamSize <= 3 && (p.includes("enterprise") || p.includes("team premium") || p.includes("ultra") || p.includes("max"))) return true;
  if (teamSize === 1 && p.includes("team")) return true;
  return false;
}

function estimateHybridMonthly(teamSize: number, useCase: UseCaseKey): { stack: string[]; cost: number } {
  if (useCase === "coding") {
    const seats = Math.max(1, teamSize);
    return { stack: ["Cursor Pro", "Claude Pro"], cost: seats * (20 + 20) };
  }
  if (useCase === "writing") return { stack: ["Claude Pro", "ChatGPT Business"], cost: Math.max(1, teamSize) * (20 + 25) };
  if (useCase === "research") return { stack: ["ChatGPT Business", "Gemini 2.5 Flash"], cost: Math.max(1, teamSize) * 25 };
  if (useCase === "data") return { stack: ["ChatGPT Business", "Gemini 2.5 Flash"], cost: Math.max(1, teamSize) * 25 };
  return { stack: ["ChatGPT Business", "Claude Pro"], cost: Math.max(1, teamSize) * (25 + 20) };
}

export function runAudit(input: AuditInputTool[], options?: { teamSize?: number; primaryUseCase?: string; complianceRequired?: boolean; geminiQualityBoost?: number }): AuditResult {
  const derivedTeamSize = options?.teamSize ?? Math.max(1, ...input.map((x) => x.seats || 1));
  const normalizedUseCase = normalizeUseCase(options?.primaryUseCase ?? input[0]?.useCase ?? "mixed");
  const complianceRequired = Boolean(options?.complianceRequired);

  const results: AuditResultTool[] = input.map((row) => {
    const known = findPlan(row.tool, row.currentPlan);
    const alternatives = lookupAlternatives(row.tool, row.monthlySpend).cheaperAlternatives;
    const oversized = planOversized(row.currentPlan, derivedTeamSize, complianceRequired);
    const sameVendorAlt = alternatives.find((a) => a.vendor.toLowerCase() === row.vendor.toLowerCase());
    const baseOptimized = sameVendorAlt?.monthly ?? alternatives[0]?.monthly ?? known?.monthly ?? row.monthlySpend;
    const apiOptimization = row.apiSpend > row.monthlySpend * 0.8 ? row.monthlySpend * 0.68 : row.monthlySpend;
    const overbuyOptimization = oversized ? Math.min(baseOptimized, row.monthlySpend * 0.5) : baseOptimized;
    const optimized = Math.min(overbuyOptimization, apiOptimization);
    const savings = Number((row.monthlySpend - optimized).toFixed(2));
    const type = savings <= 0 ? "no_savings" : oversized ? "downgrade" : alternatives.length > 0 ? "switch" : row.apiSpend > row.monthlySpend * 0.8 ? "api" : "optimized";

    return {
      tool: row.tool,
      recommendationType: type,
      recommendedPlan: sameVendorAlt?.plan ?? alternatives[0]?.plan ?? row.currentPlan,
      recommendedVendor: sameVendorAlt?.vendor ?? alternatives[0]?.vendor ?? row.vendor,
      optimizedMonthlySpend: Number(optimized.toFixed(2)),
      monthlySavings: Math.max(0, savings),
      annualSavings: Math.max(0, Number((savings * 12).toFixed(2))),
      rationale:
        savings > 0
          ? oversized
            ? "Current plan appears oversized for team/compliance profile; a lower tier should maintain startup velocity."
            : "Lower-cost plan or API-mix identified from verified pricing dataset."
          : "No clear savings from current pricing snapshot.",
      confidenceScore: known ? 0.9 : 0.72
    };
  });

  const totalCurrent = input.reduce((sum, x) => sum + x.monthlySpend, 0);
  const totalOptimized = results.reduce((sum, x) => sum + x.optimizedMonthlySpend, 0);
  const monthlySavings = Number((totalCurrent - totalOptimized).toFixed(2));
  const costEfficiency = Math.max(0, Math.min(100, Math.round((monthlySavings / Math.max(1, totalCurrent)) * 100)));
  const useCaseRanking = USE_CASE_RANKINGS[normalizedUseCase];
  const topVendor = input[0]?.tool ?? "";
  const fitRank = useCaseRanking.findIndex((x) => topVendor.toLowerCase().includes(x.toLowerCase()) || x.toLowerCase().includes(topVendor.toLowerCase()));
  const useCaseFitScore = fitRank === -1 ? 55 : Math.max(55, 100 - fitRank * 15);
  const teamFitScore = input.some((x) => planOversized(x.currentPlan, derivedTeamSize, complianceRequired)) ? 45 : 88;
  const operationalPracticalityScore = complianceRequired ? 82 : 90;
  const geminiQualityBoost = Math.max(-10, Math.min(10, options?.geminiQualityBoost ?? 0));
  const optimizationScore = Math.max(
    0,
    Math.min(
      100,
      Math.round(costEfficiency * 0.4 + (useCaseFitScore + geminiQualityBoost) * 0.35 + teamFitScore * 0.15 + operationalPracticalityScore * 0.1)
    )
  );
  const confidenceScore = Number((results.reduce((s, x) => s + x.confidenceScore, 0) / Math.max(1, results.length)).toFixed(2));

  const bestSameVendor = results.reduce((best, cur) => (cur.monthlySavings > best.monthlySavings ? cur : best), results[0]);
  const topUseCaseTool = USE_CASE_RANKINGS[normalizedUseCase][0] ?? "ChatGPT";
  const competitorFix = lookupAlternatives(topUseCaseTool, totalCurrent).cheaperAlternatives[0];
  const competitorEstimatedSpend = competitorFix?.monthly ? competitorFix.monthly * Math.max(1, derivedTeamSize) : totalOptimized;
  const competitorMonthlySavings = Math.max(0, Number((totalCurrent - competitorEstimatedSpend).toFixed(2)));
  const hybrid = estimateHybridMonthly(derivedTeamSize, normalizedUseCase);
  const hybridMonthlySavings = Math.max(0, Number((totalCurrent - hybrid.cost).toFixed(2)));

  const recommendationType: AuditResult["deepAudit"]["recommendation_type"] =
    monthlySavings <= 0
      ? "already_optimized"
      : hybridMonthlySavings > competitorMonthlySavings && hybridMonthlySavings > monthlySavings
      ? "hybrid_stack"
      : input.some((x) => x.apiSpend > x.monthlySpend * 0.8)
      ? "api"
      : input.some((x) => planOversized(x.currentPlan, derivedTeamSize, complianceRequired))
      ? "downgrade"
      : "switch_vendor";

  const wasteLevel: AuditResult["deepAudit"]["current_stack_analysis"]["waste_level"] =
    monthlySavings >= totalCurrent * 0.3 ? "high" : monthlySavings >= totalCurrent * 0.12 ? "medium" : "low";

  return {
    pricingVersion: getPricingVersion(),
    totalCurrentSpend: Number(totalCurrent.toFixed(2)),
    totalOptimizedSpend: Number(totalOptimized.toFixed(2)),
    monthlySavings,
    annualSavings: Number((monthlySavings * 12).toFixed(2)),
    optimizationScore,
    confidenceScore,
    leadNudge: monthlySavings >= 100,
    tools: results,
    deepAudit: {
      current_stack_analysis: {
        waste_level: wasteLevel,
        issue:
          recommendationType === "already_optimized"
            ? "Current stack appears right-sized for your use case and team profile."
            : input.some((x) => planOversized(x.currentPlan, derivedTeamSize, complianceRequired))
            ? `${input[0]?.tool ?? "Current plan"} is oversized for a ${derivedTeamSize}-person team unless compliance/security needs require it.`
            : "Current stack has measurable spend inefficiencies versus startup-optimized alternatives."
      },
      same_vendor_fix: {
        recommended_plan: bestSameVendor?.recommendedPlan ?? input[0]?.currentPlan ?? "No change",
        monthly_savings: Number((bestSameVendor?.monthlySavings ?? 0).toFixed(2))
      },
      best_vendor_fix: {
        recommended_vendor: competitorFix?.vendor ?? topUseCaseTool,
        recommended_plan: competitorFix?.plan ?? "Starter",
        monthly_savings: competitorMonthlySavings
      },
      best_hybrid_option: {
        stack: hybrid.stack,
        monthly_savings: hybridMonthlySavings
      },
      reasoning: [
        "Price logic is deterministic and sourced from verified pricing snapshots.",
        "Use-case ranking is tuned for startup practicality, not generic popularity.",
        complianceRequired
          ? "Compliance flag preserved enterprise-safety assumptions in recommendations."
          : "No explicit compliance constraint detected, so enterprise overhead is penalized when oversized."
      ],
      confidence_score: Math.round(confidenceScore * 100),
      recommendation_type: recommendationType
    }
  };
}
