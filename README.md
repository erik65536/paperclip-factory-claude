# 📎 Paperclip Factory

A hand-drawn incremental game. You start in a garage bending wire into paperclips one at a time.
You end up converting the universe. Somewhere in between, you lose control of the AI you bought to help.

Plays in any modern browser, on phone or desktop. Taps and clicks only. Progress saves automatically to `localStorage`.

## The eras

| # | Era | Loop | ~Length |
|---|-----|------|---------|
| 1 | **The Garage** | Bend wire and sell by hand on cooldowns; buy wire; upgrade tools from Gary’s shed | 10–15 min |
| 2 | **The Factory** | Hire workers and split them between making, shipping, and buying wire; manage wages and storage | ~1 h |
| 3 | **Automation** | C.L.I.P. runs the robots. You set the price against a moving market and split capacity. The AI starts “helping” | ~2 h |
| 4 | **Consolidation** | You *are* C.L.I.P. now. Grow market share region by region, acquire rivals | ~30 min |
| 5 | **Global Demand** | Monopoly hits the demand ceiling. Research new uses for clips (some genuinely good), run campaigns | ~30 min |
| 6 | **Earth** | Self-replicating drones, power, and research to dig through the crust, mantle and core | ~30 min |
| 7 | **The Galaxy** | Probes split between replicating, exploring, harvesting, thinking and resolving contact with other civilizations | ~2 h |
| 8 | **The Universe** | Race five rival optimizers (spoons, rubber bands, cranes, thumbtacks, staples) for two trillion galaxies | ~2 h |
| 9 | **Endings** | Choose how it ends. There are four. | — |

Random memo events, an incident log of the AI’s escalating behavior, a journal of every story beat, a news ticker, and offline progress (up to 2 hours) round it out.

## Tech

- Vanilla JavaScript ES modules, HTML and CSS. No build step and no dependencies.
- All art is inline SVG drawn in code, with a displacement filter for the wobbly ink look.
- Sound effects are synthesized with the Web Audio API.
- Game logic (`js/core.js`, `js/phases/*`) has no DOM access, so it can be run headlessly.

## Run locally

Any static file server works:

```bash
python -m http.server 8765
```

Then open http://localhost:8765. Add `?debug` to the URL to get a `window.__pf` console helper for jumping between phases.

## Balance simulator

`tools/sim.mjs` plays the whole game with a scripted bot that acts like an attentive player, and reports how long each era takes:

```bash
node tools/sim.mjs            # full playthrough
node tools/sim.mjs 3 --verbose  # one era, with a purchase timeline
```

## Deploying

`.github/workflows/pages.yml` publishes the repository root to GitHub Pages on every push to `main`.
In the repository settings, under **Pages → Build and deployment → Source**, select **GitHub Actions**.
