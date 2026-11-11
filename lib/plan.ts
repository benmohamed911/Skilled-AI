import { domainName } from "./exam";
import type { DomainResult, Gap, StudyPlan } from "./types";

/** Built-in study plan used when the AI is not connected (or fails). */
export function basicPlan(domains: DomainResult[], gaps: Gap[], limit: number): StudyPlan {
  const weakest = [...domains].sort((a, b) => a.pct - b.pct)[0];
  const steps = gaps.slice(0, limit).map((g) => ({
    title: g.topic,
    why: `You missed ${g.missed} of ${g.total} question${g.total > 1 ? "s" : ""} on this in "${domainName(g.domain)}".`,
    minutes: Math.min(60, 20 + g.missed * 10),
  }));
  const summary = !gaps.length
    ? "You answered everything correctly. Take a full simulation to confirm it under real exam timing."
    : `Your weakest area is "${weakest.name}" at ${weakest.pct}%. Work through the topics below in order, then re-test.`;
  return { source: "basic", summary, steps };
}
