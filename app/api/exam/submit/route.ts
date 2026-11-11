import { NextResponse } from "next/server";
import { scoreExam } from "@/lib/bank";
import { MODES } from "@/lib/exam";
import { checkAllowance, getCaller } from "@/lib/server";
import { makeStudyPlan } from "@/lib/study-plan";
import type { Mode } from "@/lib/types";

export const maxDuration = 60; // the AI study plan can take a little while

export async function POST(req: Request) {
  const caller = await getCaller(req);
  if (!caller) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as {
    mode?: Mode; ids?: string[]; answers?: Record<string, number | null>; seconds?: number;
  };
  if (!body.mode || !MODES[body.mode] || !Array.isArray(body.ids) || body.ids.length > 200) {
    return NextResponse.json({ error: "Invalid submission." }, { status: 400 });
  }
  const allowed = await checkAllowance(caller.sb, caller.user.id, body.mode);
  if ("error" in allowed) return NextResponse.json({ error: allowed.error }, { status: 403 });

  const seconds = Math.min(MODES[body.mode].minutes * 60, Math.max(0, Math.round(Number(body.seconds) || 0)));
  const result = scoreExam(body.mode, body.ids, body.answers ?? {}, seconds);
  if (!result) return NextResponse.json({ error: "Invalid submission." }, { status: 400 });

  const plan = await makeStudyPlan(allowed.plan, result.pct, result.domains, result.gaps);
  const { data, error } = await caller.sb.from("attempts").insert({ ...result, plan }).select("id").single();
  if (error) {
    console.error("submit: could not save attempt", error);
    return NextResponse.json({ error: "We could not save your result. Please try again." }, { status: 500 });
  }
  return NextResponse.json({ id: data.id });
}
