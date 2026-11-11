"use client";
import AppShell, { useSession } from "@/components/AppShell";
import { Check } from "@/components/ui";
import { FREE_TESTS_PER_MONTH, PRO_PRICE } from "@/lib/exam";

export default function Upgrade() {
  const session = useSession();
  if (!session) return null;
  const pro = session.plan === "pro";

  return (
    <AppShell session={session}>
      <div className="page-head"><div><div className="muted">Plan &amp; billing</div><h1>{pro ? "You are on Pro" : "Upgrade to Pro"}</h1></div></div>
      <div className="choice">
        <div className="card">
          <h2 style={{ fontSize: 22 }}>Free {!pro && <span className="pill pill-blue">Current plan</span>}</h2>
          <div className="price">$0</div>
          <ul className="checks" style={{ margin: "0 0 20px" }}>
            {[`${FREE_TESTS_PER_MONTH} practice tests a month`, "Readiness score", "Top-3 skill gaps", "Answer explanations"].map((t) => <li key={t}><Check />{t}</li>)}
          </ul>
        </div>
        <div className="card" style={{ border: "2px solid var(--blue)" }}>
          <h2 style={{ fontSize: 22 }}>Pro {pro && <span className="pill pill-green">Current plan</span>}</h2>
          <div className="price">${PRO_PRICE} <small>/month</small></div>
          <ul className="checks" style={{ margin: "0 0 20px" }}>
            {["Unlimited practice tests", "Full-length timed simulations", "Full skill gap analysis", "Personalized AI study plan", "Readiness history"].map((t) => <li key={t}><Check />{t}</li>)}
          </ul>
          {!pro && (
            <>
              <p className="notice" style={{ flex: "none", color: "var(--ink)" }}>Card payments are not open yet. Pro will be available to buy here soon.</p>
              <button className="btn btn-orange" disabled>Go Pro — coming soon</button>
            </>
          )}
        </div>
      </div>
    </AppShell>
  );
}
