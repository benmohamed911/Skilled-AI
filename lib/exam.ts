import type { DomainId, Mode } from "./types";

export const TRACK = {
  code: "PL-300",
  name: "Microsoft Power BI Data Analyst",
  passPct: 70, // Microsoft's pass mark is 700 out of 1000
};

export const DOMAINS: { id: DomainId; name: string; weight: string }[] = [
  { id: "prepare", name: "Prepare the data", weight: "25–30%" },
  { id: "model", name: "Model the data", weight: "25–30%" },
  { id: "visualize", name: "Visualize and analyze the data", weight: "25–30%" },
  { id: "manage", name: "Manage and secure Power BI", weight: "15–20%" },
];

export const domainName = (id: DomainId) => DOMAINS.find((d) => d.id === id)!.name;

/** How many questions to draw from each area, and the time limit. */
export const MODES: Record<Mode, { label: string; minutes: number; perDomain: Record<DomainId, number> }> = {
  practice: {
    label: "Practice test",
    minutes: 25,
    perDomain: { prepare: 4, model: 4, visualize: 4, manage: 3 },
  },
  full: {
    label: "Full simulation",
    minutes: 100,
    perDomain: { prepare: 13, model: 13, visualize: 13, manage: 9 },
  },
};

export const modeTotal = (m: Mode) => Object.values(MODES[m].perDomain).reduce((a, b) => a + b, 0);

export const FREE_TESTS_PER_MONTH = 3;
export const PRO_PRICE = 19;
