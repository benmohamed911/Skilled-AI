import { createClient, type SupabaseClient, type User as SbUser } from "@supabase/supabase-js";
import { FREE_TESTS_PER_MONTH } from "./exam";
import type { Mode, Plan } from "./types";

/**
 * Identify who is calling an API route. The browser sends the user's login token;
 * we ask Supabase who it belongs to. Database calls made with the returned client
 * are limited by the privacy rules to that user's own rows.
 */
export async function getCaller(req: Request): Promise<{ sb: SupabaseClient; user: SbUser } | null> {
  const token = req.headers.get("authorization")?.replace(/^Bearer /i, "");
  if (!token) return null;
  const sb = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!, {
    global: { headers: { Authorization: `Bearer ${token}` } },
    auth: { persistSession: false, autoRefreshToken: false },
  });
  const { data, error } = await sb.auth.getUser(token);
  if (error || !data.user) return null;
  return { sb, user: data.user };
}

/** Checks the plan's limits. Returns the user's plan, or a message explaining why the exam is not allowed. */
export async function checkAllowance(sb: SupabaseClient, userId: string, mode: Mode): Promise<{ plan: Plan } | { error: string }> {
  const { data: profile, error } = await sb.from("profiles").select("plan").eq("id", userId).single();
  if (error) return { error: "We could not load your account. Please try again." };
  const plan: Plan = profile.plan === "pro" ? "pro" : "free";
  if (plan === "pro") return { plan };
  if (mode === "full") return { error: "Full simulations are part of the Pro plan." };
  const now = new Date();
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1)).toISOString();
  const { count, error: e2 } = await sb.from("attempts").select("id", { count: "exact", head: true }).gte("created_at", monthStart);
  if (e2) return { error: "We could not check your plan. Please try again." };
  if ((count ?? 0) >= FREE_TESTS_PER_MONTH) return { error: `You have used your ${FREE_TESTS_PER_MONTH} free practice tests this month.` };
  return { plan };
}
