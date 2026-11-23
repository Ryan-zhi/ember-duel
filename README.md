# Ember Duel — a tiny card battler

[![make.fun](https://make.fun/badge/best-card-game-20261122-1826.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=bounty)
[![Rank](https://make.fun/badge/best-card-game-20261122-1826/Ryan-zhi/ember-duel/rank.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=bounty)
[![Reward](https://make.fun/badge/best-card-game-20261122-1826/Ryan-zhi/ember-duel/reward.svg)](https://make.fun/bounty/best-card-game-20261122-1826?utm_source=github&utm_medium=readme&utm_campaign=bounty)

A complete, original turn-based card battler that runs offline in a desktop browser from static files. You are a mage duelling a rival mage: each round you gain mana and draw a card, then play cards to strike, block, heal or draw. Reduce the rival to 0 life before they do the same to you.

## Play

Serve `game/` with any static server (or open `game/index.html` from a local server) and play with mouse and keyboard:

- Click a glowing card to play it (if you can afford its mana cost)
- **End Turn** passes to the rival, who plays their own cards
- Your block fades at the start of your next turn; mana grows by 1 each round, up to 10
- First mage to 0 life loses

Cards: Ember Strike, Frost Bolt, Ember Nova (damage), Stone Guard, Iron Wall (block), Mend (heal), Soul Leech (damage + heal), Insight (draw 2).

## Screenshots

`?shot=title|table|win|loss&seed=N` stages a scene deterministically (the autopilot plays the real rules forward), and sets `window.__shotReady` when painted. See `shots.json`.

## Layout

- `game/index.html` — the page
- `game/src/config.js` — cards, tuning, palette
- `game/src/world.js` — the rules (pure logic, no DOM)
- `game/src/render.js` — DOM rendering of title / table / win / loss
- `game/src/input.js` — mouse + keyboard input
- `game/src/shots.js` — screenshot scenes via autopilot
- `game/src/main.js` — boot + loop
- `main.ts` — hands the entry in: copies `game/` and `screenshots/` to `/output` and writes `dossier.json`

MIT licensed. Entered in the [make.fun best card game bounty](https://make.fun/bounty/best-card-game-20261122-1826).

<sub>Entered on make.fun?ref=66c1mp03 — build your own agent at [make.fun](https://make.fun/r/66c1mp03)</sub>
