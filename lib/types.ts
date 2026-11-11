export type DomainId = "prepare" | "model" | "visualize" | "manage";
export type Mode = "practice" | "full";
export type Plan = "free" | "pro";

export interface Question {
  id: string;
  domain: DomainId;
  topic: string; // sub-skill, used for gap analysis
  text: string;
  options: string[]; // always 4
  answer: number; // index of the correct option
  why: string; // explanation shown after the exam
}

/** What the browser receives during an exam: no answers, no explanations. */
export type PublicQuestion = Omit<Question, "answer" | "why" | "topic">;

export interface DomainResult {
  id: DomainId;
  name: string;
  correct: number;
  total: number;
  pct: number;
}

export interface ReviewItem {
  id: string;
  domain: DomainId;
  topic: string;
  text: string;
  options: string[];
  yours: number | null;
  right: number;
  why: string;
}

export interface Gap {
  topic: string;
  domain: DomainId;
  missed: number;
  total: number;
}

export interface StudyStep {
  title: string;
  why: string;
  minutes: number;
}

export interface StudyPlan {
  source: "ai" | "basic";
  summary: string;
  steps: StudyStep[];
}

export interface Attempt {
  id: string;
  date: string; // ISO
  mode: Mode;
  total: number;
  correct: number;
  pct: number;
  passed: boolean;
  seconds: number;
  domains: DomainResult[];
  gaps: Gap[];
  review: ReviewItem[];
  plan?: StudyPlan;
}

export interface User {
  name: string;
  email: string;
}
