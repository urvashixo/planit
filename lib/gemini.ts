import { GoogleGenerativeAI } from "@google/generative-ai";

function getClient() {
  const key = process.env.GEMINI_API_KEY;
  if (!key) throw new Error("GEMINI_API_KEY is required");
  return new GoogleGenerativeAI(key);
}

export const PROMPT_VERSION = "v1";

export async function generateAuditSummary(payload: {
  monthlySavings: number;
  annualSavings: number;
  optimizationScore: number;
  confidenceScore: number;
  toolCount: number;
}): Promise<{ summary: string; fallback: boolean }> {
  try {
    const model = getClient().getGenerativeModel({ model: "gemini-2.5-flash" });
    const prompt = `You are a finance-grade AI spend auditor. Return <=120 words.
Monthly savings: $${payload.monthlySavings}
Annual savings: $${payload.annualSavings}
Optimization score: ${payload.optimizationScore}/100
Confidence: ${payload.confidenceScore}
Tools analyzed: ${payload.toolCount}
Explain practical next actions and risk caveats.`;
    const res = await model.generateContent(prompt);
    return { summary: res.response.text().trim(), fallback: false };
  } catch {
    return {
      summary: `Planit found potential savings of $${payload.monthlySavings}/month ($${payload.annualSavings}/year). Prioritize the top 1-2 vendor changes first, then re-check API usage after 2 weeks to validate realized savings.`,
      fallback: true
    };
  }
}
