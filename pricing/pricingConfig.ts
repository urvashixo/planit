export const PRICING_VERSION = "2026-05-11-v1";

export type PlanPricing = {
  tool: string;
  vendor: string;
  plan: string;
  monthly: number | null;
  annual: number | null;
  apiInputPer1M?: number | null;
  apiOutputPer1M?: number | null;
  officialUrl: string;
  verifiedDate: string;
  notes?: string;
};

export const PRICING_CONFIG: PlanPricing[] = [
  { tool: "Cursor", vendor: "Cursor", plan: "Pro", monthly: 20, annual: null, officialUrl: "https://cursor.com/pricing", verifiedDate: "2026-05-11" },
  { tool: "Cursor", vendor: "Cursor", plan: "Teams", monthly: 40, annual: null, officialUrl: "https://cursor.com/pricing", verifiedDate: "2026-05-11" },
  { tool: "Windsurf", vendor: "Codeium", plan: "Pro", monthly: 20, annual: null, officialUrl: "https://codeium.com/pricing", verifiedDate: "2026-05-11" },
  { tool: "Windsurf", vendor: "Codeium", plan: "Teams", monthly: 40, annual: null, officialUrl: "https://codeium.com/pricing", verifiedDate: "2026-05-11" },
  { tool: "GitHub Copilot", vendor: "GitHub", plan: "Pro", monthly: 10, annual: 100, officialUrl: "https://github.com/features/copilot/plans", verifiedDate: "2026-05-11" },
  { tool: "GitHub Copilot", vendor: "GitHub", plan: "Pro+", monthly: 39, annual: null, officialUrl: "https://github.com/features/copilot/plans", verifiedDate: "2026-05-11" },
  { tool: "Claude", vendor: "Anthropic", plan: "Pro", monthly: 20, annual: 17, officialUrl: "https://claude.ai/pricing", verifiedDate: "2026-05-11" },
  { tool: "Claude", vendor: "Anthropic", plan: "Team Standard", monthly: 25, annual: 20, officialUrl: "https://claude.ai/pricing", verifiedDate: "2026-05-11" },
  { tool: "ChatGPT", vendor: "OpenAI", plan: "Business", monthly: 25, annual: null, officialUrl: "https://openai.com/api/pricing", verifiedDate: "2026-05-11" },
  { tool: "Gemini", vendor: "Google", plan: "2.5 Flash", monthly: null, annual: null, apiInputPer1M: 0.3, apiOutputPer1M: 2.5, officialUrl: "https://ai.google.dev/gemini-api/docs/pricing", verifiedDate: "2026-05-11" },
  { tool: "OpenAI API", vendor: "OpenAI", plan: "GPT-5.4", monthly: null, annual: null, apiInputPer1M: 2.5, apiOutputPer1M: 15, officialUrl: "https://openai.com/api/pricing", verifiedDate: "2026-05-11" }
];
