"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./ui";
import { supabase } from "@/lib/store";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const signup = mode === "signup";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(mail)) return setError("Please enter a valid email address.");
    if (signup && password.length < 8) return setError("Choose a password with at least 8 characters.");
    if (!password) return setError("Please enter your password.");
    setBusy(true); setError("");
    const { data, error } = signup
      ? await supabase.auth.signUp({ email: mail, password, options: { data: { name: name.trim() || mail.split("@")[0] } } })
      : await supabase.auth.signInWithPassword({ email: mail, password });
    setBusy(false);
    if (error) {
      return setError(
        error.message === "Invalid login credentials" ? "That email and password do not match. Please try again."
        : error.message === "Email not confirmed" ? "Please confirm your email first, using the link we sent you."
        : error.message,
      );
    }
    if (!data.session) return setCheckEmail(true); // sign-up worked; the email must be confirmed first
    const wantsPro = new URLSearchParams(window.location.search).get("plan") === "pro";
    router.push(wantsPro ? "/upgrade" : "/dashboard");
  }

  if (checkEmail) {
    return (
      <main className="auth">
        <div className="auth-card">
          <Logo dark />
          <h1>Check your email</h1>
          <p className="muted">We sent a confirmation link to <b>{email.trim().toLowerCase()}</b>. Open it to activate your account, then sign in.</p>
          <Link href="/login" className="btn btn-navy btn-block" style={{ marginTop: 22 }}>Go to sign in</Link>
        </div>
      </main>
    );
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Logo dark />
        <h1>{signup ? "Create your free account" : "Welcome back"}</h1>
        <p className="muted">{signup ? "Take your first PL-300 readiness test in minutes." : "Sign in to continue your preparation."}</p>
        {signup && (
          <label className="field">Your name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" />
          </label>
        )}
        <label className="field">Email
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} autoComplete="email" required />
        </label>
        <label className="field">Password
          <input type="password" value={password} onChange={(e) => { setPassword(e.target.value); setError(""); }} autoComplete={signup ? "new-password" : "current-password"} required />
          {signup && <span className="small muted" style={{ fontWeight: 400 }}>At least 8 characters.</span>}
        </label>
        {error && <p className="error" role="alert" style={{ marginTop: 14 }}>{error}</p>}
        <button className="btn btn-orange btn-block" style={{ marginTop: 22 }} disabled={busy}>{busy ? "Please wait…" : signup ? "Create account" : "Sign in"}</button>
        <p className="small muted" style={{ marginTop: 18, textAlign: "center" }}>
          {signup ? <>Already have an account? <Link className="link" href="/login">Sign in</Link></> : <>New here? <Link className="link" href="/signup">Create a free account</Link></>}
        </p>
      </form>
    </main>
  );
}
