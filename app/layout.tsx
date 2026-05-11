import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Planit - AI Spend Auditor",
  description: "Finance-grade AI spend auditing for high-velocity teams."
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
