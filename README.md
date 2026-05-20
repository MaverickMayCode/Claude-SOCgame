# SOC_ANALYST_1_STUDY_TERMINAL

A lightweight, terminal-themed static study site for memorizing SOC Analyst 1 fundamentals. Built with plain HTML, CSS, and JavaScript — no frameworks, no build step, no backend. Deploys to GitHub Pages by dragging the folder into a repo.

```
> ACCESSING KNOWLEDGE BASE█
```

## What it is

A Quizlet-style memorization platform built specifically for SOC Analyst 1 study. It’s designed around the loop that actually drives retention:

1. **See a card.**
1. **Mark it “got it” or “missed it.”**
1. **Missed cards go into a persistent review queue.**
1. **You loop the review queue until each card is passed.**
1. **Daily goals keep you consistent.**

Everything is stored in your browser’s `localStorage`. No login, no tracking, no server.

## Features

- **Flashcards** across 14 SOC Analyst 1 categories (87 starter cards).
- **Quiz Mode** — multiple choice, auto-generated from your flashcard pool, scored, with retry-missed support.
- **Acronym Drill** — 26 must-know cybersec acronyms with the “why does it matter.”
- **Command Drill** — Linux + Windows commands a SOC analyst should recognize, including the “suspicious use” angle.
- **Alert-to-Action** — 15 common alerts with meaning, relevant logs, MITRE mapping, and an investigation checklist.
- **Missed Review** — the most important feature: every miss persists across sessions until you pass it.
- **Daily Objectives** — editable daily targets with progress bars, auto-reset by date.
- **Dashboard** — lifetime cards studied, missed queue size, best quiz score, weakest categories, daily summary.
- **Keyboard shortcuts** for fast review: `SPACE` reveal, `1` got it, `2` missed it, `ENTER` next.
- **Mobile-friendly** layout.

## Run locally

Just open `index.html` in any modern browser. That’s it.

```bash
# Optional: serve over a local HTTP server (some browsers restrict file:// behaviors)
cd soc-study-site
python3 -m http.server 8000
# then visit http://localhost:8000
```

No `npm install`, no compile step, no node required.

## Deploy to GitHub Pages

1. Create a new public GitHub repository (e.g. `soc-study-site`).
1. Copy `index.html`, `style.css`, `script.js`, and this `README.md` into the repo root.
1. Commit and push.
1. In the repo, go to **Settings → Pages**.
1. Under **Source**, pick the `main` branch (root `/`) and save.
1. Wait ~1 minute. Your site is live at `https://<your-username>.github.io/soc-study-site/`.

That’s the whole deployment.

## Editing / adding flashcards

All study data lives at the top of `script.js`. Each card is just a JavaScript object.

```js
const flashcards = [
  {
    id: "port-1",                                 // unique string, used by the review queue
    category: "Ports and Protocols",              // must match an existing or new category
    question: "What port does DNS usually use?",
    answer: "Port 53. DNS usually uses UDP 53, but can use TCP 53 for zone transfers...",
    difficulty: "easy",                           // easy | medium | hard
    tags: ["DNS", "Networking", "Ports"]
  },
  // ... add more here
];
```

To add a new category, just use a new `category` string on any card. The flashcard category picker and quiz dropdown both pick this up automatically — no extra wiring needed.

The same pattern applies to:

- `acronyms[]` — `{ acronym, meaning, why_matters }`
- `commands[]` — `{ command, os ('linux'|'windows'), description, why_soc, example, suspicious }`
- `alerts[]` — `{ alert, meaning, logs, mitre, checks: [] }`

### Pitfalls

- **IDs must be unique** in `flashcards[]` because the review queue tracks them by ID.
- If you delete a card that has previously been missed, it disappears from review automatically (the missed-review loader skips unresolved IDs).
- localStorage is browser-specific; progress on one device doesn’t sync to another.

## File structure

```
soc-study-site/
├── index.html      # All view containers + nav
├── style.css       # Terminal aesthetic, scanlines, grid, panels
├── script.js       # All data + logic
└── README.md       # This file
```

## Resetting progress

- **Today’s progress only:** `/daily-goals → RESET TODAY'S PROGRESS`
- **Lifetime data + missed queue:** `/dashboard → WIPE LIFETIME PROGRESS`
- **Review queue only:** `/missed-review → CLEAR ENTIRE REVIEW QUEUE`

## localStorage keys used

|Key                   |Purpose                                        |
|----------------------|-----------------------------------------------|
|`soc_missed`          |array of `{ id, type, ts }` missed items       |
|`soc_stats`           |lifetime totals + per-category miss counts     |
|`soc_goals`           |editable daily targets                         |
|`soc_daily_YYYY-MM-DD`|today’s per-goal progress (auto-resets by date)|

Daily progress resets simply because each day uses a new localStorage key based on the date.

## Future improvement ideas

- Spaced repetition (SM-2 or Leitner) instead of a simple missed queue.
- Import/export of progress and cards as JSON.
- Tag-based filtering on the flashcards view.
- A “hardcore mode” that re-injects missed cards mid-session.
- Per-category quizzes that auto-weight toward your weakest area.
- Sound effects (terminal beep on correct/incorrect).
- Light theme toggle for daylight studying.
- Sharable links to a specific category or card set.
- Pull cards from a remote JSON so you can update them without pushing the whole site.

## License

Do whatever you want with it. It’s yours.

```
> SOC_TERMINAL v1.0 // localStorage backend // no telemetry █
```