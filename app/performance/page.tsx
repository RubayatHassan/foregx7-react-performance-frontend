import type { Metadata } from "next";
import Link from "next/link";
import { PerformanceLab } from "@/components/performance-lab";

export const metadata: Metadata = {
  title: "Performance lab | Pace",
  description: "Explore virtualized courier lists with 1,000 representative records.",
};

export default function PerformancePage() {
  return (
    <>
      <div className="performance-nav">
        <Link className="brand" href="/">
          <span className="brand-symbol">↗</span>
          pace
        </Link>
        <Link className="text-link" href="/docs">
          API documentation
        </Link>
      </div>
      <main className="performance-page">
        <header className="performance-heading">
          <div>
            <span className="eyebrow">Performance sample</span>
            <h1>Large data, kept responsive.</h1>
            <p>Two representative 1,000-record directories use the same virtualized lists as the dashboard.</p>
          </div>
          <span className="performance-count">2,000 records</span>
        </header>
        <PerformanceLab />
      </main>
    </>
  );
}
