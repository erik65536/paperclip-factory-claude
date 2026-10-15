// PHASE 2 — THE MANUAL FACTORY. Hire people, split them between making, shipping and buying wire.
import { addClips, has, log, story, toast, wobble, geo, product, fmt } from './_shared.js';

export const BASE = { make: 260, ship: 390, buy: 390, price: 0.05, wire: 0.01, wage: 0.5, hire: 200, hireGrowth: 1.05 };
export const GOAL = 1e9;
export const AI_PRICE = 2.5e6;

export const FLOOR = [
  { cap: 10 },
  { name: 'Clear out the break room', cost: 8000, cap: 25, flavor: 'Breaks are now taken standing up. Morale is also standing up, barely.' },
  { name: 'Mezzanine level', cost: 60000, cap: 50, flavor: 'A second floor, built by the first floor.' },
  { name: 'East wing', cost: 350000, cap: 100, flavor: 'It was a parking lot. Now everyone carpools. Mandatory.' },
  { name: 'West wing', cost: 1.5e6, cap: 175, flavor: 'Symmetry achieved.' },
  { name: 'Annex across the street', cost: 5e6, cap: 275, flavor: 'Connected by a tunnel. Probably up to code.' },
  { name: 'Second factory', cost: 1.4e7, cap: 400, flavor: 'Same as the first one, but with more paperclips.' },
];
export const STORE = [
  { cap: 1e5 },
  { name: 'Back lot', cost: 6000, cap: 4e5, flavor: 'A tarp and optimism.' },
  { name: 'Small warehouse', cost: 50000, cap: 2e6, flavor: 'Smells like cardboard and ambition.' },
  { name: 'Big warehouse', cost: 400000, cap: 1e7, flavor: 'Has an echo. Paperclips do not echo.' },
  { name: 'Distribution center', cost: 3e6, cap: 6e7, flavor: 'Forklifts drive themselves. Almost.' },
  { name: 'Mega-warehouse', cost: 1.2e7, cap: 3e8, flavor: 'Visible from space, if you squint and are in space.' },
];

const U = (id, name, cost, desc, flavor, fx = {}, req) => ({ id, name, cost: { money: cost }, desc, flavor, req, ...fx });
const madeAtLeast = n => S => S.p.madeTotal >= n;

const LIST = [
  // Machines
  U('m1', 'Wire straightener', 3000, 'Makers ×1.5', 'Straight wire, bent clips. The circle of life.', { make: 1.5 }),
  U('m2', 'Pneumatic benders', 18000, 'Makers ×2', 'Pssshhh-clink. Pssshhh-clink. Forever.', { make: 2 }, S => has(S, 'm1')),
  U('m3', 'Rotary clip formers', 110000, 'Makers ×2', 'Round and round. The clips come out rectangular. Physics is weird.', { make: 2 }, S => has(S, 'm2')),
  U('m4', 'Multi-head clip press', 500000, 'Makers ×2', 'Twelve heads. None of them complain.', { make: 2 }, S => has(S, 'm3')),
  U('m5', 'Conveyor belts everywhere', 2e6, 'Makers ×1.5', 'Even in the bathroom. Especially in the bathroom.', { make: 1.5 }, S => has(S, 'm4')),
  U('m6', 'High-speed forming line', 6e6, 'Makers ×2', 'Faster than the eye can see. Faster than OSHA can see.', { make: 2 }, S => has(S, 'm5')),
  U('m7', 'Experimental laser bender', 1.8e7, 'Makers ×1.5', 'Bends wire with light. Also eyebrows.', { make: 1.5 }, S => has(S, 'm6')),
  // Shipping
  U('s1', 'Hand trucks', 2000, 'Shippers ×1.5', 'Two wheels and a dream.', { ship: 1.5 }),
  U('s2', 'Delivery van', 12000, 'Shippers ×2', 'The logo was painted by Gary. It is mostly a circle.', { ship: 2 }, S => has(S, 's1')),
  U('s3', 'Truck fleet', 80000, 'Shippers ×2', 'Eighteen wheels, one purpose.', { ship: 2 }, S => has(S, 's2')),
  U('s4', 'Regional depots', 400000, 'Shippers ×2', 'Paperclips are now never more than 40 miles away from you.', { ship: 2 }, S => has(S, 's3')),
  U('s5', 'Rail contract', 1.8e6, 'Shippers ×2', 'An entire train. Of clips. Choo choo.', { ship: 2 }, S => has(S, 's4')),
  U('s6', 'Overseas freight', 7e6, 'Shippers ×2', 'The clips get seasick. They do not complain.', { ship: 2 }, S => has(S, 's5')),
  // Wire logistics
  U('b1', 'Forklift', 2500, 'Wire buyers ×1.5', 'Beep. Beep. Beep. Beep.', { buy: 1.5 }),
  U('b2', 'Loading dock', 15000, 'Wire buyers ×2', 'Trucks back in. Wire comes out. Simple.', { buy: 2 }, S => has(S, 'b1')),
  U('b3', 'Rail spur', 300000, 'Wire buyers ×2', 'The train now stops at your door. Rudely.', { buy: 2 }, S => has(S, 'b2')),
  U('b4', 'Direct wire pipeline', 4e6, 'Wire buyers ×3', 'It is just one very, very long wire.', { buy: 3 }, S => has(S, 'b3')),
  // Wire deals
  U('d1', 'Haggle with the supplier', 5000, 'Wire costs 20% less', 'You stared at him until he blinked. Business!', { wire: 0.8 }),
  U('d2', 'Long-term wire contract', 60000, 'Wire costs 25% less', 'Locked in for 10 years. What could change in 10 years?', { wire: 0.75 }, S => has(S, 'd1')),
  U('d3', 'Stake in the wire mill', 800000, 'Wire costs 30% less', 'You own 12% of a wire mill. You visit it on weekends.', { wire: 0.7 }, S => has(S, 'd2')),
  U('d4', 'Wire futures desk', 5e6, 'Wire costs 20% less', 'Betting on wire. The house always wins. You are the house now.', { wire: 0.8 }, S => has(S, 'd3')),
  // Price
  U('p1', 'Company logo', 9000, 'Clip price ×1.15', 'A paperclip. Shaped like a paperclip. Bold.', { price: 1.15 }),
  U('p2', 'Retail partnership', 120000, 'Clip price ×1.2', 'You are now in aisle 14, between staples and despair.', { price: 1.2 }, S => has(S, 'p1')),
  U('p3', 'Government contract', 1e6, 'Clip price ×1.25', 'The Department of Paperwork thanks you for your service.', { price: 1.25 }, S => has(S, 'p2')),
  U('p4', 'Clip of the Month Club', 6e6, 'Clip price ×1.2', 'A surprise clip every month. Spoiler: it is a clip.', { price: 1.2 }, S => has(S, 'p3')),
  // Worker perks
  U('w1', 'Coffee machine', 4000, 'All workers ×1.1', 'Caffeine: the original automation.', { all: 1.1 }),
  U('w2', 'Safety goggles', 25000, 'All workers ×1.1', 'Eye injuries down 90%. The other 10% are Gary.', { all: 1.1 }, S => has(S, 'w1')),
  U('w3', 'Training program', 200000, 'All workers ×1.25', 'Module 1: This is a paperclip. Module 2: Make more.', { all: 1.25 }, S => has(S, 'w2')),
  U('w4', 'Ergonomic stools', 900000, 'All workers ×1.15', 'Lumbar support for the lumbering workforce.', { all: 1.15 }, S => has(S, 'w3')),
  U('w5', 'Night shift', 3e6, 'All workers ×1.4', 'The factory never sleeps. Neither does Gary, apparently.', { all: 1.4 }, S => has(S, 'w4')),
  // Management
  U('foreman', 'Promote Gary to foreman', 10000, 'Unlocks the “Balance crew” button', 'He gets a clipboard. He has never been happier.', {}, S => S.p.hired >= 8),
  U('mega', 'Megaphone', 7000, 'Pep talks boost +75% instead of +50%', 'For when you need to be heard over the sound of progress.', {}),
  U('poster', 'Inspirational posters', 70000, 'Pep talks last 35s instead of 20s', '“HANG IN THERE.” It is a cat. Hanging. From a paperclip.', {}, S => has(S, 'mega')),
  // Late-game "efficiencies"
  U('c1', 'Pizza Fridays (instead of raises)', 1.5e6, 'Wages −15%', 'One slice per employee. Gary had two. There is an investigation.', { wage: 0.85 }, madeAtLeast(2e8)),
  U('c2', 'Replace dental with a wellness poster', 4e6, 'Wages −20%', '“SMILE!” it says. Many cannot.', { wage: 0.8 }, S => has(S, 'c1')),
  U('c3', '“Optional” unpaid overtime', 9e6, 'All workers ×1.2', 'It is optional the way gravity is optional.', { all: 1.2 }, S => has(S, 'c2')),
  U('c4', 'Install a consultant', 1.2e7, 'Wages −10%. Consultant recommends “an AI”.', 'He used the word “synergy” 41 times. You counted.', { wage: 0.9, story: 'p2_consultant' }, S => has(S, 'c3')),
];

for (let i = 1; i < FLOOR.length; i++) {
  const f = FLOOR[i];
  LIST.push(U(`floor${i}`, f.name, f.cost, `Room for ${f.cap} workers`, f.flavor, { onBuy: S => { S.p.floor = i; } }, S => S.p.floor === i - 1));
}
for (let i = 1; i < STORE.length; i++) {
  const f = STORE[i];
  LIST.push(U(`store${i}`, f.name, f.cost, `Store ${fmt(f.cap)} clips and ${fmt(f.cap)} wire`, f.flavor, { onBuy: S => { S.p.store = i; } }, S => S.p.store === i - 1));
}
LIST.sort((a, b) => a.cost.money - b.cost.money);
export const upgrades = LIST;

export function stats(S) {
  const P = S.p, up = upgrades;
  const all = product(S, up, 'all');
  const speech = P.speechT > 0 ? (has(S, 'mega') ? 1.75 : 1.5) : 1;
  const boost = all * speech * (P.boost || 1);
  return {
    make: BASE.make * product(S, up, 'make') * boost,
    ship: BASE.ship * product(S, up, 'ship') * boost,
    buy: BASE.buy * product(S, up, 'buy') * boost,
    price: BASE.price * product(S, up, 'price') * (P.priceBoost || 1),
    wirePrice: BASE.wire * product(S, up, 'wire') * (1 + 0.25 * wobble(S.tp, 4.2)),
    wage: BASE.wage * product(S, up, 'wage'),
    floorCap: FLOOR[P.floor].cap,
    storeCap: STORE[P.store].cap,
    hireCost: geo(BASE.hire, BASE.hireGrowth, P.hired),
    speechLen: has(S, 'poster') ? 35 : 20,
  };
}

export function hire(S, n = 1) {
  const P = S.p;
  let k = 0;
  while (k < n) {
    const st = stats(S);
    if (P.hired >= st.floorCap || P.money < st.hireCost) break;
    P.money -= st.hireCost; P.hired++; P.w.idle++; k++;
    if (P.hired === 1) story(S, 'p2_first_hire');
  }
  // New hires go where they're needed most (makers first, then a balanced split).
  if (k) autoPlace(S, true);
  return k;
}

// Distribute idle workers (or everyone, if rebalance) in the ratio that keeps the line flowing.
export function autoPlace(S, idleOnly = false) {
  const P = S.p, st = stats(S);
  const total = idleOnly ? P.w.idle : P.hired;
  const wM = 1 / st.make, wS = 1 / st.ship, wB = 1 / st.buy, sumW = wM + wS + wB;
  if (!idleOnly) {
    const m = Math.max(1, Math.round(total * wM / sumW));
    const sh = Math.max(total > 1 ? 1 : 0, Math.round(total * wS / sumW));
    P.w = { make: m, ship: sh, buy: Math.max(0, total - m - sh), idle: 0 };
    if (P.w.buy === 0 && total > 2) { P.w.buy = 1; P.w.make--; }
    return;
  }
  // Greedy: put each idle worker into the job whose throughput is currently the bottleneck.
  while (P.w.idle > 0) {
    const cap = { make: P.w.make * st.make, ship: P.w.ship * st.ship, buy: P.w.buy * st.buy };
    const job = cap.make <= cap.ship && cap.make <= cap.buy ? 'make' : cap.ship <= cap.buy ? 'ship' : 'buy';
    P.w[job]++; P.w.idle--;
  }
}

export function move(S, job, delta) {
  const P = S.p;
  if (delta > 0) {
    // Take from idle first, then from the job with the most people.
    for (let i = 0; i < delta; i++) {
      if (P.w.idle > 0) { P.w.idle--; P.w[job]++; continue; }
      const donor = ['make', 'ship', 'buy'].filter(j => j !== job && P.w[j] > 0).sort((a, b) => P.w[b] - P.w[a])[0];
      if (!donor) break;
      P.w[donor]--; P.w[job]++;
    }
  } else {
    const n = Math.min(-delta, P.w[job]);
    P.w[job] -= n; P.w.idle += n;
  }
}

export function speech(S) {
  const P = S.p, st = stats(S);
  if (P.speechCD > 0 || P.hired === 0) return false;
  P.speechT = st.speechLen; P.speechCD = 60;
  return true;
}

export default {
  num: 2, key: 'factory', title: 'The Factory', theme: 'factory', shopTitle: 'Capital Improvements',
  upgrades, stats,
  init(carry) {
    return {
      money: (carry.money || 0) + 20000, wire: 20000, clips: 0, made: 0, madeTotal: 0, sold: 0, earned: 0,
      hired: 0, w: { make: 0, ship: 0, buy: 0, idle: 0 }, floor: 0, store: 0, up: {},
      speechCD: 0, speechT: 0, boost: 1, boostT: 0, priceBoost: 1, rates: { make: 0, ship: 0, buy: 0, profit: 0 },
    };
  },
  tick(S, dt) {
    const P = S.p;
    P.speechCD = Math.max(0, P.speechCD - dt);
    P.speechT = Math.max(0, P.speechT - dt);
    if (P.boostT > 0) { P.boostT -= dt; if (P.boostT <= 0) { P.boost = 1; P.priceBoost = 1; } }
    const st = stats(S);
    const wages = P.hired * st.wage * dt;
    P.money -= wages;
    const buy = Math.max(0, Math.min(P.w.buy * st.buy * dt, st.storeCap - P.wire, Math.max(0, P.money) / st.wirePrice));
    P.wire += buy; P.money -= buy * st.wirePrice;
    const make = Math.max(0, Math.min(P.w.make * st.make * dt, P.wire, st.storeCap - P.clips));
    P.wire -= make; P.clips += make; P.madeTotal += make; addClips(S, make);
    const ship = Math.max(0, Math.min(P.w.ship * st.ship * dt, P.clips));
    P.clips -= ship; P.sold += ship;
    const rev = ship * st.price;
    P.money += rev; P.earned += rev;
    // Smoothed per-second rates for display.
    const k = Math.min(1, dt * 2);
    const r = P.rates;
    r.make += (make / dt - r.make) * k; r.ship += (ship / dt - r.ship) * k; r.buy += (buy / dt - r.buy) * k;
    r.profit += ((rev - wages - buy * st.wirePrice) / dt - r.profit) * k;
    r.wages = P.hired * st.wage;

    if (P.madeTotal >= 1e6) story(S, 'p2_million');
    if (P.madeTotal >= 5e7) story(S, 'p2_union');
    if (P.madeTotal >= 3e8) story(S, 'p2_gary_doubt');
    if (P.madeTotal >= GOAL) story(S, 'p2_goal');
  },
  actions: { hire, move, autoPlace, speech },
  goal(S) { return { label: 'Produce 1 billion paperclips', frac: Math.min(1, S.p.madeTotal / GOAL) }; },
  advance: {
    name: 'Lease C.L.I.P. and automate everything',
    desc: 'Cognitive Logistics & Industrial Planner. Replaces your entire workforce. Comes with a 400-page EULA nobody reads.',
    cost: { money: AI_PRICE },
    can: S => S.p.madeTotal >= GOAL && S.p.money >= AI_PRICE,
    visible: S => S.p.madeTotal >= GOAL,
    story: 'p3_intro',
  },
  carry(S) { return { money: S.p.money, workers: S.p.hired }; }, // advance cost is already paid
  offline: true,
  debug: S => { const P = S.p, st = stats(S); return `$${Math.round(P.money)} made ${(P.madeTotal / 1e6).toFixed(1)}M hired ${P.hired} w ${P.w.make}/${P.w.ship}/${P.w.buy} rate ${Math.round(P.rates.make)}/s profit ${Math.round(P.rates.profit)}/s up ${Object.keys(P.up).length}`; },
};
