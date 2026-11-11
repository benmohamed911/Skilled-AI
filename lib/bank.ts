import { QUESTIONS as RAW } from "./questions";
import { DOMAINS, MODES, TRACK, domainName } from "./exam";
import type { Attempt, DomainId, Gap, Mode, PublicQuestion, Question, ReviewItem } from "./types";

// Small seeded random generator so each question's options get a fixed,
// repeatable order (otherwise the correct answer would too often sit in the same position).
function seeded(seed: string) {
  let h = 2166136261;
  for (const c of seed) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return () => {
    h = Math.imul(h ^ (h >>> 15), 2246822507);
    h = Math.imul(h ^ (h >>> 13), 3266489909);
    return ((h ^= h >>> 16) >>> 0) / 4294967296;
  };
}

function shuffle<T>(arr: T[], rnd: () => number = Math.random): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

const BANK: Question[] = RAW.map((q) => {
  const order = shuffle([0, 1, 2, 3], seeded(q.id));
  return { ...q, options: order.map((i) => q.options[i]), answer: order.indexOf(q.answer) };
});
const BY_ID = new Map(BANK.map((q) => [q.id, q]));

/** Pick a random exam: the right number of questions from each area, in random order. */
export function drawExam(mode: Mode): PublicQuestion[] {
  const picked: Question[] = [];
  for (const d of DOMAINS) {
    picked.push(...shuffle(BANK.filter((q) => q.domain === d.id)).slice(0, MODES[mode].perDomain[d.id]));
  }
  return shuffle(picked).map(({ id, domain, text, options }) => ({ id, domain, text, options }));
}

/** Score submitted answers. `answers` maps question id -> chosen option index (or null). */
export function scoreExam(
  mode: Mode,
  ids: string[],
  answers: Record<string, number | null>,
  seconds: number,
): Omit<Attempt, "id" | "date"> | null {
  const qs = [...new Set(ids)].map((id) => BY_ID.get(id));
  if (!qs.length || qs.some((q) => !q)) return null;
  const review: ReviewItem[] = (qs as Question[]).map((q) => ({
    id: q.id, domain: q.domain, topic: q.topic, text: q.text, options: q.options,
    yours: typeof answers[q.id] === "number" ? (answers[q.id] as number) : null,
    right: q.answer, why: q.why,
  }));
  const ok = (r: ReviewItem) => r.yours === r.right;
  const correct = review.filter(ok).length;
  const pct = Math.round((correct / review.length) * 100);

  const domains = DOMAINS.map((d) => {
    const rs = review.filter((r) => r.domain === d.id);
    const c = rs.filter(ok).length;
    return { id: d.id, name: d.name, correct: c, total: rs.length, pct: rs.length ? Math.round((c / rs.length) * 100) : 0 };
  }).filter((d) => d.total > 0);

  const byTopic = new Map<string, Gap>();
  for (const r of review) {
    const g = byTopic.get(r.topic) ?? { topic: r.topic, domain: r.domain as DomainId, missed: 0, total: 0 };
    g.total++;
    if (!ok(r)) g.missed++;
    byTopic.set(r.topic, g);
  }
  const gaps = [...byTopic.values()].filter((g) => g.missed > 0)
    .sort((a, b) => b.missed - a.missed || b.missed / b.total - a.missed / a.total);

  return { mode, total: review.length, correct, pct, passed: pct >= TRACK.passPct, seconds, domains, gaps, review };
}

export { domainName };
