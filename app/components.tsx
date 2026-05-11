import Link from "next/link";

export function SiteHeader() {
  return (
    <header className="topbar">
      <div className="shell topbar-inner">
        <Link href="/" className="logo">Planit</Link>
        <nav className="nav">
          <Link href="/how-it-works">How it Works</Link>
          <Link href="/pricing">Pricing</Link>
        </nav>
        <Link href="/audit" className="cta">Run Free Audit</Link>
      </div>
    </header>
  );
}

export function SiteFooter() {
  return (
    <footer className="shell footer">
      <span>Planit</span>
      <span>FAQ Privacy Policy Audit Terms Contact</span>
      <span>2024 Planit by Credex</span>
    </footer>
  );
}
