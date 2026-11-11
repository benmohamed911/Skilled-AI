import { NextResponse } from "next/server";
import { drawExam } from "@/lib/bank";
import { MODES } from "@/lib/exam";
import { checkAllowance, getCaller } from "@/lib/server";
import type { Mode } from "@/lib/types";

export async function POST(req: Request) {
  const caller = await getCaller(req);
  if (!caller) return NextResponse.json({ error: "Please sign in again." }, { status: 401 });
  const { mode } = (await req.json().catch(() => ({}))) as { mode?: Mode };
  if (!mode || !MODES[mode]) return NextResponse.json({ error: "Unknown exam type." }, { status: 400 });
  const allowed = await checkAllowance(caller.sb, caller.user.id, mode);
  if ("error" in allowed) return NextResponse.json({ error: allowed.error }, { status: 403 });
  return NextResponse.json({ mode, minutes: MODES[mode].minutes, questions: drawExam(mode) });
}
