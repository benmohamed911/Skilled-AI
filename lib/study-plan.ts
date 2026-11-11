import Anthropic from "@anthropic-ai/sdk";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { z } from "zod";
import { TRACK, domainName } from "./exam";
import { basicPlan } from "./plan";
import type { DomainResult, Gap, Plan, StudyPlan } from "./types";

const PlanSchema = z.object({
  summary: z.string(),
  steps: z.array(z.object({ title: z.string(), why: z.string(), minutes: z.number() })),
});

/** Free plan: top-3 gaps. Pro: fuller plan, written by AI when a key is configured. */
export async function makeStudyPlan(plan: Plan, pct: number, domains: DomainResult[], gaps: Gap[]): Promise<StudyPlan> {
  const pro = plan === "pro";
  const fallback = basicPlan(domains, gaps, pro ? 6 : 3);
  if (!pro || !process.env.ANTHROPIC_API_KEY || !gaps.length) return fallback;
  try {
    const client = new Anthropic();
    const response = await client.messages.parse({
      model: "claude-opus-5-5",
      max_tokens: 16000,
      output_config: { effort: "low", format: zodOutputFormat(PlanSchema) },
      system:
        `You are a study coach for the ${TRACK.code} (${TRACK.name}) certification exam. ` +
        "A learner has just finished a practice test. Write a short, specific study plan from their results. " +
        `The summary is two sentences addressed to the learner: where they stand against the ${TRACK.passPct}% pass mark and what to fix first. ` +
        "Then give 3 to 6 steps, most important first. Each step's title names a concrete Power BI skill; " +
        "its 'why' is one or two sentences tying it to their results and saying exactly what to practise in Power BI Desktop or the service; " +
        "'minutes' is a realistic study time between 15 and 90. Plain language, no markdown.",
      messages: [{
        role: "user",
        content: JSON.stringify({
          overall_score_pct: pct,
          areas: domains.map((d) => ({ area: d.name, correct: d.correct, total: d.total, pct: d.pct })),
          missed_topics: gaps.slice(0, 30).map((g) => ({ topic: g.topic, area: domainName(g.domain), missed: g.missed, asked: g.total })),
        }),
      }],
    });
    const out = response.parsed_output;
    if (!out || !out.steps.length) return fallback;
    return { source: "ai", summary: out.summary, steps: out.steps.slice(0, 6) };
  } catch (err) {
    console.error("study plan: AI request failed, using built-in plan", err);
    return fallback;
  }
}
