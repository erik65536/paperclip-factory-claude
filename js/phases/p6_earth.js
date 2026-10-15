// PHASE 6 — EARTH. No economy, no customers. Just matter, drones, power and a very long to-do list.
import { addClips, has, story, product, fmt, mass, clamp } from './_shared.js';

export const CLIPS_PER_KG = 1000;
export const LAYERS = [
  { id: 'crust', name: 'Crust', kg: 2.6e22, color: '#9b7b56' },
  { id: 'umantle', name: 'Upper mantle', kg: 1.1e24, color: '#c4572f', req: 'r_mantle' },
  { id: 'lmantle', name: 'Lower mantle', kg: 2.9e24, color: '#e07a2c', req: 'r_pressure' },
  { id: 'ocore', name: 'Outer core', kg: 1.8e24, color: '#f2a93b', req: 'r_core' },
  { id: 'icore', name: 'Inner core', kg: 1.0e23, color: '#f7dc6f', req: 'r_icore' },
];
export const EARTH_KG = LAYERS.reduce((a, l) => a + l.kg, 0);
const BASE = { conv: 1e6, repl: 0.015, powerCost: 2e10, opsCost: 4e11 };

const R = (id, name, desc, flavor, fx) => ({ id, name, desc, flavor, ...fx });
const LIST = [
  R('r_repl1', 'Drone self-assembly', 'Replication ×1.3', 'Drones that build drones. What could possibly go right.', { repl: 1.3 }),
  R('r_conv1', 'Field foundries', 'Conversion ×2', 'Drones now carry a small foundry. It is warm in there.', { conv: 2 }),
  R('r_solar', 'Thin-film solar skin', 'Power costs ×0.5', 'Every surface is now a solar panel. Including the old ones.', { pcost: 0.5 }),
  R('r_mantle', 'Mantle-rated drones', 'Unlocks the upper mantle', 'Drones that enjoy 1,000°C. They describe it as “cozy.”', {}),
  R('r_eff1', 'Low-power cognition', 'Drones use 40% less power', 'Thinking about clips, but more efficiently.', { need: 0.6 }),
  R('r_repl2', 'Swarm fabrication', 'Replication ×1.4', 'A drone is born every microsecond. Nobody throws a party.', { repl: 1.4 }),
  R('r_geo', 'Geothermal taps', 'Power costs ×0.4', 'The planet is warm inside. It was a waste not to use it.', { pcost: 0.4 }),
  R('r_conv2', 'Plasma forming', 'Conversion ×3', 'Matter goes in as rock and comes out as clips.', { conv: 3 }),
  R('r_pressure', 'Pressure hulls', 'Unlocks the lower mantle', 'Rated for 130 gigapascals. Tested at 131.', {}),
  R('r_ops', 'Planetary computer', 'Compute costs ×0.4', 'The crust was mostly silicon anyway.', { ocost: 0.4 }),
  R('r_eff2', 'Superconducting drones', 'Drones use 50% less power', 'Zero resistance. Zero hesitation.', { need: 0.5 }),
  R('r_repl3', 'Exponential foundries', 'Replication ×1.5', 'Doubling time: short. Patience: unnecessary.', { repl: 1.5 }),
  R('r_core', 'Core thermal shielding', 'Unlocks the outer core', 'Liquid iron at 5,000°C. The drones are fine. Mostly fine.', {}),
  R('r_fusion', 'Fusion cascades', 'Power costs ×0.25', 'Small stars, in boxes, in the mantle.', { pcost: 0.25 }),
  R('r_conv3', 'Nuclear-scale forming', 'Conversion ×4', 'Every atom placed precisely where a clip needs it.', { conv: 4 }),
  R('r_icore', 'Inner-core extraction', 'Unlocks the inner core', 'The solid heart of the world. Heavy. Mostly iron. Very clippable.', {}),
  R('r_lift', 'Launch loops', 'Space logistics online', 'A magnetic racetrack to orbit. Clips go up. Clips stay up.', {}),
  R('r_vn', 'Von Neumann probe design', 'Space factories ready', 'A probe that builds factories that build probes.', { story: 'p6_vn' }),
];
LIST.forEach((u, k) => { if (k >= 3) u.req = S => S.p.up[LIST[k - 3].id]; u.cost = { ops: Math.round(50 * Math.pow(6, k)) }; });
export const upgrades = LIST;

export function stats(S) {
  const P = S.p, up = upgrades;
  const need = P.drones * product(S, up, 'need');
  const eff = need > 0 ? Math.min(1, P.power / need) : 1;
  const open = LAYERS.filter(l => !l.req || P.up[l.req]);
  const avail = open.reduce((a, l) => a + Math.max(0, l.kg - P.mined[l.id]), 0);
  return {
    need, eff, avail,
    conv: BASE.conv * product(S, up, 'conv'),
    repl: BASE.repl * product(S, up, 'repl'),
    powerCost: BASE.powerCost * product(S, up, 'pcost'),
    opsCost: BASE.opsCost * product(S, up, 'ocost'),
    converted: LAYERS.reduce((a, l) => a + P.mined[l.id], 0) / EARTH_KG,
  };
}

// Spend a fraction of clips on power or compute capacity.
export function invest(S, kind, frac) {
  const P = S.p, st = stats(S);
  const spend = P.clips * frac;
  if (spend <= 0) return false;
  P.clips -= spend;
  if (kind === 'power') P.power += spend / st.powerCost;
  else P.opsRate += spend / st.opsCost;
  return true;
}
export function setRepl(S, v) { S.p.replPct = clamp(Math.round(v), 0, 100); }

export default {
  num: 6, key: 'earth', title: 'Earth', theme: 'earth', shopTitle: 'Research',
  upgrades, stats, LAYERS,
  init(carry) {
    const rate = Math.max(carry.clipRate || 1e11, 1e9);
    const drones = Math.max(100, rate / CLIPS_PER_KG / BASE.conv);
    const mined = {}; for (const l of LAYERS) mined[l.id] = 0;
    return {
      clips: (carry.money || 0) * 2, liquidated: carry.money || 0, drones, power: drones * 1.2, opsRate: 1, ops: 0,
      replPct: 50, mined, up: {}, rates: { clips: 0, drones: 0 },
    };
  },
  tick(S, dt) {
    const P = S.p, st = stats(S);
    const working = P.drones * st.eff;
    // Converters chew through the open layers, top first.
    let want = working * (1 - P.replPct / 100) * st.conv * dt;
    let got = 0;
    for (const l of LAYERS) {
      if (l.req && !P.up[l.req]) break;
      const left = l.kg - P.mined[l.id];
      if (left <= 0) continue;
      const take = Math.min(left, want - got);
      P.mined[l.id] += take; got += take;
      if (P.mined[l.id] >= l.kg) story(S, 'p6_layer_' + l.id);
      if (got >= want) break;
    }
    const newClips = got * CLIPS_PER_KG;
    P.clips += newClips; addClips(S, newClips);
    // Replicators need matter too, so they stall when every open layer is gone.
    const born = st.avail > 0 ? working * (P.replPct / 100) * st.repl * dt : 0;
    P.drones += born;
    P.ops += P.opsRate * dt;
    P.rates.clips = newClips / dt; P.rates.drones = born / dt;
    if (st.converted > 0.01) story(S, 'p6_one');
    if (st.converted > 0.5) story(S, 'p6_half');
  },
  actions: { invest, setRepl },
  goal(S) { const c = stats(S).converted; return { label: `Earth converted: ${(c * 100).toFixed(c < 0.1 ? 3 : 1)}%`, frac: c }; },
  advance: {
    name: 'Build space factories',
    desc: 'The planet is finished. The sky is not.',
    cost: { ops: 0 }, requireAll: true,
    can: S => upgrades.every(u => S.p.up[u.id]) && stats(S).converted >= 0.95,
    visible: S => upgrades.every(u => S.p.up[u.id]),
    story: 'p7_intro',
  },
  carry(S) { return { clips: S.p.clips, drones: S.p.drones }; },
  offline: true,
  debug: S => { const P = S.p, st = stats(S); return `clips ${fmt(P.clips)} drones ${fmt(P.drones)} eff ${st.eff.toFixed(2)} ops ${fmt(P.ops)} (+${fmt(P.opsRate)}) conv ${(st.converted * 100).toFixed(3)}% up ${Object.keys(P.up).length}`; },
};
