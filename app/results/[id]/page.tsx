"use client";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import AppShell, { useSession } from "@/components/AppShell";
import { Bar, Spark } from "@/components/ui";
import { MODES, TRACK, domainName } from "@/lib/exam";
import { getAttempt } from "@/lib/store";
import type { Attempt } from "@/lib/types";

export default function ResultPage() {
  const session = useSession();
  const { id } = useParams<{ id: string }>();
  const [a, setA] = useState<Attempt | null | undefined>(undefined);
  const [onlyWrong, setOnlyWrong] = useState(true);
  useEffect(() => { setA(getAttempt(id)); }, [id]);
  if (!session || a === undefined) return null;
  if (!a) {
    return (
      <AppShell session={session}>
        <div className="card empty"><h2>Result not found</h2><p>This result is not saved in this browser.</p><Link href="/dashboard" className="btn btn-navy">Back to dashboard</Link></div>
      </AppShell>
    );
  }
  const pro = session.plan === "pro";
  const mins = Math.floor(a.seconds / 60), secs = a.seconds % 60;
  const wrong = a.review.filter((r) => r.yours !== r.right);
  const shown = onlyWrong ? wrong : a.review;

  return (
    <AppShell session={session}>
      <div className="card result-hero">
        <div>
          <div className="muted small" style={{ fontWeight: 600 }}>Your result · {MODES[a.mode].label}</div>
          <div className="big">{a.pct}%</div>
        </div>
        <div style={{ flex: 1, minWidth: 240 }}>
          <span className={"pill " + (a.passed ? "pill-green" : "pill-orange")}>{a.passed ? "Above the passing mark" : "Below the passing mark"}</span>
          <p style={{ marginTop: 10 }}>{a.correct} of {a.total} correct · Time used {mins}m {String(secs).padStart(2, "0")}s · Passing mark {TRACK.passPct}%</p>
        </div>
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Link href="/exam" className="btn btn-orange">Take another test</Link>
          <Link href="/dashboard" className="btn btn-ghost">Back to dashboard</Link>
        </div>
      </div>

      <div className="grid-2" style={{ gridTemplateColumns: "1fr 1.2fr" }}>
        <div className="card">
          <div className="card-head"><h2>Breakdown by exam area</h2></div>
          {a.domains.map((d) => (
            <div className="dom" key={d.id}>
              <div className="dom-top"><span>{d.name}</span><b className={d.pct < TRACK.passPct ? "low" : ""}>{d.correct}/{d.total} · {d.pct}%</b></div>
              <Bar pct={d.pct} low={d.pct < TRACK.passPct} />
            </div>
          ))}
        </div>
        <div className="card">
          <div className="card-head">
            <h2 style={{ display: "flex", gap: 10, alignItems: "center" }}><Spark />{a.plan?.source === "ai" ? "AI skill gap analysis" : pro ? "Skill gap analysis" : "Your top 3 skill gaps"}</h2>
          </div>
          {a.plan ? (
            <>
              <p style={{ marginBottom: 16 }}>{a.plan.summary}</p>
              {a.plan.steps.map((s, i) => (
                <div className="plan-step" key={i}>
                  <span className="n">0{i + 1}</span>
                  <div><h3>{s.title}</h3><p>{s.why}</p></div>
                  <span className="t">{s.minutes} min</span>
                </div>
              ))}
            </>
          ) : <p className="muted">No study plan was saved for this attempt.</p>}
          {!pro && a.gaps.length > 0 && (
            <div className="locked">
              <p style={{ marginBottom: 12 }}><b>Pro</b> gives you the full gap analysis{a.gaps.length > 3 ? ` (${a.gaps.length - 3} more skills to fix)` : ""} and a personalized AI study plan.</p>
              <Link href="/upgrade" className="btn btn-orange btn-sm">Upgrade to Pro</Link>
            </div>
          )}
        </div>
      </div>

      <div className="card" style={{ marginTop: 18 }}>
        <div className="card-head">
          <h2>Answer review</h2>
          <button className="btn btn-ghost btn-sm" onClick={() => setOnlyWrong(!onlyWrong)}>{onlyWrong ? `Show all ${a.total} questions` : `Show only missed (${wrong.length})`}</button>
        </div>
        {!shown.length && <p className="muted">Nothing missed — every answer was correct.</p>}
        {shown.map((r) => {
          const ok = r.yours === r.right;
          return (
            <div className="rev" key={r.id}>
              <div className="rev-top"><span>Q{a.review.indexOf(r) + 1} · {domainName(r.domain)} · {r.topic}</span><span className={"pill " + (ok ? "pill-green" : "pill-orange")}>{ok ? "Correct" : r.yours === null ? "Not answered" : "Incorrect"}</span></div>
              <h3>{r.text}</h3>
              <p className="ans">
                {!ok && <>Your answer: <b>{r.yours === null ? "none" : r.options[r.yours]}</b><br /></>}
                Correct answer: <b style={{ color: "#0e6b3a" }}>{r.options[r.right]}</b>
              </p>
              <p className="why">{r.why}</p>
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
