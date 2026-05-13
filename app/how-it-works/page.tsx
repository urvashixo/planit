import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";

export default function HowItWorksPage() {
  return (
    <main>
      <SiteHeader />
      <section className="shell" style={{ paddingTop: 56, paddingBottom: 28 }}>
        <span className="kicker">PLANIT ENGINE FLOW</span>
        <h1 className="headline" style={{ fontSize: "clamp(42px, 5vw, 72px)", marginBottom: 10 }}>How Results Are Calculated</h1>
        <p className="sub" style={{ maxWidth: 900 }}>
          In short: Planit combines deterministic pricing math with use-case intelligence and team-fit scoring,
          then generates a founder-readable recommendation.
        </p>
      </section>

      <section className="shell" style={{ paddingBottom: 32 }}>
        <div className="flow-grid">
          <article className="card flow-step">
            <h3>1) Input</h3>
            <p>Team size, primary use case, tools, plans, seats, monthly spend, API spend, compliance needs.</p>
          </article>
          <div className="flow-arrow">-&gt;</div>
          <article className="card flow-step">
            <h3>2) Pricing Match</h3>
            <p>Map each tool to verified pricing entries from <code>PRICING_DATA.md</code> and pricing config.</p>
          </article>
          <div className="flow-arrow">-&gt;</div>
          <article className="card flow-step">
            <h3>3) Efficiency Checks</h3>
            <p>Detect overbuy, oversized enterprise use, same-vendor downgrade, API-vs-seat opportunities.</p>
          </article>
          <div className="flow-arrow">-&gt;</div>
          <article className="card flow-step">
            <h3>4) Strategy Layer</h3>
            <p>Compare best vendor and hybrid stack by use-case fit, startup practicality, and team fit.</p>
          </article>
          <div className="flow-arrow">-&gt;</div>
          <article className="card flow-step">
            <h3>5) Score + Output</h3>
            <p>Final weighted score: 40% cost, 35% use-case fit, 15% team fit, 10% operational practicality.</p>
          </article>
        </div>
      </section>

      <section className="shell card" style={{
     marginBottom: 20,
    padding: "28px 32px",
    maxWidth: "1200px"
      }}>
        <h2 style={{ marginTop: 0 }}>Output You See</h2>
        <p className="sub" style={{ fontSize: 18 }}>
          Same-vendor fix, best-vendor fix, hybrid option, monthly/annual savings, confidence score, and recommendation type.
        </p>
        <Link href="/audit" className="cta" style={{ display: "inline-block", marginTop: 10 }}>Run Free Audit</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
