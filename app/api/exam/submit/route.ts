import { NextResponse } from "next/server";
import { scoreExam } from "@/lib/bank";
import { MODES } from "@/lib/exam";
import type { Mode } from "@/lib/types";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => ({}))) as {
    mode?: Mode; ids?: string[]; answers?: Record<string, number | null>; seconds?: number;
  };
  if (!body.mode || !MODES[body.mode] || !Array.isArray(body.ids) || body.ids.length > 200) {
    return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  }
  const result = scoreExam(body.mode, body.ids, body.answers ?? {}, Math.max(0, Number(body.seconds) || 0));
  if (!result) return NextResponse.json({ error: "Invalid submission" }, { status: 400 });
  return NextResponse.json(result);
}
