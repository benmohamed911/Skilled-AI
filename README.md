# Skilld AI

Exam-readiness app for the **PL-300 (Microsoft Power BI Data Analyst)** certification:
practice tests, full timed simulations, skill gap analysis and a study plan.

## Status

| Piece | Status |
|---|---|
| Accounts and saved progress (Supabase) | Code connected. Signed-in flow not yet tested end to end. |
| Free plan limit (3 tests a month) and Pro-only full simulations | Enforced on the server. |
| Payments (Stripe) | Not connected. A user becomes Pro only when `plan` is set to `pro` in the Supabase `profiles` table. |
| AI study plan (Anthropic) | Code written, never run against a real key. Without `ANTHROPIC_API_KEY`, a built-in plan is used. |
| Password reset | Not built yet. |
| Terms of service and privacy policy | Placeholders at `/legal`. |
| Question review | Questions in `lib/questions.ts` were AI-drafted and need checking by a Power BI expert. |

Database tables and privacy rules are in `supabase/schema.sql`. Settings the app needs are listed in `.env.example`.

## Where things are

- `lib/questions.ts`: the question bank (add or edit questions here)
- `lib/exam.ts`: exam settings (pass mark, number of questions, time limits, price)
- `lib/store.ts`: sign-in and loading the user's data; `lib/server.ts`: who is calling and what their plan allows
- `app/`: the screens; `app/api/`: exam scoring and the study plan

## Run it on a computer

```bash
npm install
```

```bash
npm run dev
```

Then open http://localhost:3000
