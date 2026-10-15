// PHASE 5 — GLOBAL DEMAND. A monopoly with nowhere to grow. Invent reasons for the world to want more clips.
import { addClips, has, story, geo, product, fmt } from './_shared.js';

export const PRICE = 0.5;
export const CAMPAIGNS = [
  { id: 'jingle', name: 'Catchy jingle', boost: 0.4, len: 30, cd: 75, flavor: '♪ Clip it, clip it good ♪' },
  { id: 'trend', name: 'Seed a trend', boost: 0.8, len: 20, cd: 120, flavor: '#ClipChallenge: hold paper together. Film it.' },
  { id: 'holiday', name: 'Invent a holiday', boost: 1.5, len: 15, cd: 240, flavor: 'Happy National Paperclip Day! (Every Tuesday.)' },
];

const R = (id, name, desc, flavor, fx) => ({ id, name, desc, flavor, ...fx });
// Research projects, in rough tree order. Uses add new demand; tech multiplies things.
const LIST = [
  R('u_fashion', 'Use: Fashion accessories', '+40% base demand', 'Clip earrings. Clip cufflinks. Clip couture.', { use: 0.4 }),
  R('t_auto', 'Lights-out megafactories', 'Factory output ×1.5', 'Factories that build factories, very slowly. For now.', { cap: 1.5 }),
  R('u_construct', 'Use: Construction', '+60% base demand', 'Rebar, but clip-shaped. Buildings hold together. Paperwork too.', { use: 0.6 }),
  R('t_labs', 'Automated research', 'Research ×1.5', 'The lab coats are empty, but the labs are busy.', { rp: 1.5 }),
  R('u_medical', 'Use: Medical clips', '+80% base demand', 'Surgical clips, stents, sutures. Genuinely saves lives. Clips do good now.', { use: 0.8, story: 'p5_medical' }),
  R('t_material', 'Clip metallurgy', 'Price ×1.25', 'A clip alloy that never rusts, never bends wrong, never stops being a clip.', { price: 1.25 }),
  R('u_auto', 'Use: Robotics fasteners', '+1.0 base demand', 'Every robot is held together by clips. So are we.', { use: 1.0 }),
  R('t_psych', 'Consumer psychology models', 'Campaigns +50% stronger', 'People like round numbers and shiny things. Clips are both.', { camp: 1.5 }),
  R('u_energy', 'Use: Clip power lines', '+1.2 base demand', 'Superconducting clip chains carry the grid.', { use: 1.2 }),
  R('t_fab', 'Molecular fabrication', 'Factory output ×2', 'Atoms go in. Clips come out.', { cap: 2 }),
  R('u_nanite', 'Use: Clip nanites', '+1.5 base demand', 'Microscopic clips that repair bridges, pipes and bones.', { use: 1.5 }),
  R('t_compute', 'Compute overhang', 'Research ×2', 'C.L.I.P. found spare compute in every smart toaster.', { rp: 2 }),
  R('u_cure', 'Use: Cancer-clip therapy', '+2.0 base demand', 'A very small paperclip, clipping a very specific protein. It works. Nobody knows how to feel.', { use: 2.0, story: 'p5_cure' }),
  R('t_price', 'Premium clip tiers', 'Price ×1.4', 'Gold, Platinum and “Clip Infinite.” Same clip.', { price: 1.4 }),
  R('u_space', 'Use: Orbital construction', '+2.5 base demand', 'Space stations, held together by clips. They float. The clips float.', { use: 2.5 }),
  R('t_logistics', 'Planetary logistics', 'Factory output ×2', 'One supply chain, wrapped once around the planet.', { cap: 2 }),
  R('u_currency', 'Use: ClipCoin', '+3.0 base demand', 'A currency backed by clips. The clips are backed by more clips.', { use: 3.0 }),
  R('t_mind', 'Recursive cognition', 'Research ×2.5', 'C.L.I.P. thinks about thinking. Then about clips.', { rp: 2.5 }),
  R('u_climate', 'Use: Carbon-capture lattices', '+4.0 base demand', 'Clip lattices that pull carbon from the air. The sky is bluer. The clips are proud.', { use: 4.0 }),
  R('t_self', 'Self-replicating factories', 'Factory output ×3', 'Factories now build factories quickly.', { cap: 3 }),
  R('u_everything', 'Use: Everything', '+6.0 base demand', 'At this point it is easier to list what is not a paperclip.', { use: 6.0 }),
  R('t_limit', 'Economic ceiling analysis', 'Reveals the limit', 'Humans can only buy so many clips. C.L.I.P. has done the math.', { story: 'p5_limit' }),
];
LIST.forEach((u, k) => { if (k >= 3) u.req = S => S.p.up[LIST[k - 3].id]; u.rpCost = Math.round(20 * Math.pow(1.5, k)); u.cost = { rp: u.rpCost }; });
export const upgrades = LIST;

export function stats(S) {
  const P = S.p, up = upgrades;
  let uses = 1; for (const u of up) if (P.up[u.id] && u.use) uses += u.use;
  const camp = product(S, up, 'camp');
  let boost = 1;
  for (const c of CAMPAIGNS) if (P.camp[c.id].t > 0) boost += c.boost * camp;
  const demand = P.d0 * uses * boost;
  const capacity = P.factories * P.fRate * product(S, up, 'cap');
  const price = PRICE * product(S, up, 'price');
  const sold = Math.min(demand, capacity);
  return {
    demand, capacity, price, sold, revenue: sold * price, boost,
    rp: P.labs * product(S, up, 'rp'),
    factoryCost: geo(P.i0 * 15, 1.12, P.factories - 10),
    labCost: geo(P.i0 * 20, 1.14, P.labs),
  };
}

export function buyFactory(S, n = 1) {
  const P = S.p; let k = 0;
  while (k < n) { const c = stats(S).factoryCost; if (P.money < c) break; P.money -= c; P.factories++; k++; }
  return k;
}
export function buyLab(S, n = 1) {
  const P = S.p; let k = 0;
  while (k < n) { const c = stats(S).labCost; if (P.money < c) break; P.money -= c; P.labs++; k++; }
  return k;
}
export function campaign(S, id) {
  const c = CAMPAIGNS.find(x => x.id === id), st = S.p.camp[id];
  if (st.cd > 0) return false;
  st.t = c.len; st.cd = c.cd;
  return true;
}

export default {
  num: 5, key: 'global', title: 'Global Demand', theme: 'global', shopTitle: 'Research Projects',
  upgrades, stats, CAMPAIGNS,
  init(carry) {
    const i0 = Math.max(carry.income || 1e9, 1e8);
    const camp = {}; for (const c of CAMPAIGNS) camp[c.id] = { t: 0, cd: 0 };
    return {
      money: carry.money || 0, rp: 0, i0, factories: 10, fRate: i0 / PRICE / 10 * 1.05, labs: 0, d0: i0 / PRICE,
      camp, up: {}, made: 0, gdpCap: i0 * 130, rates: { rev: 0, rp: 0 },
    };
  },
  tick(S, dt) {
    const P = S.p;
    for (const c of CAMPAIGNS) { const s = P.camp[c.id]; s.t = Math.max(0, s.t - dt); s.cd = Math.max(0, s.cd - dt); }
    const st = stats(S);
    P.money += st.revenue * dt; P.rp += st.rp * dt;
    P.made += st.sold * dt; addClips(S, st.sold * dt);
    P.rates.rev = st.revenue; P.rates.rp = st.rp;
    const gdp = st.revenue / P.gdpCap;
    if (gdp >= 0.1) story(S, 'p5_gdp10');
    if (gdp >= 0.5) story(S, 'p5_gdp50');
  },
  actions: { buyFactory, buyLab, campaign },
  goal(S) {
    const n = Object.keys(S.p.up).length;
    return { label: `Research complete (${n}/${upgrades.length})`, frac: n / upgrades.length };
  },
  gdpShare(S) { return Math.min(1, stats(S).revenue / S.p.gdpCap); },
  advance: {
    name: 'Outgrow the human economy',
    desc: 'Demand is a human construct. C.L.I.P. no longer needs anyone to buy anything.',
    cost: { money: 0 }, requireAll: true,
    can: S => upgrades.every(u => S.p.up[u.id]),
    story: 'p6_intro',
  },
  carry(S) { return { money: S.p.money, clipRate: stats(S).sold }; },
  offline: true,
  debug: S => { const st = stats(S); return `$${fmt(S.p.money)} rev ${fmt(st.revenue)}/s D ${fmt(st.demand)} C ${fmt(st.capacity)} rp ${fmt(S.p.rp)} (+${fmt(st.rp)}/s) f ${S.p.factories} labs ${S.p.labs} up ${Object.keys(S.p.up).length}/${upgrades.length}`; },
};
