// Headless balance simulator: plays each phase with a reasonable (not perfect) bot and reports timings.
// Usage: node tools/sim.mjs [phaseNum] [--verbose]
import { newState, buyUpgrade, isVisible, costOf, canAfford, pay } from '../js/core.js';
import { PHASES } from '../js/phases/index.js';
import { BOTS } from './bots.mjs';

const args = process.argv.slice(2);
const only = args.find(a => /^\d+$/.test(a));
const verbose = args.includes('--verbose');
const DT = 0.1;

function cheapestAffordable(S, ph, filter = () => true) {
  let best = null, bc = Infinity;
  for (const u of ph.upgrades) {
    if (!isVisible(S, u) || !filter(u)) continue;
    const c = costOf(S, u);
    const v = Object.values(c).reduce((a, b) => a + b, 0);
    if (canAfford(S.p, c) && v < bc) { best = u; bc = v; }
  }
  return best;
}

function run(num, S) {
  const ph = PHASES[num];
  S.phase = num; S.tp = 0;
  const bot = BOTS[num];
  const limit = 6 * 3600;
  let lastReport = 0, nextLog = 0;
  const buys = [];
  while (S.tp < limit) {
    ph.tick(S, DT);
    S.tp += DT; S.t += DT;
    S.queue.length = 0;
    if (S.ev) S.ev = null;
    bot(S, ph, DT, { cheapestAffordable, buyUpgrade: (u) => { if (buyUpgrade(S, u)) { buys.push([S.tp, u.name]); return true; } return false; } });
    if (verbose && S.tp >= nextLog) { nextLog += 60; console.log(`  [${(S.tp / 60).toFixed(1)}m]`, ph.debug ? ph.debug(S) : ''); }
    if (ph.advance.can(S) && (!ph.advance.requireAll || ph.upgrades.every(u => S.p.up[u.id]))) break;
  }
  const missing = ph.upgrades.filter(u => !S.p.up[u.id]).length;
  console.log(`Phase ${num} (${ph.title}): ${(S.tp / 60).toFixed(1)} min${S.tp >= limit ? '  ** TIMED OUT **' : ''}  upgrades ${ph.upgrades.length - missing}/${ph.upgrades.length}`);
  if (verbose) for (const [t, n] of buys) console.log(`    ${(t / 60).toFixed(2).padStart(6)}m  ${n}`);
  if (ph.debug) console.log('   end:', ph.debug(S));
  if (ph.advance.cost) pay(S.p, ph.advance.cost);
  return ph.carry(S);
}

const S = newState();
let carry = {};
const start = only ? +only : 1;
// To start mid-game, replay earlier phases quietly to build a realistic carry.
for (let n = 1; n <= 8; n++) {
  if (!PHASES[n]) break;
  S.p = PHASES[n].init(carry, S);
  if (n < start) { const v = verbose; carry = runQuiet(n); continue; }
  carry = run(n, S);
  if (only) break;
}

function runQuiet(n) {
  const log = console.log; console.log = () => {};
  const c = run(n, S); console.log = log; return c;
}
