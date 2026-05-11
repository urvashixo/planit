import { describe, expect, it } from "vitest";
import { runAudit } from "../lib/auditEngine";

describe("audit engine", () => {
  it("calculates monthly and annual savings", () => {
    const res = runAudit([{ tool: "Cursor", vendor: "Cursor", currentPlan: "Teams", monthlySpend: 40, seats: 1, apiSpend: 0, useCase: "coding" }]);
    expect(res.monthlySavings).toBeGreaterThan(0);
    expect(res.annualSavings).toBe(res.monthlySavings * 12);
  });

  it("returns no_savings when optimized equals current", () => {
    const res = runAudit([{ tool: "Unknown", vendor: "Unknown", currentPlan: "NA", monthlySpend: 5, seats: 1, apiSpend: 0, useCase: "misc" }]);
    expect(res.tools[0].recommendationType).toBe("no_savings");
  });

  it("triggers api optimization on high api spend", () => {
    const res = runAudit([{ tool: "ChatGPT", vendor: "OpenAI", currentPlan: "Business", monthlySpend: 100, seats: 1, apiSpend: 90, useCase: "analysis" }]);
    expect(res.tools[0].optimizedMonthlySpend).toBeLessThan(100);
  });

  it("keeps optimization score within 0-100", () => {
    const res = runAudit([{ tool: "Cursor", vendor: "Cursor", currentPlan: "Pro", monthlySpend: 20, seats: 1, apiSpend: 0, useCase: "coding" }]);
    expect(res.optimizationScore).toBeGreaterThanOrEqual(0);
    expect(res.optimizationScore).toBeLessThanOrEqual(100);
  });

  it("supports multi-tool aggregation", () => {
    const res = runAudit([
      { tool: "Cursor", vendor: "Cursor", currentPlan: "Teams", monthlySpend: 40, seats: 1, apiSpend: 0, useCase: "coding" },
      { tool: "GitHub Copilot", vendor: "GitHub", currentPlan: "Pro+", monthlySpend: 39, seats: 1, apiSpend: 0, useCase: "coding" }
    ]);
    expect(res.tools.length).toBe(2);
    expect(res.totalCurrentSpend).toBe(79);
  });

  it("returns deep audit object with recommendation category", () => {
    const res = runAudit([{ tool: "ChatGPT", vendor: "OpenAI", currentPlan: "Enterprise", monthlySpend: 500, seats: 2, apiSpend: 30, useCase: "startup coding" }], {
      teamSize: 2,
      primaryUseCase: "startup coding"
    });
    expect(res.deepAudit.current_stack_analysis.issue.length).toBeGreaterThan(0);
    expect(["downgrade", "switch_vendor", "hybrid_stack", "api", "already_optimized"]).toContain(res.deepAudit.recommendation_type);
  });

  it("does not penalize enterprise when compliance required", () => {
    const res = runAudit([{ tool: "ChatGPT", vendor: "OpenAI", currentPlan: "Enterprise", monthlySpend: 500, seats: 2, apiSpend: 20, useCase: "startup coding" }], {
      teamSize: 2,
      primaryUseCase: "startup coding",
      complianceRequired: true
    });
    expect(res.deepAudit.reasoning.join(" ")).toContain("Compliance flag");
  });
});
