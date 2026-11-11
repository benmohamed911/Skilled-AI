"use client";
/**
 * Where user data lives.
 *
 * DEMO MODE: everything is saved in this browser only (localStorage).
 * When the real database (Supabase) is connected, only this file needs to change;
 * the rest of the app calls these functions and does not care where data is kept.
 */
import { FREE_TESTS_PER_MONTH } from "./exam";
import type { Attempt, Plan, User } from "./types";

const K = { user: "skilld.user", plan: "skilld.plan", attempts: "skilld.attempts" };

function read<T>(key: string, fallback: T): T {
  try {
    const v = localStorage.getItem(key);
    return v ? (JSON.parse(v) as T) : fallback;
  } catch {
    return fallback;
  }
}
function write(key: string, value: unknown) {
  try { localStorage.setItem(key, JSON.stringify(value)); } catch { /* storage full or blocked */ }
}

export const getUser = () => read<User | null>(K.user, null);
export const signIn = (u: User) => write(K.user, u);
export const signOut = () => { try { localStorage.removeItem(K.user); } catch {} };

export const getPlan = () => read<Plan>(K.plan, "free");
export const setPlan = (p: Plan) => write(K.plan, p);

/** Newest first. */
export const getAttempts = () => read<Attempt[]>(K.attempts, []);
export const getAttempt = (id: string) => getAttempts().find((a) => a.id === id) ?? null;
export function saveAttempt(a: Attempt) {
  write(K.attempts, [a, ...getAttempts().filter((x) => x.id !== a.id)]);
}

export function freeTestsLeft(attempts = getAttempts()) {
  const now = new Date();
  const used = attempts.filter((a) => {
    const d = new Date(a.date);
    return d.getFullYear() === now.getFullYear() && d.getMonth() === now.getMonth();
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
