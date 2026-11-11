# Skilld AI

Exam-readiness app for the **PL-300 (Microsoft Power BI Data Analyst)** certification:
practice tests, full timed simulations, skill gap analysis and a study plan.

## What works today (preview mode)

- Landing page, sign-up / sign-in, dashboard, exam simulator, results and answer review
- 48 original practice questions across the four PL-300 exam areas
- Free plan (3 practice tests a month, top-3 gaps) and Pro plan (full simulations, full plan)

## What is NOT connected yet (needed before real launch)

| Piece | Status |
|---|---|
| Real accounts and saved progress (Supabase) | Not connected. Accounts and results live only in the visitor's browser. |
| Payments (Stripe) | Not connected. "Preview Pro" is a free switch for testing. |
| AI study plan (Anthropic) | Code is written but has never run against a real key. Until `ANTHROPIC_API_KEY` is set, a built-in plan is used. |
| Terms of service and privacy policy | Placeholders at `/legal`. |
| Question review | Questions in `lib/questions.ts` were AI-drafted and need checking by a Power BI expert. |

Before going live, the AI study-plan endpoint must also be limited to signed-in users, so strangers cannot run up AI costs.

## Where things are

- `lib/questions.ts`: the question bank (add or edit questions here)
- `lib/exam.ts`: exam settings (pass mark, number of questions, time limits, price)
- `lib/store.ts`: where user data is saved (the only file to change when the database is connected)
- `app/`: the screens; `app/api/`: exam scoring and the study plan

## Run it on a computer

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000
