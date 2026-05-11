"use client";

import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";

type ShareTool = {
  tool_name: string;
  vendor: string;
  current_monthly_spend: number;
  monthly_savings: number;
};

type SharePayload = {
  audit: {
    id: string;
    public_slug: string;
    total_current_spend: number;
    total_optimized_spend: number;
    monthly_savings: number;
    annual_savings: number;
    optimization_score: number;
    confidence_score: number;
  };
  tools: ShareTool[];
};

export default function ResultsClient() {
  const params = useSearchParams();
  const slug = params.get("slug");
  const [data, setData] = useState<SharePayload | null>(null);
  const [summary, setSummary] = useState<string>("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [leadOpen, setLeadOpen] = useState(false);
  const [leadEmail, setLeadEmail] = useState("");
  const [leadCompany, setLeadCompany] = useState("");
  const [leadRole, setLeadRole] = useState("");
  const [leadTeamSize, setLeadTeamSize] = useState(10);
  const [leadState, setLeadState] = useState<"idle" | "saving" | "saved" | "error">("idle");

  useEffect(() => {
    if (!slug) {
      setLoading(false);
      setError("Missing share slug. Run an audit first.");
      return;
    }

    const run = async () => {
      setLoading(true);
      setError(null);
      try {
        const shareRes = await fetch(`/api/share/${slug}`);
        if (!shareRes.ok) throw new Error("Unable to load audit report");
        const shareData = (await shareRes.json()) as SharePayload;
        setData(shareData);

        const summaryRes = await fetch("/api/summary", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            auditId: shareData.audit.id,
            monthlySavings: shareData.audit.monthly_savings,
            annualSavings: shareData.audit.annual_savings,
            optimizationScore: shareData.audit.optimization_score,
            confidenceScore: shareData.audit.confidence_score,
            toolCount: shareData.tools.length
          })
        });
        if (summaryRes.ok) {
          const summaryData = (await summaryRes.json()) as { summary?: string };
          setSummary(summaryData.summary || "");
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "Unexpected error");
      } finally {
        setLoading(false);
      }
    };

    void run();
  }, [slug]);

  const topTools = useMemo(() => {
    if (!data) return [];
    return [...data.tools].sort((a, b) => b.current_monthly_spend - a.current_monthly_spend).slice(0, 3);
  }, [data]);

  async function saveLead() {
    if (!data) return;
    setLeadState("saving");
    try {
      const res = await fetch("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: leadEmail,
          company: leadCompany,
          role: leadRole,
          teamSize: leadTeamSize,
          auditId: data.audit.id,
          sourceChannel: "results_drawer",
          highSavingsFlag: data.audit.monthly_savings >= 500
        })
      });
      if (!res.ok) throw new Error("Lead capture failed");
      setLeadState("saved");
    } catch {
      setLeadState("error");
    }
  }

  if (loading) return <section className="shell" style={{ paddingTop: 60 }}>Loading audit report...</section>;
  if (error || !data) return <section className="shell" style={{ paddingTop: 60, color: "#ff9d9d" }}>{error || "No data"}</section>;

  return (
    <>
      <section className="shell results-grid">
        <div className="big-stat">
          <div style={{ fontFamily: "IBM Plex Mono, monospace" }}>Audit Period: Last 30 Days</div>
          <h1>${data.audit.total_current_spend.toLocaleString()}</h1>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 12, marginTop: 50 }}>
            <div className="card" style={{ color: "#13180a", borderColor: "#90ac00", background: "rgba(0,0,0,0.06)" }}>Spend</div>
            <div className="card" style={{ color: "#13180a", borderColor: "#90ac00", background: "rgba(0,0,0,0.06)" }}>Save ${data.audit.monthly_savings.toLocaleString()}/mo</div>
            <div className="card" style={{ color: "#13180a", borderColor: "#90ac00", background: "rgba(0,0,0,0.06)" }}>Annual ${data.audit.annual_savings.toLocaleString()}</div>
            <div className="card" style={{ color: "#13180a", borderColor: "#90ac00", background: "rgba(0,0,0,0.06)" }}>Score {data.audit.optimization_score}%</div>
          </div>
          <div className="wave" />
        </div>

        <aside className="card">
          <h3 style={{ marginTop: 0, fontFamily: "IBM Plex Mono, monospace" }}>Top AI Vendors</h3>
          <div style={{ display: "grid", gap: 16 }}>
            {topTools.map((tool) => (
              <div key={`${tool.vendor}-${tool.tool_name}`} style={{ display: "flex", justifyContent: "space-between" }}>
                <span>{tool.vendor}</span>
                <span>${tool.current_monthly_spend.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </aside>
      </section>

      <section className="shell" style={{ display: "grid", gridTemplateColumns: "1fr 420px", gap: 20, marginTop: 18 }}>
        <div className="card">
          <h2 style={{ marginTop: 0 }}>Audit Efficiency</h2>
          <div style={{ fontSize: 54, fontWeight: 700 }}>+{data.audit.optimization_score}%</div>
          <div className="line" style={{ marginTop: 18 }}>
            <svg viewBox="0 0 100 40" preserveAspectRatio="none">
              <polyline fill="none" stroke="#c9f600" strokeWidth="0.5" points="0,33 10,29 18,32 28,25 39,27 48,14 58,21 68,8 78,19 88,16 100,6" />
            </svg>
          </div>
        </div>

        <div style={{ display: "grid", gap: 20 }}>
          <div className="card">
            <h3 style={{ marginTop: 0 }}>Saving Target</h3>
            <div style={{ fontSize: 52, fontWeight: 700 }}>${Math.round(data.audit.monthly_savings * 1.25).toLocaleString()}</div>
            <div style={{ height: 8, background: "#2a2e33", borderRadius: 999, marginTop: 16 }}>
              <div style={{ width: `${Math.min(100, Math.max(10, data.audit.optimization_score))}%`, background: "var(--acid)", height: "100%", borderRadius: 999 }} />
            </div>
          </div>
          <div className="card" style={{ borderColor: "#4d5921", background: "linear-gradient(180deg, rgba(201,246,0,0.08), #121510)" }}>
            <h3 style={{ marginTop: 0, color: "var(--acid)", fontFamily: "IBM Plex Mono, monospace" }}>AI Audit Insight</h3>
            <p style={{ fontSize: 36, margin: "10px 0", fontWeight: 700 }}>{data.audit.optimization_score}% Savings</p>
            <p className="sub" style={{ fontSize: 16 }}>{summary || "Optimization summary is being generated."}</p>
            <button className="cta" style={{ marginTop: 12 }} onClick={() => setLeadOpen(true)}>Get Full Breakdown</button>
          </div>
        </div>
      </section>

      <section className="shell card" style={{ marginTop: 20, marginBottom: 40 }}>
        <h2 style={{ marginTop: 0 }}>Critical Spending Anomalies</h2>
        {data.tools.slice(0, 4).map((tool) => (
          <div key={`${tool.vendor}-${tool.tool_name}-anom`} style={{ display: "flex", justifyContent: "space-between", borderTop: "1px solid #23281d", padding: "14px 0" }}>
            <div>{tool.vendor} {tool.tool_name}</div>
            <div style={{ color: tool.monthly_savings > 0 ? "#a8ff66" : "#ff8b8b" }}>{tool.monthly_savings > 0 ? "+" : "-"}${Math.abs(tool.monthly_savings).toLocaleString()}/mo</div>
          </div>
        ))}
      </section>

      {leadOpen ? (
        <section style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 40, display: "grid", placeItems: "center", padding: 20 }}>
          <div className="card" style={{ width: "min(620px, 100%)" }}>
            <h2 style={{ marginTop: 0 }}>Get Your Full Audit + Credex Savings Call</h2>
            <p className="sub" style={{ fontSize: 16 }}>Enter your details to save this audit and get a follow-up action plan.</p>
            <div style={{ display: "grid", gap: 10 }}>
              <input className="field" placeholder="Work email" value={leadEmail} onChange={(e) => setLeadEmail(e.target.value)} />
              <input className="field" placeholder="Company" value={leadCompany} onChange={(e) => setLeadCompany(e.target.value)} />
              <input className="field" placeholder="Role" value={leadRole} onChange={(e) => setLeadRole(e.target.value)} />
              <input className="field" type="number" min={1} placeholder="Team size" value={leadTeamSize} onChange={(e) => setLeadTeamSize(Number(e.target.value || 1))} />
            </div>
            <div style={{ display: "flex", gap: 10, marginTop: 14 }}>
              <button className="cta" onClick={saveLead} disabled={leadState === "saving"}>{leadState === "saving" ? "Saving..." : "Save & Continue"}</button>
              <button className="btn-ghost" onClick={() => setLeadOpen(false)}>Close</button>
            </div>
            {leadState === "saved" ? <p style={{ color: "#9dff56" }}>Saved. We captured your lead successfully.</p> : null}
            {leadState === "error" ? <p style={{ color: "#ff9d9d" }}>Could not save lead. Please retry.</p> : null}
          </div>
        </section>
      ) : null}
    </>
  );
}
