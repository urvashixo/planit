import { Suspense } from "react";
import { SiteFooter, SiteHeader } from "../components";
import ResultsClient from "./ResultsClient";

export default function ResultsPage() {
  return (
    <main>
      <SiteHeader />
      <Suspense fallback={<section className="shell" style={{ paddingTop: 60 }}>Loading audit report...</section>}>
        <ResultsClient />
      </Suspense>
      <SiteFooter />
    </main>
  );
}
