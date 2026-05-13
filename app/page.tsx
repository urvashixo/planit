import Link from "next/link";
import { SiteFooter, SiteHeader } from "./components";

export default function HomePage() {
  return (
    <main>
      <SiteHeader />

      {/* HERO */}
      <section
        className="shell hero"
        style={{
          marginBottom: 40
        }}
      >
        <div>
          <span className="kicker">FINANCE-GRADE AI AUDITING</span>

          <h1 className="headline">Stop Overpaying for AI Tools</h1>

          <p className="sub">
            Planit audits your AI stack, quantifies wasted spend, and shows
            vendor-level savings opportunities in minutes.
          </p>

          <div className="hero-actions">
            <Link className="cta" href="/audit">
              Run Free Spend Audit
            </Link>

            <Link className="btn-ghost" href="/results">
              View Sample Report
            </Link>
          </div>
        </div>

        <div className="panel">
          <div
            style={{
              color: "#d7dacc",
              fontFamily: "IBM Plex Mono, monospace"
            }}
          >
            TOTAL WASTE FOUND
          </div>

          <div
            style={{
              fontSize: 46,
              fontWeight: 700,
              color: "var(--acid)",
              marginTop: 6
            }}
          >
            $12,482.00
          </div>

          <div className="bar-graph">
            <div className="bar" style={{ height: 88 }} />
            <div className="bar" style={{ height: 120 }} />
            <div className="bar" style={{ height: 72 }} />
            <div className="bar" style={{ height: 142 }} />
            <div className="bar" style={{ height: 84 }} />
          </div>
        </div>
      </section>

      {/* MAIN SPLIT SECTION */}
      <section
        className="shell"
        style={{
          display: "grid",
          gridTemplateColumns: "2fr 1fr",
          gap: 20,
          alignItems: "stretch",
          marginBottom: 40
        }}
      >
        {/* LEFT CARD */}
        <div
          className="card"
          style={{
            padding: "22px 22px",
            height: "100%"
          }}
        >
          <h2 style={{ marginTop: 0 }}>
            Real-Time Anomaly Detection
          </h2>

          <p
            className="sub"
            style={{
              fontSize: 18,
              marginBottom: 20
            }}
          >
            Our AI engine scans your transaction logs to identify ghost
            subscriptions, redundant tool seats, and hidden price hikes.
          </p>

          <div
            className="card"
            style={{
              marginTop: 0,
              padding: "18px 22px"
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between"
              }}
            >
              <span>OpenAI Enterprise</span>
              <span style={{ color: "#ff8b8b" }}>Unused seats</span>
            </div>

            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginTop: 10
              }}
            >
              <span>Midjourney</span>
              <span style={{ color: "#9dff56" }}>Optimized</span>
            </div>
          </div>
        </div>

        {/* RIGHT CARD */}
        <aside
          className="card"
          style={{
            background: "var(--acid)",
            color: "#13180a",
            padding: "22px 22px",
            height: "100%"
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 14
            }}
          >
            Quantify Your Savings
          </h2>

          <p style={{ lineHeight: 1.45 }}>
            On average, Planit customers discover $8,400 in annual waste
            within the first 10 minutes.
          </p>

          <div
            style={{
              fontSize: 42,
              fontWeight: 700,
              marginTop: 34
            }}
          >
            31%
          </div>

          <Link
            className="btn-ghost"
            href="/audit"
            style={{
              display: "inline-block",
              marginTop: 18,
              borderColor: "#253000",
              color: "#0d1006"
            }}
          >
            Start Audit Now
          </Link>
        </aside>
      </section>

      {/* FOOTER CTA */}
      <section
        className="shell footer-cta"
        style={{
          textAlign: "center",
          marginBottom: 32,
          padding: "48px 28px"
        }}
      >
        <h2
          style={{
            marginTop: 0,
            fontSize: "clamp(42px, 5vw, 72px)"
          }}
        >
          Ready to cut your AI waste?
        </h2>

        <p
          className="sub"
          style={{
            margin: "0 auto",
            maxWidth: 620
          }}
        >
          Get your free audit report today and see exactly where your
          budget is leaking.
        </p>

        <Link
          className="cta"
          href="/audit"
          style={{
            display: "inline-block",
            marginTop: 24
          }}
        >
          Start Your Audit
        </Link>
      </section>

      <SiteFooter />
    </main>
  );
}