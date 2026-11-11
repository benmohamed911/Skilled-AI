"use client";

export default function ErrorPage({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <main className="auth">
      <div className="auth-card" style={{ textAlign: "center" }}>
        <h1 style={{ marginTop: 0 }}>Something went wrong</h1>
        <p className="muted" style={{ margin: "8px 0 22px" }}>{error.message || "Please try again."}</p>
        <button className="btn btn-navy" onClick={reset}>Try again</button>
      </div>
    </main>
  );
}
