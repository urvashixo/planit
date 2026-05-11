import crypto from "node:crypto";
import { PRICING_CONFIG, PRICING_VERSION, type PlanPricing } from "../pricing/pricingConfig";

export type PricingLookup = {
  current?: PlanPricing;
  cheaperAlternatives: PlanPricing[];
  pricingVersion: string;
};

export function pricingDatasetHash(): string {
  return crypto.createHash("sha256").update(JSON.stringify(PRICING_CONFIG)).digest("hex").slice(0, 12);
}

export function getPricingVersion(): string {
  return `${PRICING_VERSION}-${pricingDatasetHash()}`;
}

export function findPlan(tool: string, plan: string): PlanPricing | undefined {
  return PRICING_CONFIG.find((p) => p.tool.toLowerCase() === tool.toLowerCase() && p.plan.toLowerCase() === plan.toLowerCase());
}

export function lookupAlternatives(tool: string, monthlySpend: number): PricingLookup {
  const sameCategory = PRICING_CONFIG.filter((p) => p.tool.toLowerCase().includes(tool.toLowerCase()) || tool.toLowerCase().includes(p.tool.toLowerCase()));
  const cheaperAlternatives = sameCategory.filter((p) => p.monthly !== null && p.monthly < monthlySpend).sort((a, b) => (a.monthly ?? 0) - (b.monthly ?? 0));
  return { current: undefined, cheaperAlternatives, pricingVersion: getPricingVersion() };
}
