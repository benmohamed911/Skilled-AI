import { NextResponse } from "next/server";
import { drawExam } from "@/lib/bank";
import { MODES } from "@/lib/exam";
import type { Mode } from "@/lib/types";

export async function POST(req: Request) {
  const { mode } = (await req.json().catch(() => ({}))) as { mode?: Mode };
  if (!mode || !MODES[mode]) return NextResponse.json({ error: "Unknown exam type" }, { status: 400 });
  return NextResponse.json({ mode, minutes: MODES[mode].minutes, questions: drawExam(mode) });
}
