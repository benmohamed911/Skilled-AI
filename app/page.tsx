import Link from "next/link";
import { Bar, Check, Disclaimer, Logo, Ring, Spark } from "@/components/ui";
import { FREE_TESTS_PER_MONTH, PRO_PRICE, TRACK } from "@/lib/exam";

const sample = [
  { name: "Prepare the data", pct: 84 },
  { name: "Model the data", pct: 58 },
  { name: "Visualize and analyze", pct: 79 },
  { name: "Manage and secure", pct: 71 },
];

export default function Landing() {
  return (
    <>
      <header className="hero">
        <div className="wrap">
          <div className="nav">
            <Logo />
            <nav className="nav-links">
              <a href="#product">Product</a>
              <a href="#how">How it works</a>
              <a href="#pricing">Pricing</a>
            </nav>
            <div className="nav-cta">
              <Link href="/login">Sign in</Link>
              <Link href="/signup" className="btn btn-orange btn-sm">Start free</Link>
            </div>
          </div>
          <div className="hero-grid">
            <div>
              <span className="eyebrow">AI certification &amp; skills intelligence</span>
              <h1>Know your skills. Prove your readiness.</h1>
              <p className="hero-sub">
                Realistic {TRACK.code} exam practice, skill gap analysis by exam area and an AI study plan that
                tells you exactly what to fix before exam day.
              </p>
              <div className="hero-btns">
                <Link href="/signup" className="btn btn-orange">Take a free readiness test</Link>
                <a href="#pricing" className="btn btn-ghost-dark">See pricing</a>
              </div>
              <p className="small" style={{ color: "#a9b7d0" }}>No credit card needed · Results in under 30 minutes</p>
            </div>
            <div className="hero-card">
              <div className="hero-card-top">
                <div>
                  <div className="small muted">{TRACK.code} · {TRACK.name}</div>
                  <h3 style={{ fontSize: 20, marginTop: 4 }}>Exam readiness</h3>
                </div>
                <span className="pill pill-green">Example</span>
              </div>
              <div className="ring-row">
                <Ring pct={74} label="readiness" />
                <div>
                  {sample.map((d) => (
                    <div className="mini-row" key={d.name}>
                      <div><span>{d.name}</span><b style={{ color: d.pct < 65 ? "#b4470a" : undefined }}>{d.pct}%</b></div>
                      <Bar pct={d.pct} low={d.pct < 65} />
                    </div>
                  ))}
                </div>
              </div>
              <div className="insight">
                <Spark />
                <span><b>AI insight:</b> You lose most points on CALCULATE and time-intelligence questions. A
                  45-minute focused session on filter context should lift “Model the data” above 70%.</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="strip">
        <div className="wrap">
          <span className="label">Exam tracks</span>
          <span>Microsoft {TRACK.code}</span>
          <span className="muted" style={{ fontWeight: 500 }}>More tracks coming soon</span>
        </div>
      </div>

      <section className="section white" id="product">
        <div className="wrap">
          <div className="kicker">Two products, one engine</div>
          <h2>The same assessment intelligence, built for learners and for the organizations that rely on them.</h2>
          <div className="two">
            <div className="product">
              <h3><span className="icon-box"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#202afa" strokeWidth="2" strokeLinecap="round"><circle cx="12" cy="8" r="3.5" /><path d="M5 20c.8-3.5 3.5-5.5 7-5.5s6.2 2 7 5.5" /></svg></span>Skilld AI Individual</h3>
              <p className="muted">Self-service preparation for the {TRACK.code} certification. Practise under real exam conditions and watch your readiness climb.</p>
              <ul className="checks">
                {["Timed exam simulations", "Skill gap analysis for every exam area", "Personalized AI study plan", "Readiness tracked over time"].map((t) => (
                  <li key={t}><Check />{t}</li>
                ))}
              </ul>
              <Link href="/signup" className="link">Start free →</Link>
            </div>
            <div className="product dark">
              <h3><span className="icon-box"><svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#ff7a1a" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3.5" y="7.5" width="17" height="12" rx="2" /><path d="M9 7.5V5.5h6v2M3.5 12.5h17" /></svg></span>Skilld AI Business <span className="pill pill-orange" style={{ marginLeft: 4 }}>Coming soon</span></h3>
              <p>For training centers, universities, recruiters and enterprises. Assess candidates and employees, then decide with data.</p>
              <ul className="checks">
                {["Pre-hire technical assessments", "Department skill heatmaps", "Before / after training effectiveness", "Exportable reports and role-based access"].map((t) => (
                  <li key={t}><Check color="#ff7a1a" />{t}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="section" id="how">
        <div className="wrap">
          <h2 style={{ marginTop: 0 }}>How Skilld AI works</h2>
          <div className="three">
            {[
              ["01", "Assess", "Take a quick practice test or a full exam simulation that follows the official exam areas and timing."],
              ["02", "Analyze", "Every answer maps to an exam area and a specific skill, so gaps show up exactly where they are — not as one blunt score."],
              ["03", "Improve", "The AI builds a study plan around your weakest skills. Re-test until your readiness is where it needs to be."],
            ].map(([n, t, d]) => (
              <div className="card step" key={n}><div className="num">{n}</div><h3>{t}</h3><p className="muted">{d}</p></div>
            ))}
          </div>
        </div>
      </section>

      <section className="section white" id="pricing">
        <div className="wrap">
          <h2 style={{ marginTop: 0 }}>Simple plans</h2>
          <p className="muted" style={{ marginTop: 12, fontSize: 17 }}>Start free, upgrade when you are ready to go deep.</p>
          <div className="three">
            <div className="card plan">
              <h3>Free</h3>
              <div className="price">$0</div>
              <p className="muted">{FREE_TESTS_PER_MONTH} practice tests a month, readiness score and your top-3 skill gaps.</p>
              <Link href="/signup" className="btn btn-ghost btn-block">Start free</Link>
            </div>
            <div className="card plan pop">
              <span className="badge">Most popular</span>
              <h3>Pro</h3>
              <div className="price">${PRO_PRICE} <small>/month</small></div>
              <p className="muted">Unlimited practice tests, full-length timed simulations, full gap analysis, AI study plan and readiness history.</p>
              <Link href="/signup?plan=pro" className="btn btn-orange btn-block">Go Pro</Link>
            </div>
            <div className="card plan off">
              <h3>Business</h3>
              <div className="price">Coming soon</div>
              <p className="muted">Seats, candidate assessments, custom question banks, team analytics and reports.</p>
              <button className="btn btn-navy btn-block" disabled>Not available yet</button>
            </div>
          </div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap">
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Logo /> <span>Know your skills. Prove your readiness.</span>
          </div>
          <div style={{ display: "flex", gap: 22 }}>
            <Link href="/legal#terms">Terms</Link>
            <Link href="/legal#privacy">Privacy</Link>
            <span>© {new Date().getFullYear()} Skilld AI</span>
          </div>
          <p className="legal"><Disclaimer /></p>
        </div>
      </footer>
    </>
  );
}
