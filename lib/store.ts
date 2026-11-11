"use client";
/** Everything the browser needs from the database: sign-in, the user's plan and their results. */
import { createClient } from "@supabase/supabase-js";
import { FREE_TESTS_PER_MONTH } from "./exam";
import type { Attempt, Plan, User } from "./types";

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
);

export interface Session { user: User; plan: Plan; attempts: Attempt[] }

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const toAttempt = (r: any): Attempt => ({ ...r, date: r.created_at });

/** Returns null when nobody is signed in. Throws if the database cannot be reached. */
export async function loadSession(): Promise<Session | null> {
  const { data } = await supabase.auth.getSession();
  const u = data.session?.user;
  if (!u) return null;
  const [profile, attempts] = await Promise.all([
    supabase.from("profiles").select("name, plan").eq("id", u.id).maybeSingle(),
    supabase.from("attempts").select("*").order("created_at", { ascending: false }).limit(50),
  ]);
  if (profile.error || attempts.error) throw new Error("Could not load your data");
  const email = u.email ?? "";
  return {
    user: { email, name: profile.data?.name || email.split("@")[0] },
    plan: profile.data?.plan === "pro" ? "pro" : "free",
    attempts: (attempts.data ?? []).map(toAttempt),
  };
}

export async function getAttempt(id: string): Promise<Attempt | null> {
  const { data } = await supabase.from("attempts").select("*").eq("id", id).maybeSingle();
  return data ? toAttempt(data) : null;
}

/** Call one of our own API routes as the signed-in user. */
export async function api<T>(path: string, body: unknown): Promise<T> {
  const { data } = await supabase.auth.getSession();
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${data.session?.access_token ?? ""}` },
    body: JSON.stringify(body),
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(json.error || "Something went wrong. Please try again.");
  return json as T;
}

export function freeTestsLeft(attempts: Attempt[]) {
  const now = new Date();
  const used = attempts.filter((a) => {
    const d = new Date(a.date);
    return d.getUTCFullYear() === now.getUTCFullYear() && d.getUTCMonth() === now.getUTCMonth();
  }).length;
  return Math.max(0, FREE_TESTS_PER_MONTH - used);
}

/** Readiness: recent results count most (50% latest, 30% previous, 20% the one before). */
export function readiness(attempts: Attempt[]) {
  const w = [0.5, 0.3, 0.2];
  const recent = attempts.slice(0, 3);
  if (!recent.length) return null;
  const sum = recent.reduce((s, _a, i) => s + w[i], 0);
  return Math.round(recent.reduce((s, a, i) => s + a.pct * w[i], 0) / sum);
}
