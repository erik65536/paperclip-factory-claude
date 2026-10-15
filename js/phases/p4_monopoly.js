// PHASE 4 — CONSOLIDATION. Grow market share region by region until every paperclip on Earth is ours.
import { addClips, has, story, geo, product, fmt, clamp } from './_shared.js';

export const REGIONS = [
  { id: 'na', name: 'North America', w: 0.20 },
  { id: 'eu', name: 'Europe', w: 0.18 },
  { id: 'ea', name: 'East Asia', w: 0.22 },
  { id: 'sa', name: 'South Asia', w: 0.12 },
  { id: 'la', name: 'Latin America', w: 0.09 },
  { id: 'me', name: 'Middle East', w: 0.07 },
  { id: 'af', name: 'Africa', w: 0.08 },
  { id: 'oc', name: 'Oceania', w: 0.04 },
];
export const STEP = 0.05;            // share gained per expansion
export const START_SHARE = 0.15;
const LEVELS = Math.round((1 - START_SHARE) / STEP); // 17 expansions to 100%

// cost ladder for upgrades (multiples of the income you arrive with)
const U = (id, name, mult, desc, flavor, fx = {}) => ({ id, name, mult, desc, flavor, ...fx });
const LIST = [
  U('dc1', 'Regional data center', 8, 'Compute +1/s', 'Cooled by a nearby lake. The lake is warmer now.', { compute: 1 }),
  U('hub1', 'Distribution hubs', 11, 'Expansion costs −15%', 'A warehouse in every time zone.', { exp: 0.85 }),
  U('brand1', 'Global rebrand', 14, 'Income ×1.25', 'New logo: the same paperclip, slightly to the left.', { income: 1.25 }),
  U('dc2', 'Hyperscale server farm', 19, 'Compute +3/s', 'Visible from orbit. Mostly fans.', { compute: 3 }),
  U('route', 'Route optimizer', 25, 'Each compute point cuts expansion costs more', 'Every truck on Earth, planned to the second.', { cmult: 1.5 }),
  U('acq1', 'Acquire Budget-Mart Basics', 33, '+10% share in North America', 'Their clips were 90% clip. Now they are 100% ours.', { acq: { na: 2 } }),
  U('local', 'Localized product lines', 44, 'Income ×1.3', 'Clips in 140 languages. They all say nothing.', { income: 1.3 }),
  U('acq2', 'Acquire Fastenation SE', 59, '+10% share in Europe', 'Paid in full. Their board toasted with sparkling water.', { acq: { eu: 2 } }),
  U('dc3', 'Custom AI chips', 78, 'Compute +8/s', 'Designed by C.L.I.P. Shaped, inexplicably, like paperclips.', { compute: 8 }),
  U('hub2', 'Automated ports', 104, 'Expansion costs −20%', 'Cranes that never sleep, unload ships that never stop.', { exp: 0.8 }),
  U('acq3', 'Acquire Clip Dynasty Holdings', 139, '+10% share in East Asia', 'The largest merger in fastener history. Nobody noticed.', { acq: { ea: 2 } }),
  U('vert', 'Vertical integration', 184, 'Income ×1.4', 'We own the mines, the mills, the trucks, the shelves.', { income: 1.4 }),
  U('acq4', 'Acquire Staple & Sons', 245, '+10% share in South Asia & Oceania', 'They wanted to branch out. They have been pruned.', { acq: { sa: 2, oc: 2 } }),
  U('dc4', 'Undersea data centers', 326, 'Compute +20/s', 'The fish are learning things.', { compute: 20 }),
  U('acq5', 'Acquire OfficeMaximum Holdings', 434, '+10% share in Latin America & Middle East', 'Their slogan was “More.” Ours is “All.”', { acq: { la: 2, me: 2 } }),
  U('hub3', 'Drone delivery mesh', 577, 'Expansion costs −25%', 'Clips arrive by air. Usually on purpose.', { exp: 0.75 }),
  U('acq6', 'Acquire the Riverside Clip Co-op', 767, '+10% share in Africa', 'They held out longest. They were offered a lot of money. Then more.', { acq: { af: 2 } }),
  U('brand2', 'Paperclips as a lifestyle', 1020, 'Income ×1.5', 'Clipfluencers. Clip yoga. Clip-forward cuisine.', { income: 1.5 }),
  U('dc5', 'Orbital compute ring', 1356, 'Compute +50/s', 'Solar powered. Earth-observing. Totally normal.', { compute: 50 }),
  U('total', 'Standardize the global supply chain', 1804, 'Expansion costs −30%', 'One supplier. One standard. One clip.', { exp: 0.7 }),
];
LIST.forEach((u, k) => { if (k >= 4) u.req = S => S.p.up[LIST[k - 4].id]; });
export const upgrades = LIST;

export function stats(S) {
  const P = S.p, up = upgrades;
  const compute = sumOwned(S, 'compute');
  const cmult = product(S, up, 'cmult');
  const computeDiscount = 1 / (1 + 0.04 * compute * cmult);
  const expMult = product(S, up, 'exp') * computeDiscount;
  const share = REGIONS.reduce((a, r) => a + r.w * P.share[r.id], 0);
  const income = P.base * share * product(S, up, 'income');
  return { compute, computeDiscount, expMult, share, income };
}

function sumOwned(S, key) {
  let s = 0; for (const u of upgrades) if (S.p.up[u.id] && u[key]) s += u[key]; return s;
}

export function expandCost(S, rid, st = stats(S)) {
  const P = S.p, r = REGIONS.find(x => x.id === rid);
  const lvl = Math.round((P.share[rid] - START_SHARE) / STEP);
  return P.base * START_SHARE * 25 * (r.w / 0.125) * Math.pow(1.24, lvl) * st.expMult;
}

export function expand(S, rid) {
  const P = S.p;
  if (P.share[rid] >= 1 - 1e-9) return false;
  const c = expandCost(S, rid);
  if (P.money < c) return false;
  P.money -= c;
  P.share[rid] = Math.min(1, P.share[rid] + STEP);
  if (P.share[rid] >= 1 - 1e-9) story(S, 'p4_region');
  return true;
}

const fullAll = S => REGIONS.every(r => S.p.share[r.id] >= 1 - 1e-9);

export default {
  num: 4, key: 'monopoly', title: 'Consolidation', theme: 'monopoly', shopTitle: 'Strategic Initiatives',
  upgrades, stats, REGIONS,
  init(carry) {
    const base = Math.max(carry.income || 1e8, 1e7) / START_SHARE;
    const share = {}; for (const r of REGIONS) share[r.id] = START_SHARE;
    const P = { money: carry.money || 0, base, share, up: {}, made: 0, rates: { income: 0 } };
    for (const u of LIST) u.cost = { money: u.mult * (base * START_SHARE) };
    for (const u of LIST) if (u.acq) u.onBuy = S2 => { for (const k in u.acq) S2.p.share[k] = Math.min(1, S2.p.share[k] + STEP * u.acq[k]); };
    return P;
  },
  // Costs depend on the arrival income, so rebuild them after loading a save.
  hydrate(S) { const b = S.p.base * START_SHARE; for (const u of LIST) { u.cost = { money: u.mult * b }; if (u.acq) u.onBuy = S2 => { for (const k in u.acq) S2.p.share[k] = Math.min(1, S2.p.share[k] + STEP * u.acq[k]); }; } },
  tick(S, dt) {
    const P = S.p, st = stats(S);
    P.money += st.income * dt;
    P.rates.income = st.income;
    const clips = st.income / 0.5 * dt; P.made += clips; addClips(S, clips);
    if (st.share >= 0.5) story(S, 'p4_half');
    if (st.share >= 0.9) story(S, 'p4_ninety');
  },
  actions: { expand, expandCost },
  goal(S) { const st = stats(S); return { label: `Global market share: ${(st.share * 100).toFixed(0)}%`, frac: st.share }; },
  advance: {
    name: 'Declare the Global Paperclip Standard',
    desc: 'Every paperclip on Earth now comes from one source. It is a very good source. It is us.',
    cost: { money: 0 }, requireAll: true,
    can: S => fullAll(S) && upgrades.every(u => S.p.up[u.id]),
    visible: S => fullAll(S),
    story: 'p5_intro',
  },
  carry(S) { return { money: S.p.money, income: stats(S).income }; },
  offline: true,
  debug: S => { const st = stats(S); return `$${fmt(S.p.money)} income ${fmt(st.income)}/s share ${(st.share * 100).toFixed(1)}% up ${Object.keys(S.p.up).length}/${upgrades.length}`; },
};
