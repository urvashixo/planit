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
};

export function runAudit(input: AuditInputTool[]): AuditResult {
  const results: AuditResultTool[] = input.map((row) => {
    const known = findPlan(row.tool, row.currentPlan);
    const alternatives = lookupAlternatives(row.tool, row.monthlySpend).cheaperAlternatives;
    const baseOptimized = alternatives[0]?.monthly ?? known?.monthly ?? row.monthlySpend;
    const apiOptimization = row.apiSpend > row.monthlySpend * 0.8 ? row.monthlySpend * 0.7 : row.monthlySpend;
    const optimized = Math.min(baseOptimized, apiOptimization);
    const savings = Number((row.monthlySpend - optimized).toFixed(2));
    const type = savings <= 0 ? "no_savings" : alternatives.length > 0 ? "switch" : row.apiSpend > row.monthlySpend * 0.8 ? "api" : "optimized";

    return {
      tool: row.tool,
      recommendationType: type,
      recommendedPlan: alternatives[0]?.plan ?? row.currentPlan,
      recommendedVendor: alternatives[0]?.vendor ?? row.vendor,
      optimizedMonthlySpend: Number(optimized.toFixed(2)),
      monthlySavings: Math.max(0, savings),
      annualSavings: Math.max(0, Number((savings * 12).toFixed(2))),
      rationale: savings > 0 ? "Lower-cost plan or API-mix identified from verified pricing dataset." : "No clear savings from current pricing snapshot.",
      confidenceScore: known ? 0.9 : 0.72
    };
  });

  const totalCurrent = input.reduce((sum, x) => sum + x.monthlySpend, 0);
  const totalOptimized = results.reduce((sum, x) => sum + x.optimizedMonthlySpend, 0);
  const monthlySavings = Number((totalCurrent - totalOptimized).toFixed(2));
  const optimizationScore = Math.max(0, Math.min(100, Math.round((monthlySavings / Math.max(1, totalCurrent)) * 100)));
  const confidenceScore = Number((results.reduce((s, x) => s + x.confidenceScore, 0) / Math.max(1, results.length)).toFixed(2));

  return {
    pricingVersion: getPricingVersion(),
    totalCurrentSpend: Number(totalCurrent.toFixed(2)),
    totalOptimizedSpend: Number(totalOptimized.toFixed(2)),
    monthlySavings,
    annualSavings: Number((monthlySavings * 12).toFixed(2)),
    optimizationScore,
    confidenceScore,
    leadNudge: monthlySavings >= 100,
    tools: results
  };
}
