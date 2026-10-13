# Spendly

**Know your money. Own your future.**

Spendly is a personal finance dashboard that helps you understand your financial habits by tracking income, expenses, monthly budgets, spending categories, and savings goals — all in one calm, understandable place.

> Spendly is a personal budgeting and educational tool. It is **not** a banking platform, financial institution, or investment adviser. It does not connect to banks or request financial credentials.

---

## Problem being solved

People lose track of their money because purchases, bills, income, and savings are scattered across different apps, spreadsheets, and notes. Spendly brings that information into one clean dashboard so you can recognize patterns, stay within budgets, and build savings habits.

## Intended users

- Students
- Young adults
- Beginners learning to manage money
- Anyone who wants a simple personal budgeting tool

## Features

| Area | What you can do |
|---|---|
| Overview dashboard | Greeting, selected-month totals (income / expense / net), savings summary, budget progress, spending-by-category, income-vs-expense, recent transactions, and transparent budget insights |
| Transactions | Full CRUD (add / edit / delete with confirmation) for income and expenses; search, filter by type / category / month / date range, sort, responsive table |
| Budgets | Per-category monthly budgets with actual-vs-budget, percentage used, and visual states (normal to 80% warning to 100% over). Duplicate category+month is prevented |
| Savings goals | Create / edit / delete goals; set target + saved amount + optional target date; add money or reduce saved with clear, labeled actions (tracked separately from transactions) |
| Reports | Charts derived from your stored data: income vs expenses, spending by category, monthly trend, top categories |
| Settings | Display name, currency (EUR/USD/GBP), theme (dark/light, persisted), JSON export/import, reset demo data, clear all data |
| Data | LocalStorage persistence (versioned), first-launch demo dataset (clearly labelled), offline after first load |

Financial figures are always calculated from actual stored data — no hardcoded totals or fake chart values. Amounts are stored as integer cents to avoid floating-point drift.

## Technology stack

- React 19 + Vite
- JavaScript (JSX)
- Tailwind CSS (utility classes) + a small custom design-token stylesheet (`src/styles/global.css`)
- Lucide React icons
- Recharts for charts
- LocalStorage for persistence (no backend, no database, no APIs, no API keys)

No backend required. Everything runs in the browser and works offline once it has loaded.

## Project structure

```
Spendly/
├─ index.html
├─ package.json
├─ vite.config.js
├─ tailwind.config.js
├─ postcss.config.js
├─ .gitignore
├─ netlify.toml          # build = npm run build, publish = dist
├─ README.md
├─ PROCESS_LOG.md        # Week-1 assignment log (edit this yourself)
├─ public/
│  └─ favicon.svg
└─ src/
   ├─ main.jsx           # entry; mounts App in StrictMode
   ├─ App.jsx            # app shell, state, navigation, persistence wiring
   ├─ data/
   │  └─ categories.js   # expense/income categories + payment methods
   ├─ hooks/
   │  ├─ useTheme.jsx    # theme context/provider
   │  └─ useToast.jsx    # toast context/provider + viewport wiring
   ├─ pages/
   │  ├─ OverviewPage.jsx
   │  ├─ TransactionsPage.jsx
   │  ├─ BudgetsPage.jsx
   │  ├─ GoalsPage.jsx
   │  ├─ ReportsPage.jsx
   │  └─ SettingsPage.jsx
   ├─ components/
   │  ├─ layout/ (Sidebar, Header)
   │  ├─ dashboard/ (SummaryCard, RecentTransactions, InsightCard)
   │  ├─ transactions/ (TransactionForm, TransactionTable)
   │  ├─ budgets/ (BudgetCard, BudgetForm)
   │  ├─ goals/ (GoalCard, GoalForm)
   │  ├─ charts/ (Charts.jsx - Recharts wrappers)
   │  └─ ui/ (Modal, ConfirmDialog, Toast, ToastViewport, ProgressBar, EmptyState)
   └─ utils/
      ├─ storage.js      # versioned LocalStorage read/write (defensive)
      ├─ aggregate.js    # pure financial calculations (integer cents)
      ├─ validation.js   # form validation + toCents
      ├─ format.js       # Intl.NumberFormat money/percent formatting
      ├─ date.js         # month-key helpers (YYYY-MM), tz-safe
      ├─ insights.js     # derived budget/insight rules
      ├─ demoData.js     # first-launch demo dataset
      └─ importExport.js # JSON export + validated import
```

## Prerequisites

- Node.js 20 or newer (tested on Node 24)
- npm 10 or newer (installing Node ships npm with it)

Check your versions:

```bash
node --version
npm --version
```

## Installation

From the project root (`Spendly/`):

```bash
npm install
```

## Local development

```bash
npm run dev
```

Vite starts a dev server and prints a URL such as `http://localhost:5173/`. Open it in your browser.

- Stop the server: press `Ctrl + C` in the terminal.

## Production build

```bash
npm run build
```

This compiles the app into the `dist/` folder (static HTML/CSS/JS).

## Preview the production build

```bash
npm run preview
```

Serves the `dist/` output locally (default `http://localhost:4173/`). Stop with `Ctrl + C`.

## Publish to GitHub

**If the project is not yet a Git repository** (run from `Spendly/`):

```bash
git init
git add .
git commit -m "Spendly: initial release"
```

Create a new empty repository on GitHub (the URL will look like `https://github.com/<your-username>/spendly`), then:

```bash
git branch -M main
git remote add origin https://github.com/<your-username>/spendly.git
git push -u origin main
```

**If it is already a Git repository**, just commit and push your changes:

```bash
git add .
git commit -m "Update Spendly"
git push
```

> `.gitignore` already excludes `node_modules/` and `dist/`, so you do not commit generated artifacts.

## Deploy to Netlify

1. In the GitHub repository above, click "Deploy with Netlify" (or go to https://app.netlify.com, choose "Add new site" then "Import an existing project", connect GitHub) and select the repo and the `main` branch.
2. Netlify auto-detects the build settings from `netlify.toml`. Confirm they match:
   - Build command: `npm run build`
   - Publish directory: `dist`
3. Click "Deploy site". Netlify installs dependencies, runs the build, and serves `dist/`.
4. When the deploy finishes you get a live URL like `https://<your-site>.netlify.app/`. Open it to verify it works.

No environment variables or secrets are needed.

Alternatively, you can drag-and-drop the `dist/` folder onto https://app.netlify.com/drop for a quick one-off deployment.

## Data storage & privacy

- All data is stored **locally in your browser** under the LocalStorage key `spendly.v1` (versioned).
- Nothing is sent to a server. There is no analytics, no third-party tracking, no API keys, no bank integration.
- **Your data does not sync across devices.** Before clearing your browser data or switching browsers, use Settings "Export a backup" to download `spendly-backup-YYYY-MM-DD.json` so you can restore it later.
- Changing the **display currency does not perform foreign-exchange conversion** — amounts are stored as numbers and simply formatted with the chosen currency symbol (EUR default).

## Known limitations

- Data is per-browser and per-device (LocalStorage). Export a backup to move it.
- Currency change is a display-only formatting switch, not an FX conversion.
- Budget insights are transparent arithmetic over your local data, not financial advice.
- Single large bundle (Vite warns above 500 kB); fine for a static personal app, could be code-split if it grows.

## Future improvements

- Per-goal contribution history timeline
- Recurring transactions
- CSV export
- Multiple currency balances
- Dark/light that follows the system preference automatically
- Print-friendly monthly report

## License

Personal / educational project.