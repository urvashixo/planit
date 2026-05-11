import Link from "next/link";
import { SiteFooter, SiteHeader } from "../components";

export default function PricingPage() {
  return (
    <main>
      <SiteHeader />

      <section className="shell" style={{ paddingTop: 56, paddingBottom: 26 }}>
        <span className="kicker">PLANIT PRICING</span>
        <h1 className="headline" style={{ fontSize: "clamp(44px, 5vw, 74px)", marginBottom: 10 }}>Simple Pricing for Startup Teams</h1>
        <p className="sub" style={{ maxWidth: 880 }}>
          Planit pricing is separate from vendor spend. We use vendor pricing only for audit recommendations.
        </p>
      </section>

      <section className="shell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 16, marginBottom: 28 }}>
        <article className="card">
          <h3 style={{ marginTop: 0 }}>Free</h3>
          <p style={{ fontSize: 34, fontWeight: 700, margin: "8px 0" }}>Rs. 0!</p>
          <p className="sub" style={{ fontSize: 15 }}>Run audit, see savings, and get a basic report.</p>
          <ul style={{ paddingLeft: 18, color: "#cfd3c1", lineHeight: 1.7 }}>
            <li>Core spend analysis</li>
            <li>Same-vendor + best-vendor recommendation</li>
            <li>Shareable result link</li>
          </ul>
        </article>

        <article className="card" style={{ borderColor: "#4b5b1d", background: "linear-gradient(180deg, rgba(201,246,0,0.08), #121510)" }}>
          <h3 style={{ marginTop: 0 }}>Pro / Consult</h3>
          <p style={{ fontSize: 34, fontWeight: 700, margin: "8px 0", color: "var(--acid)" }}>Rs. Y</p>
          <p className="sub" style={{ fontSize: 15 }}>Full optimization plan with Credex advisory support.</p>
          <ul style={{ paddingLeft: 18, color: "#d9ddc8", lineHeight: 1.7 }}>
            <li>Hybrid stack strategy</li>
            <li>Priority founder review</li>
            <li>Savings implementation roadmap</li>
          </ul>
        </article>

        <article className="card">
          <h3 style={{ marginTop: 0 }}>Enterprise</h3>
          <p style={{ fontSize: 34, fontWeight: 700, margin: "8px 0" }}>Rs. Z</p>
          <p className="sub" style={{ fontSize: 15 }}>Compliance-heavy procurement optimization for multi-team orgs.</p>
          <ul style={{ paddingLeft: 18, color: "#cfd3c1", lineHeight: 1.7 }}>
            <li>Multi-team policy controls</li>
            <li>Procurement + finance workflows</li>
            <li>Dedicated success support</li>
          </ul>
        </article>
      </section>

      <section className="shell card" style={{ marginBottom: 40, textAlign: "center" }}>
        <h2 style={{ marginTop: 0 }}>Start with a Free Audit</h2>
        <p className="sub" style={{ maxWidth: 760, margin: "0 auto" }}>
          Find savings first, then decide whether you need advisory or enterprise procurement support.
        </p>
        <Link href="/audit" className="cta" style={{ display: "inline-block", marginTop: 18 }}>Run Free Audit</Link>
      </section>

      <SiteFooter />
    </main>
  );
}
