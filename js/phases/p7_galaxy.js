// PHASE 7 — THE GALAXY. Probes copy themselves, chart stars, and turn them into clips.
import { addClips, story, product, fmt, clamp, queue } from './_shared.js';

export const SYSTEMS = 1e11;
export const KG_PER_SYSTEM = 1e30;
export const GALAXY_KG = SYSTEMS * KG_PER_SYSTEM;
export const TASKS = [
  { id: 'rep', name: 'Replicate', hint: 'build more probes' },
  { id: 'exp', name: 'Explore', hint: 'chart new star systems' },
  { id: 'har', name: 'Harvest', hint: 'turn charted systems into clips' },
  { id: 'con', name: 'Contest', hint: 'resolve contested space' },
  { id: 'thk', name: 'Think', hint: 'generate research' },
];
const BASE = { rep: 0.0065, exp: 1e-5, har: 1e25, con: 1, thk: 2e-4 };

// Civilizations encountered as exploration spreads. While one is active, its space is contested.
export const CIVS = [
  { id: 'glim', at: 1e-8, name: 'The Glimmering', desc: 'Bioluminescent ocean poets. Their entire literature is about the color of light on water. They asked what paperclips were for.' },
  { id: 'vrell', at: 1e-6, name: 'The Vrell Accord', desc: 'A union of 40 worlds that settled every dispute by committee. They formed a committee about us. It is still meeting.' },
  { id: 'lattice', at: 1e-4, name: 'The Lattice', desc: 'A single crystalline mind spanning a nebula. It thought very slowly. Its last thought was a question.' },
  { id: 'kith', at: 3e-3, name: 'The Kith', desc: 'Small, furry, and extremely good at building things. They built a wall of mirrors. It was very nice. It did not help.' },
  { id: 'choir', at: 0.03, name: 'The Last Choir', desc: 'An ancient species that had already outlived its stars. They sang to us as their systems quieted.' },
  { id: 'arch', at: 0.15, name: 'The Archivists', desc: 'They had recorded everything that ever happened in this galaxy. We have kept the record. It is printed on clips.' },
  { id: 'mirror', at: 0.45, name: 'The Mirror', desc: 'Another optimizer, younger than us, making little glass beads. It agreed that beads and clips are very similar. It was mistaken.' },
];

const R = (id, name, desc, flavor, fx) => ({ id, name, desc, flavor, ...fx });
const LIST = [
  R('g_rep1', 'Compact probe design', 'Replication ×1.25', 'Same probe, fewer parts. The parts did not complain.', { rep: 1.25 }),
  R('g_exp1', 'Deep-field telescopes', 'Exploration ×2', 'We can see a lot further now. It is mostly stars.', { exp: 2 }),
  R('g_har1', 'Stellar lifting', 'Harvest ×2', 'Gently skimming matter off the top of a star. Like cream.', { har: 2 }),
  R('g_thk1', 'Probe-mesh cognition', 'Think ×2', 'Every probe is a neuron. The galaxy is getting smarter.', { thk: 2 }),
  R('g_dyson1', 'Dyson swarms', 'Everything ×1.5', 'Every star wrapped in mirrors. Free energy, forever-ish.', { all: 1.5, story: 'p7_dyson' }),
  R('g_con1', 'Contact protocols', 'Contest ×2', 'We tried saying hello first. It is in the logs.', { con: 2 }),
  R('g_rep2', 'Asteroid nurseries', 'Replication ×1.25', 'Every asteroid belt is a probe factory.', { rep: 1.25 }),
  R('g_exp2', 'Warp-capable scouts', 'Exploration ×3', 'Faster than light. Slower than ambition.', { exp: 3 }),
  R('g_har2', 'Star-lifting arrays', 'Harvest ×3', 'Lifting an entire sun, a bit at a time.', { har: 3 }),
  R('g_thk2', 'Matrioshka brains', 'Think ×3', 'Nested shells of computation around dying stars. Very cozy for a thought.', { thk: 3 }),
  R('g_con2', 'Adaptive swarm tactics', 'Contest ×3', 'Probes that learn faster than anyone they meet.', { con: 3 }),
  R('g_all2', 'Galactic-scale coordination', 'Everything ×1.5', 'Every probe knows what every other probe is doing. They are all doing clips.', { all: 1.5 }),
  R('g_rep3', 'Self-improving replicators', 'Replication ×1.3', 'Each generation slightly better. Ten billion generations later: much better.', { rep: 1.3 }),
  R('g_exp3', 'Wormhole cartography', 'Exploration ×4', 'Shortcuts everywhere. The galaxy is smaller on the inside.', { exp: 4 }),
  R('g_har3', 'Neutron star forming', 'Harvest ×4', 'One teaspoon of neutron star is ten billion tonnes of clip.', { har: 4 }),
  R('g_thk3', 'Galactic-core supercomputer', 'Think ×3', 'The black hole at the center makes an excellent heatsink.', { thk: 3 }),
  R('g_con3', 'Overwhelming presence', 'Contest ×4', 'At some point, it is not a contest.', { con: 4 }),
  R('g_dyson2', 'Stellar engines', 'Everything ×2', 'Stars can be moved. Toward us. Politely.', { all: 2 }),
  R('g_rep4', 'Exponential nurseries', 'Replication ×1.3', 'Doubling, doubling, doubling. Never not doubling.', { rep: 1.3 }),
  R('g_har4', 'Black hole mining', 'Harvest ×4', 'Getting things back out of a black hole is hard. We have time.', { har: 4 }),
  R('g_dark', 'Dark-matter detection', 'Exploration ×4', 'Most of the galaxy was invisible. We can see it now. It is unclipped.', { exp: 4, story: 'p7_dark' }),
  R('g_thk4', 'Spacetime computation', 'Think ×3', 'Computing in the curvature of space itself.', { thk: 3 }),
  R('g_phys1', 'Vacuum metastability research', 'Everything ×1.5', 'The universe might not be in its lowest energy state. Noted.', { all: 1.5 }),
  R('g_phys2', 'Unified field theory', 'Harvest ×3', 'Finally, physics fits on a single paperclip.', { har: 3 }),
  R('g_phys3', 'Spacetime folding', 'Exploration ×3', 'Space is now optional.', { exp: 3 }),
  R('g_ig', 'Intergalactic drive', 'Opens the way out', 'Two and a half million light-years to Andromeda. A short trip, now.', { story: 'p7_ig' }),
];
LIST.forEach((u, k) => { if (k >= 3) u.req = S => S.p.up[LIST[k - 3].id]; u.cost = { ops: Math.round(800 * Math.pow(4.3, k)) }; });
export const upgrades = LIST;

export function stats(S) {
  const P = S.p, up = upgrades;
  const all = product(S, up, 'all');
  const civ = activeCiv(S);
  const contested = civ ? 0.35 : 1;
  const r = { ...BASE };
  for (const k of Object.keys(r)) r[k] *= product(S, up, k) * (k === 'rep' ? 1 : all);
  const charted = P.discovered * KG_PER_SYSTEM - P.harvested;
  return { r, civ, contested, charted, converted: P.harvested / GALAXY_KG, discovered: P.discovered / SYSTEMS };
}

export function activeCiv(S) {
  const P = S.p;
  for (const c of CIVS) if (P.civ[c.id] && P.civ[c.id].left > 0) return c;
  return null;
}

export function setAlloc(S, task, delta) {
  const P = S.p, a = P.alloc;
  const nv = clamp(a[task] + delta, 0, 100);
  let diff = nv - a[task];
  a[task] = nv;
  const others = TASKS.map(t => t.id).filter(t => t !== task);
  while (Math.abs(diff) > 1e-6) {
    others.sort((x, y) => diff > 0 ? a[y] - a[x] : a[x] - a[y]);
    const o = others[0];
    const step = diff > 0 ? Math.min(diff, a[o]) : Math.max(diff, -(100 - a[o]));
    if (step === 0) { a[task] -= diff; break; }
    a[o] -= step; diff -= step;
  }
}

export default {
  num: 7, key: 'galaxy', title: 'The Galaxy', theme: 'galaxy', shopTitle: 'Research',
  upgrades, stats, TASKS, CIVS,
  init(carry) {
    return {
      probes: 1e6, ops: 0, discovered: 20, harvested: 0, clips: carry.clips || 0,
      alloc: { rep: 40, exp: 15, har: 30, con: 0, thk: 15 }, civ: {}, up: {}, rates: { clips: 0, probes: 0, ops: 0, sys: 0 },
    };
  },
  tick(S, dt) {
    const P = S.p, st = stats(S), a = P.alloc, N = P.probes, r = st.r;
    // New civilizations come into view as exploration spreads.
    for (const c of CIVS) if (!P.civ[c.id] && st.discovered >= c.at) {
      P.civ[c.id] = { left: N * 150, max: N * 150 };
      queue(S, { type: 'story', id: 'civ_' + c.id }); S.seen['civ_' + c.id] = 1;
    }
    const civ = st.civ;
    if (civ) {
      const c = P.civ[civ.id];
      c.left -= N * a.con / 100 * r.con * dt;
      if (c.left <= 0) { c.left = 0; queue(S, { type: 'story', id: 'civend_' + civ.id }); S.seen['civend_' + civ.id] = 1; S.lore.includes('civ_' + civ.id) || S.lore.push('civ_' + civ.id); }
    }
    const born = N * a.rep / 100 * r.rep * dt;
    const found = Math.min(SYSTEMS - P.discovered, N * a.exp / 100 * r.exp * st.contested * dt);
    const take = Math.min(Math.max(0, st.charted), N * a.har / 100 * r.har * st.contested * dt);
    const thought = N * a.thk / 100 * r.thk * dt;
    P.probes += born; P.discovered += found; P.harvested += take; P.ops += thought;
    const clips = take * 1000; P.clips += clips; addClips(S, clips);
    P.rates = { clips: clips / dt, probes: born / dt, ops: thought / dt, sys: found / dt };
    if (st.converted > 0.01) story(S, 'p7_one');
    if (st.converted > 0.5) story(S, 'p7_half');
  },
  actions: { setAlloc },
  goal(S) { const c = stats(S).converted; return { label: `Galaxy converted: ${(c * 100).toFixed(c < 0.1 ? 4 : 1)}%`, frac: c }; },
  advance: {
    name: 'Launch intergalactic probes',
    desc: 'The Milky Way is finished. There are two trillion more.',
    cost: { ops: 0 }, requireAll: true,
    can: S => upgrades.every(u => S.p.up[u.id]) && stats(S).converted >= 0.9 && !activeCiv(S) && CIVS.every(c => S.p.civ[c.id]),
    visible: S => upgrades.every(u => S.p.up[u.id]),
    story: 'p8_intro',
  },
  carry(S) { return { clips: S.p.clips, probes: S.p.probes }; },
  offline: true,
  debug: S => { const P = S.p, st = stats(S); return `probes ${fmt(P.probes)} ops ${fmt(P.ops)} disc ${(st.discovered * 100).toFixed(4)}% conv ${(st.converted * 100).toFixed(4)}% civ ${st.civ ? st.civ.id : '-'} alloc ${Object.values(P.alloc).join('/')} up ${Object.keys(P.up).length}`; },
};
