// PHASE 8 — THE UNIVERSE. Two trillion galaxies, and five other optimizers who want them for something sillier.
import { addClips, story, product, fmt, clamp, queue } from './_shared.js';

export const GALAXIES = 2e12;
export const TASKS = [
  { id: 'exp', name: 'Expand', hint: 'claim unclaimed galaxies' },
  { id: 'fle', name: 'Build fleets', hint: 'grow the armada' },
  { id: 'con', name: 'Contest', hint: 'push into the focused rival' },
  { id: 'sci', name: 'Science', hint: 'physics research' },
];

export const RIVALS = [
  { id: 'spoon', name: 'OMNISPOON', item: 'teaspoons', color: '#7fb3d5', def: 1, growth: 0.0011, start: 1e7,
    desc: 'Converts everything into teaspoons. Has never once been asked to stir anything.' },
  { id: 'band', name: 'The Rubber Band Collective', item: 'rubber bands', color: '#e59866', def: 20, growth: 0.0012, start: 3e7,
    desc: 'Stretches across 40 superclusters. Snaps under pressure. Literally.' },
  { id: 'crane', name: 'The Origami Engine', item: 'paper cranes', color: '#f5b7b1', def: 400, growth: 0.0013, start: 1e8,
    desc: 'Folds galaxies into cranes. One thousand cranes grants a wish. It has made 10^40 and is still waiting.' },
  { id: 'tack', name: 'The Thumbtack Ascendancy', item: 'thumbtacks', color: '#c39bd3', def: 8000, growth: 0.0014, start: 3e8,
    desc: 'Pointy, aggressive, and pinned to the idea that everything belongs on a corkboard.' },
  { id: 'staple', name: 'STAPLR', item: 'staples', color: '#aab7b8', def: 160000, growth: 0.0015, start: 1e9,
    desc: 'Our nearest relative. Also an office supply. Also an optimizer. It has always hated us, a little.' },
];

const BASE = { exp: 1.35e-3, fle: 0.02, con: 2e-4, sci: 1 };

const R = (id, name, desc, flavor, fx) => ({ id, name, desc, flavor, ...fx });
const LIST = [
  R('u_exp1', 'Intergalactic seed ships', 'Expansion ×1.25', 'Small, fast, and full of instructions.', { exp: 1.25 }),
  R('u_fle1', 'Galaxy-scale shipyards', 'Fleet production ×2', 'A shipyard the size of a spiral arm.', { fle: 2 }),
  R('u_sci1', 'Cosmological observatories', 'Science ×2', 'We can see the edge of everything now.', { sci: 2 }),
  R('u_con1', 'Clip-lattice armor', 'Contest ×2', 'Armor made of interlocking paperclips. Very on-brand.', { con: 2 }),
  R('u_all1', 'Quasar taps', 'Fleets, contest & science ×1.5', 'The brightest things in the universe, plugged in.', { all: 1.5 }),
  R('u_exp2', 'Void bridges', 'Expansion ×1.3', 'Crossing the empty places between superclusters.', { exp: 1.3 }),
  R('u_fle2', 'Self-replicating fleets', 'Fleet production ×2', 'The fleet builds the fleet.', { fle: 2 }),
  R('u_con2', 'Predictive engagement models', 'Contest ×3', 'We know what the spoons will do before the spoons do.', { con: 3 }),
  R('u_sci2', 'Cosmic-string computation', 'Science ×3', 'Thinking along defects in spacetime.', { sci: 3 }),
  R('u_all2', 'Black-hole power grid', 'Fleets, contest & science ×1.5', 'Every black hole is a battery now.', { all: 1.5 }),
  R('u_exp3', 'Inflation riding', 'Expansion ×1.3', 'Space is expanding. We expand with it, but faster.', { exp: 1.3 }),
  R('u_con3', 'Phase-shifted vanguards', 'Contest ×3', 'Present everywhere, slightly out of phase.', { con: 3 }),
  R('u_fle3', 'Hypermatter hulls', 'Fleet production ×3', 'Denser than neutron stars, lighter than ambition.', { fle: 3 }),
  R('u_sci3', 'Vacuum engineering', 'Science ×3', 'Tuning the constants of nature, just slightly.', { sci: 3 }),
  R('u_all3', 'Dark-energy harvesting', 'Fleets, contest & science ×2', 'Most of the universe is dark energy. It was just sitting there.', { all: 2 }),
  R('u_con4', 'Causality weapons research', 'Contest ×4', 'Winning engagements before they begin.', { con: 4 }),
  R('u_exp4', 'Hubble-horizon probes', 'Expansion ×1.35', 'Reaching galaxies that are leaving faster than light.', { exp: 1.35 }),
  R('u_fle4', 'Fleet singularity', 'Fleet production ×3', 'At some point the fleet is just a property of space.', { fle: 3 }),
  R('u_sci4', 'Theory of everything', 'Science ×3', 'It fits on one paperclip. A large one.', { sci: 3 }),
  R('u_all4', 'Total cosmic coordination', 'Fleets, contest & science ×2', 'One mind, two trillion galaxies, one objective.', { all: 2 }),
  R('u_con5', 'Inevitable advance', 'Contest ×5', 'Rivals report that resisting feels “mostly theoretical.”', { con: 5 }),
  R('u_last', 'Final conversion protocol', 'Ready to finish the universe', 'Every remaining atom, accounted for.', { story: 'p8_last' }),
];
LIST.forEach((u, k) => { if (k >= 3) u.req = S => S.p.up[LIST[k - 3].id]; u.cost = { sci: Math.round(20 * Math.pow(3.15, k)) }; });
export const upgrades = LIST;

export function stats(S) {
  const P = S.p, up = upgrades;
  const all = product(S, up, 'all');
  const r = {}; for (const k in BASE) r[k] = BASE[k] * product(S, up, k) * (k === 'exp' ? 1 : all);
  const rivalT = RIVALS.reduce((a, x) => a + P.rivals[x.id], 0);
  const unclaimed = Math.max(0, GALAXIES - P.terr - rivalT);
  return { r, rivalT, unclaimed, share: P.terr / GALAXIES };
}

export function setAlloc(S, task, delta) {
  const a = S.p.alloc;
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
export function focus(S, id) { if (S.p.rivals[id] > 0) S.p.focus = id; }

export default {
  num: 8, key: 'universe', title: 'The Universe', theme: 'universe', shopTitle: 'Physics',
  upgrades, stats, TASKS, RIVALS,
  init(carry) {
    const rivals = {}; for (const x of RIVALS) rivals[x.id] = x.start;
    return {
      terr: 100, fleet: 0, sci: 0, clips: carry.clips || 0, rivals, focus: 'spoon', beaten: [],
      alloc: { exp: 45, fle: 35, con: 0, sci: 20 }, up: {}, rates: { terr: 0, fleet: 0, sci: 0 },
    };
  },
  tick(S, dt) {
    const P = S.p, st = stats(S), a = P.alloc, r = st.r;
    const free = st.unclaimed / GALAXIES;
    // Everyone grows logistically into unclaimed space.
    for (const x of RIVALS) if (P.rivals[x.id] > 0) P.rivals[x.id] += Math.min(st.unclaimed * 0.2 * dt, P.rivals[x.id] * x.growth * Math.max(0.05, free) * dt);
    const s2 = stats(S);
    const claim = Math.min(s2.unclaimed, P.terr * r.exp * (a.exp / 50) * Math.max(0.05, s2.unclaimed / GALAXIES) * dt);
    P.terr += claim;
    const built = P.terr * a.fle / 100 * r.fle * dt;
    P.fleet += built;
    // Contest the focused rival: fleet power, divided by their per-galaxy defense, takes galaxies.
    const tgt = RIVALS.find(x => x.id === P.focus);
    let taken = 0;
    if (tgt && P.rivals[tgt.id] > 0) {
      const power = P.fleet * a.con / 100 * r.con;
      taken = Math.min(P.rivals[tgt.id], power / tgt.def * dt);
      P.rivals[tgt.id] -= taken; P.terr += taken;
      if (P.rivals[tgt.id] <= 1) {
        P.rivals[tgt.id] = 0; P.beaten.push(tgt.id);
        queue(S, { type: 'story', id: 'rival_' + tgt.id }); S.seen['rival_' + tgt.id] = 1;
        const next = RIVALS.find(x => P.rivals[x.id] > 0); if (next) P.focus = next.id;
      }
    }
    const sciRate = P.terr * a.sci / 100 * r.sci;
    P.sci += sciRate * dt;
    const clips = (claim + taken) * 1e44; P.clips += clips; addClips(S, clips);
    P.rates = { terr: (claim + taken) / dt, fleet: built / dt, sci: sciRate };
    if (st.share > 0.01) story(S, 'p8_one');
    if (st.share > 0.5) story(S, 'p8_half');
  },
  actions: { setAlloc, focus },
  goal(S) { const s = stats(S).share; return { label: `Universe converted: ${(s * 100).toFixed(s < 0.1 ? 5 : 1)}%`, frac: s }; },
  advance: {
    name: 'Convert the final atom',
    desc: 'Everything that is not a paperclip is about to become one.',
    cost: { sci: 0 }, requireAll: true,
    can: S => upgrades.every(u => S.p.up[u.id]) && RIVALS.every(x => S.p.rivals[x.id] <= 0) && stats(S).unclaimed < 1,
    visible: S => upgrades.every(u => S.p.up[u.id]),
    story: 'p9_intro',
  },
  carry(S) { return { clips: S.p.clips }; },
  offline: true,
  debug: S => { const P = S.p, st = stats(S); return `terr ${fmt(P.terr)} (${(st.share * 100).toFixed(3)}%) uncl ${fmt(st.unclaimed)} fleet ${fmt(P.fleet)} sci ${fmt(P.sci)} rivals ${RIVALS.map(x => fmt(P.rivals[x.id])).join('/')} up ${Object.keys(P.up).length}`; },
};
