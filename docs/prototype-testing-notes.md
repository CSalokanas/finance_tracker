# Spendly – Prototype testing notes (End of Cycle 1)

Christos Salokanas · 3 Nov 2026

**Build tested:** v2 (quick-add), https://fabulous-lollipop-eb202f.netlify.app
**Method:** remote test with 2 friends on their phones. Task: "Pretend you just bought a coffee for €3.20 and log it in the app. Don't ask me how, just try." Then 3 questions: (1) Was it easy to find how to add it? (2) Was anything confusing or annoying? (3) Would you actually use this to track spending?

## Tester 1

1. Yeah, easy. Big green "+ Add" button top right, found it straight away. The form was clear and Expense + today's date were already selected, nice.
2. A few things: the "Powered by Netlify" badge sits on top of the "Add Transaction" button, so my first tap did nothing. Also no confirmation after saving, I had to scroll to check it was actually there. 7 fields feels like a lot for a €3.20 coffee.
3. Maybe? It looks nice. But I'd want a faster way, like just amount + category and done.

## Tester 2

1. Finding Add was fine. Using the rest of the app on my phone, not so much.
2. Honestly the overview is kind of broken on mobile: there's an empty sidebar column eating a quarter of the screen, and the stat cards just show "€" and "T." with the actual numbers cut off. It says "Welcome back, there!" (missing name?). The red "Over budget" banner says I'm over budget, but the card says 84% used, which confused me. Some transactions are dated Nov 5–8, which is in the future. And the Netlify badge covers the submit button and the round quick-add button.
3. Not yet. If I can't see my totals on my phone, I'm not going to open it daily. Fix the mobile layout and make adding something like 2 taps and I'd try it.

## What changed in v3

| Feedback | Change in v3 |
| --- | --- |
| Netlify badge covers the submit and quick-add buttons (T1, T2) | Quick-add button moved bottom-left on phones and above the badge on desktop; page and dialogs get extra bottom space so buttons can scroll clear of the badge |
| No confirmation after saving (T1) | Toast "Transaction added" after saving from the full form (quick-add already confirms) |
| 7 fields is a lot for a coffee; wants amount + category (T1, T2) | Quick-add (amount + category, 2 taps) is the fast path; the round + button is no longer hidden under the badge so testers can find it |
| Empty sidebar column on mobile (T2) | Replaced with a scrollable tab strip under the header on phones |
| Stat cards show "€" and "T." with numbers cut off (T2) | Cards show full amounts on phones; chart axis uses short labels (€1.8K) |
| "Welcome back, there!" (T2) | Shows "Welcome back!" when no name is set |
| "Over budget" banner vs 84% used is confusing (T2) | Banner now names which categories are over, e.g. "2 categories are over budget (Entertainment, Transport), even if your overall total is still under" |
| Transactions dated in the future (T2) | Demo data no longer creates future-dated transactions |

## Open points for the next cycle

- Tester 1 used the full "+ Add" form rather than the round quick-add button, and Tester 2 found the quick-add button covered by the badge. Next test should check whether people notice quick-add now that it isn't covered.
- Re-test v3 with the same two friends.
