"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import AppShell, { useSession } from "@/components/AppShell";
import { Bar, Spark } from "@/components/ui";
import { DOMAINS, MODES, TRACK } from "@/lib/exam";
import { readiness } from "@/lib/store";
import type { Attempt } from "@/lib/types";

const fmt = (iso: string) => new Date(iso).toLocaleDateString("en-GB", { day: "numeric", month: "short" });

function Trend({ attempts }: { attempts: Attempt[] }) {
  const pts = [...attempts].slice(0, 10).reverse();
  const W = 600, H = 200, x = (i: number) => (pts.length === 1 ? W / 2 : (i / (pts.length - 1)) * W), y = (p: number) => H - (p / 100) * H;
  const line = pts.map((a, i) => `${i ? "L" : "M"}${x(i).toFixed(1)},${y(a.pct).toFixed(1)}`).join(" ");
  return (
    <>
      <svg viewBox={`-6 -6 ${W + 12} ${H + 12}`} width="100%" style={{ display: "block" }} role="img" aria-label="Score for each attempt, oldest to newest">
        {[0, 50, 100].map((g) => <line key={g} x1="0" x2={W} y1={y(g)} y2={y(g)} stroke="#e7ebf3" />)}
        {pts.length > 1 && <path d={`${line} L${W},${H} L0,${H} Z`} fill="#202afa" opacity=".1" />}
        {pts.length > 1 && <path d={line} fill="none" stroke="#202afa" strokeWidth="3" strokeLinejoin="round" />}
        <line x1="0" x2={W} y1={y(TRACK.passPct)} y2={y(TRACK.passPct)} stroke="#ff7a1a" strokeWidth="2" strokeDasharray="7 6" />
        {pts.map((a, i) => <circle key={a.id} cx={x(i)} cy={y(a.pct)} r="5" fill="#fff" stroke="#202afa" strokeWidth="3"><title>{fmt(a.date)}: {a.pct}%</title></circle>)}
      </svg>
      <div className="small muted" style={{ display: "flex", gap: 20, marginTop: 14 }}>
        <span><b style={{ color: "#202afa" }}>—</b> Your score</span>
        <span><b style={{ color: "#ff7a1a" }}>- -</b> Passing mark {TRACK.passPct}%</span>
      </div>
    </>
  );
}

export default function Dashboard() {
  const session = useSession();
  const router = useRouter();
  if (!session) return null;
  const { user, attempts, plan } = session;
  const latest = attempts[0];
  const ready = readiness(attempts);
  const prev = readiness(attempts.slice(1));
  const avg = attempts.length ? Math.round(attempts.reduce((s, a) => s + a.pct, 0) / attempts.length) : 0;
  const answered = attempts.reduce((s, a) => s + a.total, 0);

  // Area performance across the three most recent attempts
  const domains = DOMAINS.map((d) => {
    const rs = attempts.slice(0, 3).flatMap((a) => a.domains.filter((x) => x.id === d.id));
    const total = rs.reduce((s, r) => s + r.total, 0), correct = rs.reduce((s, r) => s + r.correct, 0);
    return { ...d, pct: total ? Math.round((correct / total) * 100) : 0 };
  });

  return (
    <AppShell session={session}>
      <div className="page-head">
        <div>
          <div className="muted">{new Date().toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" })}</div>
          <h1>Welcome{attempts.length ? " back" : ""}, {user.name}</h1>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <span className="pill pill-blue">{TRACK.code} · {TRACK.name}</span>
          <span className="avatar">{user.name.slice(0, 2).toUpperCase()}</span>
        </div>
      </div>

      {!latest ? (
        <div className="card empty">
          <h2>Find out how ready you are</h2>
          <p>Take a {MODES.practice.minutes}-minute practice test. You will get a readiness score, a breakdown by exam area and the skills to fix first.</p>
          <Link href="/exam" className="btn btn-orange">Take your first practice test</Link>
        </div>
      ) : (
        <>
          <div className="stats">
            <div className="card stat dark">
              <div className="k">Readiness score</div>
              <div className="v">{ready}%</div>
              <div className="d">{prev === null ? "Based on your first test" : `${ready! - prev >= 0 ? "+" : ""}${ready! - prev} pts since your previous test`}</div>
            </div>
            <div className="card stat"><div className="k">Exams taken</div><div className="v">{attempts.length}</div><div className="muted small">{answered} questions answered</div></div>
            <div className="card stat"><div className="k">Average score</div><div className="v">{avg}%</div><div className="muted small">Passing mark {TRACK.passPct}%</div></div>
            <div className="card stat"><div className="k">Latest result</div><div className="v">{latest.pct}%</div><div className="muted small">{latest.passed ? "Above" : "Below"} the passing mark · {fmt(latest.date)}</div></div>
          </div>

          <div className="grid-2">
            <div className="card">
              <div className="card-head"><h2>Readiness over time</h2><span className="muted small">Last {Math.min(10, attempts.length)} test{attempts.length > 1 ? "s" : ""}</span></div>
              <Trend attempts={attempts} />
            </div>
            <div className="card">
              <div className="card-head"><h2>Performance by exam area</h2></div>
              {domains.map((d) => (
                <div className="dom" key={d.id}>
                  <div className="dom-top"><span>{d.name}</span><b className={d.pct < TRACK.passPct ? "low" : ""}>{d.pct}%</b></div>
                  <Bar pct={d.pct} low={d.pct < TRACK.passPct} />
                  <div className="muted small" style={{ marginTop: 6 }}>{d.weight} of exam</div>
                </div>
              ))}
            </div>
          </div>

          <div className="grid-2" style={{ gridTemplateColumns: "1fr 1.15fr" }}>
            <div className="card">
              <div className="card-head"><h2 style={{ display: "flex", gap: 10, alignItems: "center" }}><Spark />{latest.plan?.source === "ai" ? "AI study plan" : plan === "pro" ? "Study plan" : "Your top skill gaps"}</h2></div>
              {latest.plan?.steps.length ? latest.plan.steps.slice(0, 3).map((s, i) => (
                <div className="plan-step" key={i}>
                  <span className="n">0{i + 1}</span>
                  <div><h3>{s.title}</h3><p>{s.why}</p></div>
                  <span className="t">{s.minutes} min</span>
                </div>
              )) : <p className="muted" style={{ marginBottom: 16 }}>{latest.plan?.summary ?? "Open your latest result to see what to study next."}</p>}
              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <Link href="/exam" className="btn btn-orange">Start exam simulation</Link>
                <Link href={`/results/${latest.id}`} className="btn btn-ghost">View full analysis</Link>
              </div>
            </div>
            <div className="card">
              <div className="card-head"><h2>Recent attempts</h2></div>
              <table>
                <thead><tr><th>Date</th><th>Type</th><th>Questions</th><th>Score</th><th>Result</th></tr></thead>
                <tbody>
                  {attempts.slice(0, 6).map((a) => (
                    <tr key={a.id} className="click" onClick={() => router.push(`/results/${a.id}`)}>
                      <td>{fmt(a.date)}</td><td>{MODES[a.mode].label}</td><td>{a.total}</td><td><b>{a.pct}%</b></td>
                      <td><span className={"pill " + (a.passed ? "pill-green" : "pill-orange")}>{a.passed ? "Pass" : "Below pass"}</span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </AppShell>
  );
}
