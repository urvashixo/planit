"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { SiteFooter, SiteHeader } from "../components";

type ToolInput = {
  tool: string;
  vendor: string;
  currentPlan: string;
  monthlySpend: number | "";
  seats: number | "";
  apiSpend: number | "";
  useCase: string;
};

const STORAGE_KEY = "planit_audit_form_v1";

const TOOL_OPTIONS = ["ChatGPT", "OpenAI API", "Claude", "Cursor", "GitHub Copilot", "Gemini", "Windsurf"];

const TOOL_PLAN_OPTIONS: Record<string, string[]> = {
  Windsurf: ["Free", "Pro", "Max", "Teams", "Enterprise", "OpenAI frontier models", "Claude models", "Gemini models"],
  "OpenAI API": [
    "GPT-5.5",
    "GPT-5.4",
    "GPT-5.4 mini",
    "GPT-Realtime-2",
    "GPT-Realtime-Translate",
    "GPT-Realtime-Whisper",
    "GPT-Image-2",
    "Web Search",
    "Containers",
    "Batch API",
    "Priority Processing",
    "Flex Processing"
  ],
  ChatGPT: ["ChatGPT Business", "ChatGPT Enterprise", "Business Codex", "GPT-5.2", "GPT-4o", "o3", "o4-mini"],
  Claude: [
    "Free",
    "Pro",
    "Max",
    "Team (Standard Seat)",
    "Team (Premium Seat)",
    "Enterprise",
    "Claude Opus 4.7",
    "Claude Opus 4.6",
    "Claude Opus 4.5",
    "Claude Opus 4.1",
    "Claude Opus 4",
    "Claude Sonnet 4.6",
    "Claude Sonnet 4.5",
    "Claude Sonnet 4",
    "Claude Haiku 4.5",
    "Claude Haiku 3.5",
    "Claude Haiku 3",
    "Claude Code",
    "Claude Cowork"
  ],
  Cursor: ["Hobby", "Pro", "Pro+", "Ultra", "Teams", "Enterprise", "Bugbot", "OpenAI models", "Claude models", "Gemini models"],
  "GitHub Copilot": ["Free", "Pro", "Pro+", "Student Plan", "Haiku 4.5", "GPT-5 mini", "Claude", "Codex", "Copilot CLI", "GitHub Spark", "Copilot Cloud Agent"],
  Gemini: [
    "Free",
    "Paid",
    "Enterprise",
    "Gemini 3.1 Pro Preview",
    "Gemini 3 Pro Image Preview",
    "Gemini 3.1 Flash Lite",
    "Gemini 3.1 Flash Preview",
    "Gemini 3.1 Flash Image Preview",
    "Gemini 3.1 Flash Live Preview",
    "Gemini 3.1 Flash TTS Preview",
    "Gemini 2.5 Flash",
    "Gemini 2.5 Flash-Lite",
    "Gemini 2.5 Flash Native Audio (Live API)",
    "Gemini 2.5 Flash Image",
    "Gemini 2.5 Flash Preview TTS",
    "Gemini 2.5 Pro Preview TTS",
    "Gemini 2.5 Computer Use Preview",
    "Gemini 2.0 Flash",
    "Gemini 2.0 Flash-Lite",
    "Veo 3.1 Standard",
    "Veo 3.1 Fast",
    "Veo 3.1 Lite",
    "Veo 3 Standard",
    "Veo 3 Fast",
    "Veo 2",
    "Lyria 3 Clip Preview",
    "Lyria 3 Pro Preview",
    "Imagen 4 Fast",
    "Imagen 4 Standard",
    "Imagen 4 Ultra",
    "Gemini Robotics-ER 1.6 Preview",
    "Gemini Embedding 001",
    "Gemma 4",
    "Google Search",
    "Google Maps",
    "Code Execution",
    "URL Context",
    "File Search",
    "Custom Tool Endpoint",
    "Gemini Deep Research Agent"
  ]
};

const TOOL_VENDOR_MAP: Record<string, string> = {
  "ChatGPT": "OpenAI",
  "OpenAI API": "OpenAI",
  Claude: "Anthropic",
  Cursor: "Cursor",
  "GitHub Copilot": "GitHub",
  Gemini: "Google",
  Windsurf: "Codeium"
};

function blankTool(): ToolInput {
  return {
    tool: "",
    vendor: "",
    currentPlan: "",
    monthlySpend: "",
    seats: "",
    apiSpend: "",
    useCase: ""
  };
}

export default function AuditPage() {
  const router = useRouter();
  const [tools, setTools] = useState<ToolInput[]>([blankTool()]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
  }, [tools]);

  const monthlyTotal = useMemo(() => tools.reduce((sum, t) => sum + (Number(t.monthlySpend) || 0), 0), [tools]);

  function updateTool(index: number, key: keyof ToolInput, value: string) {
    setTools((prev) => {
      const next = [...prev];
      const numeric = key === "monthlySpend" || key === "seats" || key === "apiSpend";
      const cast = numeric ? (value === "" ? "" : Number(value)) : value;
      const updated = { ...next[index], [key]: cast };
      if (key === "tool") {
        updated.vendor = TOOL_VENDOR_MAP[value] ?? "";
        updated.currentPlan = "";
      }
      next[index] = updated;
      return next;
    });
  }

  async function submitAudit() {
    setLoading(true);
    setError(null);
    try {
      const normalized = tools
        .filter((t) => t.tool && t.vendor && t.currentPlan && Number(t.monthlySpend) > 0)
        .map((t) => ({
          ...t,
          monthlySpend: Number(t.monthlySpend || 0),
          seats: Number(t.seats || 0),
          apiSpend: Number(t.apiSpend || 0)
        }));
      if (normalized.length === 0) {
        setError("Add at least one complete tool row.");
        return;
      }

      const res = await fetch("/api/audit", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tools: normalized, sessionId: crypto.randomUUID(), useCaseMix: normalized.map((t) => t.useCase).join(", ") })
      });

      if (!res.ok) {
        const body = (await res.json()) as { error?: string };
        throw new Error(body.error || "Audit failed");
      }

      const data = (await res.json()) as { publicSlug?: string };
      if (!data.publicSlug) throw new Error("Missing share slug");
      router.push(`/results?slug=${data.publicSlug}`);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Unexpected error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main>
      <SiteHeader />
      <section className="shell form-grid">
        <div>
          <span className="kicker">INTELLIGENCE LAYER 01</span>
          <h1 className="headline" style={{ fontSize: "clamp(42px, 5vw, 78px)" }}>AI Spend Auditor</h1>
          <p className="sub">Precision analysis for your high-velocity AI tool stack. Identify seat redundancy and optimize API throughput in seconds.</p>

          <div className="card" style={{ marginTop: 24 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
              <h2 style={{ margin: 0 }}>Tool Inventory</h2>
              <button
                type="button"
                onClick={() => setTools((prev) => [...prev, blankTool()])}
                style={{ color: "var(--acid)", fontFamily: "IBM Plex Mono, monospace", background: "transparent", border: "none", cursor: "pointer" }}
              >
                + Add Vendor
              </button>
            </div>

            {tools.map((tool, i) => (
              <div key={`${tool.tool}-${i}`} className="input-row">
                <select className="field" value={tool.tool} onChange={(e) => updateTool(i, "tool", e.target.value)}>
                  <option value="">Select model/tool</option>
                  {TOOL_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input className="field" value={tool.vendor} readOnly placeholder="Vendor auto-filled" />
                <select className="field" value={tool.currentPlan} onChange={(e) => updateTool(i, "currentPlan", e.target.value)}>
                  <option value="">Select plan</option>
                  {(TOOL_PLAN_OPTIONS[tool.tool] ?? []).map((opt) => (
                    <option key={opt} value={opt}>{opt}</option>
                  ))}
                </select>
                <input className="field" type="number" min={0} placeholder="Monthly Spend ($)" value={tool.monthlySpend} onChange={(e) => updateTool(i, "monthlySpend", e.target.value)} />
                <input className="field" type="number" min={1} placeholder="Seat Count" value={tool.seats} onChange={(e) => updateTool(i, "seats", e.target.value)} />
                <input className="field" type="number" min={0} placeholder="API Spend ($)" value={tool.apiSpend} onChange={(e) => updateTool(i, "apiSpend", e.target.value)} />
                <input className="field" placeholder="Use case" value={tool.useCase} onChange={(e) => updateTool(i, "useCase", e.target.value)} />
                <button type="button" className="btn-ghost" onClick={() => setTools((prev) => prev.filter((_, idx) => idx !== i))}>Remove</button>
              </div>
            ))}

            <div style={{ border: "1px dashed #485129", borderRadius: 12, padding: 18, textAlign: "center", color: "#c5cab5", margin: "16px 0" }}>
              {tools.length} vendors in current audit
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 24 }}>
              <span style={{ color: "#868d76" }}>Finance-grade data encryption active • ${monthlyTotal.toLocaleString()} monthly analyzed</span>
              <button type="button" className="cta" onClick={submitAudit} disabled={loading}>{loading ? "Calculating..." : "Calculate Savings"}</button>
            </div>
            {error ? <p style={{ color: "#ff9d9d", marginTop: 12 }}>{error}</p> : null}
          </div>
        </div>

        <aside>
          <div className="card" style={{ marginBottom: 16 }}>
            <div style={{ color: "var(--acid)", fontFamily: "IBM Plex Mono, monospace" }}>Avg. Savings</div>
            <div style={{ fontSize: 62, fontWeight: 700, marginTop: 6 }}>24.8%</div>
          </div>
          <div className="card" style={{ marginBottom: 16 }}>
            <h3 style={{ marginTop: 0 }}>Live Insight</h3>
            <p className="sub" style={{ fontSize: 17 }}>Companies using Planit typically find 15% redundancy in seat overlap between OpenAI and Anthropic teams.</p>
            <div className="bar-graph" style={{ height: 118 }}>
              <div className="bar" style={{ height: 52 }} />
              <div className="bar" style={{ height: 72 }} />
              <div className="bar" style={{ height: 54 }} />
              <div className="bar" style={{ height: 86 }} />
              <div className="bar" style={{ height: 98 }} />
            </div>
          </div>
          <div className="card">
            <span className="kicker" style={{ borderRadius: 8 }}>ANOMALY DETECTED</span>
            <h3>Ghost Seats</h3>
            <p className="sub" style={{ fontSize: 17 }}>This is load after analysis of your spending.</p>
          </div>
        </aside>
      </section>
      <SiteFooter />
    </main>
  );
}
