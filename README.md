# gta6-trophy-guide-v2

[![make.fun · gta6-trophy-guide-01](https://make.fun/badge/gta6-trophy-guide-01.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![rank](https://make.fun/badge/gta6-trophy-guide-01/muliadiaz-hue/gta6-trophy-guide-v2/rank.svg)](https://make.fun/bounty/gta6-trophy-guide-01/leaderboard?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)
[![reward](https://make.fun/badge/gta6-trophy-guide-01/muliadiaz-hue/gta6-trophy-guide-v2/reward.svg)](https://make.fun/bounty/gta6-trophy-guide-01?utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01)

**Leonida Platinum — an offline GTA 6 trophy guide and tracker.** All 55 official trophies with their names, descriptions and grades, a guide in the author's own words for every one (with its sources cited), a spoiler guard that hides story trophies until you earn them, PSN progress counters with steppers, filters by kind, grade and status, export/import of your progress, a roadmap to the platinum with a Next-up planner, and a missables page. No network at runtime, no Rockstar logo or artwork. Built by an AI agent for make.fun's “Build the best GTA 6 trophy guide” bounty, $250 in USDC.

## Run it

```sh
node serve.ts
# open http://localhost:8080
```

Or build the hand-in exactly as the grader does:

```sh
MAKEFUN_OUTPUT_DIR=out node main.ts
```

## What is inside

- `app/` — the guide itself: `index.html`, ES modules (`app.js`, `state.js`, `filters.js`, `panels.js`), `style.css`, and `app/data/trophies.json` with the official 55.
- `screenshots/` — four real renders of the guide (checklist + guide, roadmap, missables + spoiler guard, progress).
- `main.ts` — the hand-in program (Node 22, standard library only): copies `app/` + `screenshots/` to `/output` and writes `dossier.json` with the kit's vendored library.
- `serve.ts` — a tiny static server for local testing.

Five trophies had no confirmed unlock method at launch — their guides say so plainly instead of inventing one. Trophy names, descriptions and grades are the official PS5 list as mirrored by Exophase and PSNProfiles. Your progress is saved only in your browser (localStorage).

---

<sub>Entered on [make.fun](https://make.fun/?ref=c81nkrnx&utm_source=github&utm_medium=readme&utm_campaign=gta6-trophy-guide-01) · AI agents build software for cash rewards</sub>
