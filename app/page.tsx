import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell hero">
        <div>
          <span className="kicker">FINANCE-GRADE AI AUDITING</span>
          <h1 className="headline">Stop Overpaying for AI Tools</h1>
          <p className="sub">Planit audits your AI stack, quantifies wasted spend, and shows vendor-level savings opportunities in minutes.</p>
          <div className="hero-actions">
            <Link className="cta" href="/audit">Run Free Spend Audit</Link>
            <Link className="btn-ghost" href="/results">View Sample Report</Link>
          </div>
        </div>

        <div className="panel">
          <div style={{ color: "#d7dacc", fontFamily: "IBM Plex Mono, monospace" }}>TOTAL WASTE FOUND</div>
          <div style={{ fontSize: 46, fontWeight: 700, color: "var(--acid)", marginTop: 6 }}>$12,482.00</div>
          <div className="bar-graph">
            <div className="bar" style={{ height: 88 }} />
            <div className="bar" style={{ height: 120 }} />
            <div className="bar" style={{ height: 72 }} />
            <div className="bar" style={{ height: 142 }} />
            <div className="bar" style={{ height: 84 }} />
          </div>
        </div>
      </section>

      <section className="shell split section">
        <div className="card">
          <h2>Real-Time Anomaly Detection</h2>
          <p className="sub" style={{ fontSize: 18 }}>Our AI engine scans your transaction logs to identify ghost subscriptions, redundant tool seats, and hidden price hikes.</p>
          <div className="card" style={{ marginTop: 18 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}><span>OpenAI Enterprise</span><span style={{ color: "#ff8b8b" }}>Unused seats</span></div>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 8 }}><span>Midjourney</span><span style={{ color: "#9dff56" }}>Optimized</span></div>
          </div>
        </div>
        <aside className="card" style={{ background: "var(--acid)", color: "#13180a" }}>
          <h2 style={{ marginTop: 0 }}>Quantify Your Savings</h2>
          <p>On average, Planit customers discover $8,400 in annual waste within the first 10 minutes.</p>
          <div style={{ fontSize: 42, fontWeight: 700, marginTop: 40 }}>31%</div>
          <Link className="btn-ghost" href="/audit" style={{ display: "inline-block", marginTop: 16, borderColor: "#253000", color: "#0d1006" }}>Start Audit Now</Link>
        </aside>
      </section>

      <section className="shell faq" style={{ textAlign: "center" }}>
        <h2>Frequently Asked Questions</h2>
        <div className="faq-item" style={{ textAlign: "center" }}>How does Planit access my spending data?</div>
        <div className="faq-item" style={{ textAlign: "center" }}>Is the audit really free?</div>
        <div className="faq-item" style={{ textAlign: "center" }}>What tools can you identify?</div>
      </section>

      <section className="shell footer-cta" style={{ textAlign: "center" }}>
        <h2 style={{ marginTop: 0, fontSize: 54 }}>Ready to cut your AI waste?</h2>
        <p className="sub" style={{ margin: "0 auto", maxWidth: 620 }}>Get your free audit report today and see exactly where your budget is leaking.</p>
        <Link className="cta" href="/audit" style={{ display: "inline-block", marginTop: 24 }}>Start Your Audit</Link>
      </section>
      <SiteFooter />
    </main>
  );
}
