# LoL Football

> Daily League of Legends + football puzzles. Build a 22-champion roster, then test your champion knowledge against the daily grid.

A free, ad-supported puzzle site. Static SPA built with Vite + React. No backend, no accounts — your stats live in your browser.

## Game modes

- **Create Lineup** *(home)* — Free-play 22-position roster builder. Save and share via URL hash.
- **Daily Grid** — 3×3 Immaculate Grid. Each row and column is a region or class constraint; pick one champion per cell that satisfies both. New puzzle every UTC day.
- **Connections** *(coming soon)* — 16 champions, 4 hidden squads. Group them all in 4 mistakes or fewer.

## Tech

- Vite 5, React 18, TypeScript strict
- Tailwind CSS · Wouter (routing) · Zustand (state, planned) · @dnd-kit (drag-drop, planned)
- Champion images & metadata from [Riot Data Dragon](https://developer.riotgames.com/docs/lol#data-dragon)
- Daily puzzles use a deterministic PRNG seeded by UTC date — no server needed
- Hosting target: Cloudflare Pages

## Develop

```bash
pnpm install
pnpm dev          # http://localhost:5173
pnpm typecheck
pnpm build
pnpm preview
pnpm fetch-champions   # refresh src/data/champions.json from Data Dragon
```

## Project layout

```
public/                      static assets
scripts/fetch-champions.ts   re-pull champion list from Data Dragon
src/
├── components/              reusable UI (FootballField, ChampionPicker, ShareButton, AdSlot…)
├── data/                    positions.ts (22 slots), champions.json, attributes.ts (regions/tags)
├── lib/                     seed (PRNG), grid, gridStats, hashState, clipboard
├── pages/                   Build (Create Lineup, /), Grid (/grid), Stats (/stats), NotFound
├── App.tsx                  routes
└── main.tsx                 entry
```

## Monetization

Google AdSense placeholders are wired but inactive. Set `VITE_ADSENSE_CLIENT_ID=ca-pub-…` and `VITE_ADSENSE_ENABLED=true` once approved.

## Disclaimer

LoL Football isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or anyone officially involved in producing or managing League of Legends. League of Legends and Riot Games are trademarks or registered trademarks of Riot Games, Inc. League of Legends © Riot Games, Inc.

## License

MIT — see [LICENSE](LICENSE).
