"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import AppShell, { useSession } from "@/components/AppShell";
import { Bar } from "@/components/ui";
import { FREE_TESTS_PER_MONTH, MODES, TRACK, domainName, modeTotal } from "@/lib/exam";
import { freeTestsLeft, saveAttempt } from "@/lib/store";
import type { Attempt, Mode, PublicQuestion, StudyPlan } from "@/lib/types";

interface Running {
  mode: Mode;
  questions: PublicQuestion[];
  answers: Record<string, number | null>;
  flags: string[];
  idx: number;
  startedAt: number;
  endsAt: number;
}
const KEY = "skilld.exam";
const loadRunning = (): Running | null => {
  try { return JSON.parse(sessionStorage.getItem(KEY) || "null"); } catch { return null; }
};
const mmss = (s: number) => `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;

export default function ExamPage() {
  const session = useSession();
  const router = useRouter();
  const [run, setRun] = useState<Running | null>(null);
  const [now, setNow] = useState(() => Date.now());
  const [busy, setBusy] = useState("");
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const submitting = useRef(false);

  // Resume an exam in progress (for example after a page refresh)
  useEffect(() => { setRun(loadRunning()); }, []);
  useEffect(() => {
    try { run ? sessionStorage.setItem(KEY, JSON.stringify(run)) : sessionStorage.removeItem(KEY); } catch {}
  }, [run]);
  useEffect(() => {
    if (!run) return;
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, [run]);

  const submit = useCallback(async () => {
    if (!run || submitting.current) return;
    submitting.current = true;
    setConfirm(false);
    setBusy("Scoring your exam…");
    try {
      const seconds = Math.round((Math.min(Date.now(), run.endsAt) - run.startedAt) / 1000);
      const res = await fetch("/api/exam/submit", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ mode: run.mode, ids: run.questions.map((q) => q.id), answers: run.answers, seconds }),
      });
      if (!res.ok) throw new Error();
      const attempt: Attempt = { ...(await res.json()), id: crypto.randomUUID(), date: new Date().toISOString() };
      saveAttempt(attempt); // save the score first so it is never lost
      setBusy("Building your study plan…");
      try {
        const p = await fetch("/api/study-plan", {
          method: "POST", headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ plan: session?.plan, pct: attempt.pct, domains: attempt.domains, gaps: attempt.gaps }),
        });
        if (p.ok) saveAttempt({ ...attempt, plan: (await p.json()) as StudyPlan });
      } catch { /* the result page still works without a plan */ }
      setRun(null);
      try { sessionStorage.removeItem(KEY); } catch {}
      router.push(`/results/${attempt.id}`);
    } catch {
      setError("We could not submit your exam. Check your connection and try again — your answers are still here.");
      setBusy("");
      submitting.current = false;
    }
  }, [run, router, session?.plan]);

  const left = run ? Math.max(0, Math.ceil((run.endsAt - now) / 1000)) : 0;
  useEffect(() => { if (run && left === 0 && !error) submit(); }, [run, left, submit, error]);

  if (!session) return null;

  async function start(mode: Mode) {
    setError(""); setBusy("Preparing your exam…");
    try {
      const res = await fetch("/api/exam/start", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ mode }) });
      if (!res.ok) throw new Error();
      const data = (await res.json()) as { questions: PublicQuestion[]; minutes: number };
      const t = Date.now();
      setNow(t);
      setRun({ mode, questions: data.questions, answers: {}, flags: [], idx: 0, startedAt: t, endsAt: t + data.minutes * 60000 });
    } catch {
      setError("We could not start the exam. Please try again.");
    }
    setBusy("");
  }

  // ── Choose an exam ──
  if (!run) {
    const pro = session.plan === "pro";
    const testsLeft = freeTestsLeft(session.attempts);
    const blocked = !pro && testsLeft === 0;
    return (
      <AppShell session={session}>
        <div className="page-head"><div><div className="muted">{TRACK.code} · {TRACK.name}</div><h1>Exam simulations</h1></div></div>
        {error && <p className="error" style={{ marginBottom: 16 }}>{error}</p>}
        <div className="choice">
          <div className="card">
            <span className="pill pill-blue" style={{ alignSelf: "flex-start" }}>{pro ? "Unlimited" : `${testsLeft} of ${FREE_TESTS_PER_MONTH} left this month`}</span>
            <h2 style={{ fontSize: 23 }}>Practice test</h2>
            <p>{modeTotal("practice")} questions · {MODES.practice.minutes} minutes. A quick check across all four exam areas.</p>
            {blocked
              ? <Link href="/upgrade" className="btn btn-orange">Upgrade to keep practising</Link>
              : <button className="btn btn-orange" disabled={!!busy} onClick={() => start("practice")}>{busy || "Start practice test"}</button>}
          </div>
          <div className="card">
            <span className="pill pill-orange" style={{ alignSelf: "flex-start" }}>Pro</span>
            <h2 style={{ fontSize: 23 }}>Full simulation</h2>
            <p>{modeTotal("full")} questions · {MODES.full.minutes} minutes. Exam-length and timed like the real thing, with the areas weighted as in the official outline.</p>
            {pro
              ? <button className="btn btn-navy" disabled={!!busy} onClick={() => start("full")}>{busy || "Start full simulation"}</button>
              : <Link href="/upgrade" className="btn btn-ghost">Unlock with Pro</Link>}
          </div>
        </div>
        <p className="muted small" style={{ marginTop: 18 }}>The timer starts as soon as you begin. You can flag questions and come back to them before you submit.</p>
      </AppShell>
    );
  }

  // ── Exam in progress ──
  const q = run.questions[run.idx];
  const total = run.questions.length;
  const answered = run.questions.filter((x) => typeof run.answers[x.id] === "number").length;
  const flagged = run.flags.includes(q.id);
  const patch = (p: Partial<Running>) => setRun((r) => (r ? { ...r, ...p } : r));

  return (
    <div style={{ minHeight: "100vh" }}>
      <header className="exam-top">
        <div className="wrap">
          <div className="t"><small>Exam simulation · {MODES[run.mode].label}</small><b>{TRACK.code} · {TRACK.name}</b></div>
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <span className={"clock" + (left <= 120 ? " low" : "")} aria-label="Time remaining">{mmss(left)}</span>
            <button className="btn btn-orange" disabled={!!busy} onClick={() => setConfirm(true)}>{busy || "Submit exam"}</button>
          </div>
        </div>
      </header>
      <div className="wrap exam-body">
        <div className="card" style={{ padding: 36 }}>
          {error && <p className="error" style={{ marginBottom: 16 }}>{error}</p>}
          <div className="q-head"><span>Question {run.idx + 1} of {total}</span><span className="pill pill-blue">{domainName(q.domain)}</span></div>
          <Bar pct={((run.idx + 1) / total) * 100} />
          <h1 className="q-text">{q.text}</h1>
          {q.options.map((o, i) => (
            <button key={i} className={"opt" + (run.answers[q.id] === i ? " sel" : "")} aria-pressed={run.answers[q.id] === i}
              onClick={() => patch({ answers: { ...run.answers, [q.id]: run.answers[q.id] === i ? null : i } })}>
              <span className="key">{"ABCD"[i]}</span>{o}
            </button>
          ))}
          <div className="q-foot">
            <button className="btn btn-ghost" onClick={() => patch({ flags: flagged ? run.flags.filter((f) => f !== q.id) : [...run.flags, q.id] })}>
              {flagged ? "⚑ Flagged — remove flag" : "⚐ Flag for review"}
            </button>
            <div style={{ display: "flex", gap: 12 }}>
              <button className="btn btn-ghost" disabled={run.idx === 0} onClick={() => patch({ idx: run.idx - 1 })}>Previous</button>
              {run.idx < total - 1
                ? <button className="btn btn-navy" onClick={() => patch({ idx: run.idx + 1 })}>Next</button>
                : <button className="btn btn-orange" disabled={!!busy} onClick={() => setConfirm(true)}>Finish</button>}
            </div>
          </div>
        </div>
        <aside>
          <div className="card" style={{ padding: 22 }}>
            <h2 style={{ fontSize: 17 }}>Navigator</h2>
            <div className="navgrid">
              {run.questions.map((x, i) => (
                <button key={x.id} aria-label={`Question ${i + 1}`} onClick={() => patch({ idx: i })}
                  className={[typeof run.answers[x.id] === "number" ? "done" : "", run.flags.includes(x.id) ? "flag" : "", i === run.idx ? "cur" : ""].join(" ")}>{i + 1}</button>
              ))}
            </div>
            <div className="legend">
              <span><i style={{ background: "#1c2e50" }} />Answered</span>
              <span><i style={{ borderColor: "#ff7a1a" }} />Flagged for review</span>
              <span><i style={{ borderColor: "#202afa" }} />Current</span>
            </div>
          </div>
          <div className="card" style={{ padding: 22, marginTop: 16 }}>
            <div className="muted small" style={{ fontWeight: 600 }}>Progress</div>
            <div style={{ fontFamily: "var(--display)", fontSize: 30, fontWeight: 700 }}>{answered} / {total}</div>
            <div className="muted small">{run.flags.length} flagged · Passing mark {TRACK.passPct}%</div>
          </div>
        </aside>
      </div>
      {confirm && (
        <div className="modal-bg" onClick={() => setConfirm(false)}>
          <div className="modal" role="dialog" aria-modal="true" onClick={(e) => e.stopPropagation()}>
            <h2>Submit your exam?</h2>
            <p className="muted">
              {answered < total ? `You have ${total - answered} unanswered question${total - answered > 1 ? "s" : ""}; they will count as wrong. ` : "You have answered every question. "}
              {run.flags.length ? `${run.flags.length} flagged for review. ` : ""}You cannot change answers after submitting.
            </p>
            <div className="row">
              <button className="btn btn-ghost" onClick={() => setConfirm(false)}>Keep working</button>
              <button className="btn btn-orange" onClick={submit}>Submit exam</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
