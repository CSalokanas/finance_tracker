# Professionalization Practice — Week 1 Process Log

**Project title:** Spendly
**Tagline:** Know your money. Own your future.
**Type:** Personal product assignment
**Log entry version:** 1 (editable)

> Note on honesty: sections marked **[FILL IN]** are placeholders for you to complete with your own
> real experience and observations. Do **not** submit this as-is; replace those parts with what
> actually happened to you. Everything written here about the app's design decisions and
> architecture is accurate to the implementation that shipped.

---

## 1. Assignment context

This is a personal-product project for a Professionalization Practice / software skills class. The goal is to independently design, build, test, document, and publish a small but complete web application end-to-end — including a process log describing how it was made.

## 2. Problem being solved

People often lose track of their money because purchases, bills, income, and savings are scattered across several apps, spreadsheets, and notes. Spendly gathers that into one calm, easy-to-read dashboard so a person can see their spending patterns, stay within budgets, and work toward savings goals.

## 3. Intended audience

- Students
- Young adults
- Beginners learning to manage their finances
- Anyone who wants a simple personal budgeting tool

## 4. Why I chose this idea

- It solves a problem I actually have (not knowing where my money went each month).
- The scope is a good fit for one product cycle: big enough to be complete, small enough to finish and polish.
- A personal "local-first" app (no backend, no bank integration) can be built and deployed for free, which fits a student project.

## 5. Main features

- Overview dashboard with month-scoped income/expense/net totals, savings summary, budget progress, spending-by-category, income vs expenses, spending trend, recent transactions, and transparent insights.
- Full transaction CRUD (add/edit/delete) with search, filtering (type/category/date range/month), and sorting.
- Monthly per-category budgets with actual-vs-budget, % used, and visual states (normal → 80% warning → over 100%), with duplicate category+month prevention.
- Savings goals with target/saved, add or reduce money, progress, completion state; progress is tracked separately from transactions.
- Reports with charts derived from stored data.
- Settings: display name, currency (EUR/USD/GBP), theme (dark/light), JSON export/import, reset demo data, clear all data.
- LocalStorage persistence (versioned), first-launch demo dataset labeled as demonstration data.

## 6. Design decisions

- **Single page app, section-based navigation** (no router) to keep deployment simple and reliable on static hosts.
- **Dark, calm "finance SaaS" visual identity**: deep charcoal/navy base, emerald primary, restrained shadows and rounded cards; a full light theme too. Design tokens live in `src/styles/global.css` (CSS variables) and Tailwind config.
- **Money stored as integer cents**, never floats, to avoid rounding drift; type (income/expense) determines sign, so values are never accidentally double-negated.
- **Theme and currency preferences persisted** in LocalStorage; theme applies a `data-theme` attribute to `<html>`.
- **All figures computed from real data** via pure functions in `src/utils/`, so nothing is hardcoded and nothing needs to be recomputed in two places.
- **Destructive actions** (delete, clear all) require explicit confirmation dialogs, and demo-reset is kept separate from clear-all.

## 7. Technology choices

- **React + Vite**: fast dev loop, tiny boilerplate, reliable static output.
- **Tailwind CSS** for utility-driven layouts plus a small custom stylesheet for tokens.
- **Lucide React** for consistent, accessible icons.
- **Recharts** for charts because it renders cleanly on top of the same color tokens and handles empty data.
- **LocalStorage** for persistence: zero infrastructure, works offline, appropriate for a personal tool.
- Chose a **static frontend** (no backend, no DB, no API keys) so it deploys to Netlify/GitHub Pages with `npm run build` → `dist/`.

## 8. AI-assisted development process

The implementation was produced with the help of an AI coding assistant (Fitten). How it was used:

- I supplied the product requirements and constraints (no backend, local-first, specific features, design direction).
- The assistant scaffolded the project, implemented the components/pages/utils, and produced documentation.
- In a follow-up the assistant fixed build failures found by running the production build: a duplicated `currencySymbol` declaration in `GoalsPage`, and two hook files containing JSX that were named `.js` (renamed to `.jsx` and re-imported). After that, `npm run build` succeeded and `dist/` was produced.
- Core financial calculations were verified by running the utility functions directly with `node` (see 11).

**[FILL IN]** In 2–4 sentences, describe how the AI's output was reviewed and what you changed or verified yourself, and where you had to correct or extend it. Be specific.

## 9. Development milestones

**[FILL IN]** List the milestones in order (e.g., "M1: project scaffold + design system", "M2: transactions page working", ...). Use the stage names that best match what you actually did.

1. Scaffold and design system — defined.
2. Data layer (storage, aggregate math, formatting, validation) — defined and verified.
3. Overview dashboard and transactions CRUD — implemented.
4. Budgets + savings goals — implemented.
5. Reports/charts + settings + import/export — implemented.
6. Production build passing, docs + deployment config — complete.

## 10. Testing checklist

Checks that were performed by running commands in an actual environment:

- [x] `npm install` completed with no dependency errors.
- [x] `npm run build` succeeded; `dist/index.html` and bundled assets produced.
- [x] Financial calculations (income/expense sums, net, by-category, month filter, month-over-month delta) verified by executing `src/utils/aggregate.js` and `src/utils/validation.js` directly in `node` with sample data.
- [x] Amount validation accepted a valid amount and produced integer cents; rejected an invalid form (empty title, zero amount). Checks passed for expected fields.

Checks that still need to be done **by you, in a browser** (manual QA):

- [ ] Open `npm run dev`, confirm the UI renders and the demo dataset loads on first run.
- [ ] Add an income and an expense; confirm the dashboard totals update.
- [ ] Edit and delete a transaction; confirm the confirmation dialog appears.
- [ ] Search + filter transactions (type, category, date range, month).
- [ ] Create a budget; confirm it turns amber at 80% and red at/over 100% based on real category spend.
- [ ] Create a savings goal; test "Add money" and "Reduce"; confirm caps at target and floored at 0.
- [ ] Switch currency; confirm all visible amounts change consistently (no FX conversion).
- [ ] Toggle dark/light; confirm it persists after refresh.
- [ ] Refresh the page; confirm data persisted in LocalStorage.
- [ ] Export a backup, then import it (both valid and an intentionally corrupted file).
- [ ] Test on a phone-width viewport; confirm no horizontal overflow.

## 11. Challenges and solutions

- **Build failed with a duplicate `currencySymbol` shader** in `GoalsPage.jsx` (imported from `format.js` and also defined locally). Fix: remove the local copy.
- **Two JSX-containing files were named `*.js`** (`useTheme`, `useToast`), which the Vite/rolldown parser refuses. Fix: rename to `*.jsx` and update all imports.
- **Default Vite `README.md` was left in place.** Fix: replaced with a real Spendly README.

**[FILL IN]** Add anything else you personally ran into (environment issues, confusing error, choice you were unsure about) and how you resolved it.

## 12. What I learned

**[FILL IN]** Write 3–6 sentences about what you learned (e.g., why integer cents matter, how static hosting works, how you verified the build, what you found hard). Truthful reflection scores better than generic claims.

## 13. Future improvements

- Recurring transactions and a per-goal contribution history.
- CSV export and multiple currency balances.
- A print-friendly monthly report.
- Code-splitting the bundle if it keeps growing.

## 14. Links (fill these in after deployment)

- **Live application URL:** `https://<your-site>.netlify.app/` — *replace with the real URL after you deploy.*
- **GitHub repository URL:** `https://github.com/<your-username>/spendly` — *replace after you push.*

## 15. Submission checklist

- [ ] Live application URL filled in above and reachable.
- [ ] GitHub repository URL filled in above.
- [ ] This process log completed: all **[FILL IN]** sections replaced with your own wording.
- [ ] You have personally verified the deployment opens and the key features work (transactions, budgets, goals, currency, theme).
- [ ] No credentials, keys, or personal data are included in the repo.