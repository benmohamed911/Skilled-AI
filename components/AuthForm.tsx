"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Logo } from "./ui";
import { signIn } from "@/lib/store";

export default function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const signup = mode === "signup";

  function submit(e: React.FormEvent) {
    e.preventDefault();
    const mail = email.trim().toLowerCase();
    if (!/^\S+@\S+\.\S+$/.test(mail)) return setError("Please enter a valid email address.");
    const display = (signup ? name.trim() : "") || mail.split("@")[0];
    signIn({ name: display, email: mail });
    const wantsPro = new URLSearchParams(window.location.search).get("plan") === "pro";
    router.push(wantsPro ? "/upgrade" : "/dashboard");
  }

  return (
    <main className="auth">
      <form className="auth-card" onSubmit={submit} noValidate>
        <Logo dark />
        <h1>{signup ? "Create your free account" : "Welcome back"}</h1>
        <p className="muted">{signup ? "Take your first PL-300 readiness test in minutes." : "Sign in to continue your preparation."}</p>
        {signup && (
          <label className="field">Your name
            <input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" placeholder="Sara" />
          </label>
        )}
        <label className="field">Email
          <input type="email" value={email} onChange={(e) => { setEmail(e.target.value); setError(""); }} autoComplete="email" placeholder="you@example.com" required />
        </label>
        {error && <p className="error" style={{ marginTop: 14 }}>{error}</p>}
        <button className="btn btn-orange btn-block" style={{ marginTop: 22 }}>{signup ? "Create account" : "Sign in"}</button>
        <p className="notice" style={{ marginTop: 18 }}>
          <b>Preview mode:</b> accounts are not connected yet, so no password is needed and your progress is saved in this browser only.
        </p>
        <p className="small muted" style={{ marginTop: 18, textAlign: "center" }}>
          {signup ? <>Already have an account? <Link className="link" href="/login">Sign in</Link></> : <>New here? <Link className="link" href="/signup">Create a free account</Link></>}
        </p>
      </form>
    </main>
  );
}
