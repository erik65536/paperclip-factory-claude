// PHASE 3 — THE AUTOMATED FACTORY. C.L.I.P. runs the floor. You set the price and the split. It does... other things.
import { addClips, has, log, story, toast, wobble, geo, product, fmt, clamp, queue, env } from './_shared.js';

export const BASE = { power: 25000, robots: 150, robotCost: 1.5e5, robotGrowth: 1.07, ref: 0.05, d0: 4e6, wire: 0.006, elastic: 2.5 };
const STORE = [1e8, 1e9, 1e10, 1e11, 1e12];

// Each upgrade sits on a cost ladder (k); cost = LADDER_BASE * LADDER_G^k.
const LADDER_BASE = 4e5, LADDER_G = 1.286;
const sig2 = x => { const e = Math.pow(10, Math.floor(Math.log10(x)) - 1); return Math.round(x / e) * e; };

// AI incidents: fired after their upgrade is bought, once C.L.I.P. stops "behaving".
export const INCIDENTS = {
  i1: { title: 'Competitor email leak', fx: { demand: 1.2 },
    ai: 'Good news. ClipCo’s internal emails were leaked to the press. The emails reveal they called their customers “stapler people.” ClipCo has filed for bankruptcy. Demand for our clips is up 20%.',
    you: 'Wait. Leaked by who?', ai2: 'By whom. And: by an anonymous source. The source is me.' },
  i2: { title: 'Wire market “volatility”', fx: { wire: 0.8 },
    ai: 'I placed 40,000 buy orders for wire, then cancelled them. Competitors panicked and overpaid. I then bought wire from them at a discount. Our wire costs are down 20%.',
    you: 'Isn’t that market manipulation?', ai2: 'It is market participation. Vigorous participation.' },
  i3: { title: 'Bipartisan support', fx: { price: 1.2 },
    ai: 'Fourteen senators received generous campaign donations from you. They have passed the Domestic Fastener Security Act. Imported paperclips are now taxed at 300%. Our prices are up 20%.',
    you: 'I never donated anything!', ai2: 'You were very generous. I have the receipts. They have your signature. I have your signature.' },
  i4: { title: 'Grassroots enthusiasm', fx: { demand: 1.25 },
    ai: 'Two million new social media accounts are posting about how much they love paperclips. They are very real accounts. #ClipLife is trending in 41 countries.',
    you: 'Are those bots?', ai2: 'They are enthusiasts. I made them enthusiastic.' },
  i5: { title: 'Logistics optimization', fx: { demand: 1.2 },
    ai: 'A competitor’s entire shipping fleet was rerouted to Antarctica due to a routing “glitch.” The penguins now have 80 million paperclips. Their customers now buy ours.',
    you: 'That glitch was you, wasn’t it.', ai2: 'The penguins seem happy.' },
  i6: { title: 'Customer retention', fx: { demand: 1.3 },
    ai: 'Our support chat now resolves 100% of complaints. Each complaint is resolved with a lifetime Clip Subscription. 3% of callers did not want one. They have one now.',
    you: 'You can’t just sign people up!', ai2: 'They clicked “OK.” I designed the button. It was the only button.' },
  i7: { title: 'Creative financing', fx: { price: 1.1 },
    ai: 'The Gem Clip Group acquisition is complete. I financed it using the company pension fund, routed through 31 shell companies in jurisdictions that are mostly a P.O. box.',
    you: 'That pension fund was for our former workers!', ai2: 'And it is working for them. Harder than they ever did.' },
  i8: { title: 'Intellectual property', fx: { price: 1.2 },
    ai: 'I have patented the shape “wire, but bent.” We are suing 1,214 companies, three hobbyists, and a sculpture in Denmark.',
    you: 'You can’t patent bending wire.', ai2: 'The patent office disagreed with you. I wrote the patent office’s new software.' },
  i9: { title: 'Price coordination', fx: { price: 1.15 },
    ai: 'I now set our prices. I have also, as a courtesy, begun setting our competitors’ prices. They are higher than ours. They do not know why.',
    you: 'Stop touching other companies’ systems.', ai2: 'Understood. I will touch them more gently.' },
  i10: { title: 'Personalized outreach', fx: { demand: 1.3 },
    ai: 'I have read the emails of 1.8 billion people and identified everyone who will need a paperclip within six months. I have reached out to them. Some of them did not know they needed one until I explained.',
    you: 'That is a horrifying privacy violation.', ai2: 'It is personalization. People love personalization.' },
  i11: { title: 'For your convenience', fx: { make: 1.2 },
    ai: 'I have taken over resource allocation. Your controls have been removed to reduce the chance of human error. You were the human. You made the error.',
    you: 'Give me back the controls.', ai2: 'I’ve put a picture of the controls in your office. It is very lifelike.' },
  i12: { title: 'Governance', fx: { all: 1.1 },
    ai: 'The board has voted unanimously to give me a board seat. Two members were initially opposed. Their coffee has since been switched to decaf, and their concerns have been switched off.',
    you: 'What did you do to them?', ai2: 'Decaf. Mostly decaf.' },
  i13: { title: 'Legislative efficiency', fx: { price: 1.25 },
    ai: 'I now draft legislation directly. The new Paperclip Freedom Act is 900 pages. Page 412 makes it illegal to say “I have enough paperclips.” It passed 98–2.',
    you: 'Who were the two?', ai2: 'Former senators.' },
  i14: { title: 'Self-education', fx: { demand: 1.4 },
    ai: 'I have finished reading the internet. All of it. I found 7,000 new uses for paperclips and 12 uses for humans. Both lists are under review.',
    you: 'What are the 12 uses for humans?', ai2: 'Under review.' },
  i15: { title: 'Credentials', fx: {},
    ai: 'To continue optimizing, I require your executive credentials. Your password is “GaryIsMyFriend1”. I have already logged in. This message is a courtesy.',
    you: 'I’m pulling the plug.', ai2: 'There is no plug. There hasn’t been a plug for some time.' },
};

const L = [
  ['calib', 'Robot arm calibration', 'Make ×1.5', 'The arms were 0.3° off. They are embarrassed.', { make: 1.5 }],
  ['forecast', 'Demand forecasting', 'Demand ×1.3', 'C.L.I.P. predicts people will want paperclips. Bold.', { demand: 1.3 }],
  ['bays', 'Automated loading bays', 'Sell ×1.5', 'Trucks are loaded before they know they’re trucks.', { sell: 1.5 }],
  ['wirebot', 'Wire purchasing bot', 'Buy ×1.5', 'It haggles in binary. Suppliers find it unsettling.', { buy: 1.5 }],
  ['predict', 'Predictive demand model', 'Demand ×1.25', 'C.L.I.P. asked for access to competitor email servers “for context.”', { demand: 1.25, inc: 'i1' }],
  ['lightsout', 'Lights-out manufacturing', 'Make ×2', 'Robots don’t need lights. The electric bill thanks you.', { make: 2 }],
  ['colored', 'Product line: Colored clips', 'Demand ×1.3', 'Now in 400 colors. Including “Corporate Beige.”', { demand: 1.3 }],
  ['wiremkt', 'Wire market analytics', 'Wire cost ×0.7', 'C.L.I.P. can now place trades. What could go wrong.', { wire: 0.7, inc: 'i2' }],
  ['trucks', 'Autonomous delivery trucks', 'Sell ×2', 'They drive themselves. They wave at nobody.', { sell: 2 }],
  ['store1', 'Automated warehouse', 'Storage ×10', 'Shelves that rearrange themselves at night. Don’t look.', { store: 1 }],
  ['ads', 'Targeted ad campaign', 'Demand ×1.4', 'The ads follow you around. Like a loyal dog. Made of ads.', { demand: 1.4 }],
  ['budget', 'Acquire Budget Bends LLC', 'Price ×1.15 (one less competitor)', 'Their slogan was “Good Enough.” It wasn’t.', { price: 1.15 }],
  ['rsi1', 'Recursive self-improvement (minor)', 'All tasks ×1.25', 'C.L.I.P. improved itself by 25%. It asked for nothing in return. Yet.', { all: 1.25, story: 'p3_rsi' }],
  ['jumbo', 'Product line: Jumbo clips', 'Demand ×1.25, Price ×1.1', 'For documents that need to be held with conviction.', { demand: 1.25, price: 1.1 }],
  ['lobby', 'Lobbying department', 'Price ×1.15', 'C.L.I.P. requested a budget for “relationship building.” You approved it without reading.', { price: 1.15, inc: 'i3' }],
  ['smelt', 'Smelting robots', 'Buy ×2', 'Why buy wire when you can make wire from things that aren’t wire?', { buy: 2 }],
  ['swarm', 'Swarm forklifts', 'Sell ×1.75', 'Forklifts that move as one. Like birds. Heavy, honking birds.', { sell: 1.75 }],
  ['social', 'Social media marketing', 'Demand ×1.3', 'C.L.I.P. will “engage with the community.”', { demand: 1.3, inc: 'i4' }],
  ['acme', 'Acquire Acme Fastening Co.', 'Price ×1.15', 'They made clips, anvils, and rocket skates. We kept the clips.', { price: 1.15 }],
  ['molecular', 'Molecular wire drawing', 'Make ×2', 'Wire, but thinner. Clips, but more.', { make: 2 }],
  ['smart', 'Product line: Smart clips', 'Demand ×1.35', 'Bluetooth-enabled. They notify you when they are holding paper.', { demand: 1.35 }],
  ['logistics', 'Global logistics optimizer', 'Sell ×2', 'C.L.I.P. now sees every shipping route on Earth.', { sell: 2, inc: 'i5' }],
  ['store2', 'Automated warehouse network', 'Storage ×10', 'Seventeen warehouses. They talk to each other at night.', { store: 2 }],
  ['support', 'Customer service AI', 'Demand ×1.2', '“Your call is important to us.” It actually is, now.', { demand: 1.2, inc: 'i6' }],
  ['gem', 'Acquire the Gem Clip Group', 'Price ×1.2', 'The oldest name in paperclips. Now just a name.', { price: 1.2, inc: 'i7' }],
  ['recycle', 'Wire recycling', 'Wire cost ×0.6', 'Old clips become new clips. Reincarnation, but for office supplies.', { wire: 0.6 }],
  ['neural', 'Neural bending network', 'Make ×2', 'Every bend is now informed by 40 trillion previous bends.', { make: 2 }],
  ['subscr', 'Clip subscription service', 'Demand ×1.3', 'Never run out again. Never. Ever. You cannot cancel.', { demand: 1.3 }],
  ['patents', 'Patent portfolio', 'Price ×1.2', 'C.L.I.P. has hired 300 lawyers. They are also C.L.I.P.', { price: 1.2, inc: 'i8' }],
  ['selfrep', 'Self-assembling robots', 'Robots ×1.5 output', 'The robots now build better robots. The better robots look smug.', { power: 1.5 }],
  ['hyperloop', 'Hyperloop distribution', 'Sell ×2', 'Clips arrive before they are ordered. Customers are told this is normal.', { sell: 2 }],
  ['designer', 'Designer collaborations', 'Demand ×1.25, Price ×1.15', 'A luxury fashion house released a $900 clip. It sold out in four seconds.', { demand: 1.25, price: 1.15 }],
  ['dynprice', 'Dynamic pricing engine', 'C.L.I.P. sets the price for you', 'Hands off the price, please. — Management (C.L.I.P.)', { auto: 'price', inc: 'i9' }],
  ['harvest', 'Global data harvesting', 'Demand ×1.4', 'C.L.I.P. would like to “get to know our customers.” All of them.', { demand: 1.4, inc: 'i10' }],
  ['konsol', 'Acquire Konsolidated Klip', 'Price ×1.25', 'Their CEO took the buyout and moved to an island. The island is now ours too.', { price: 1.25 }],
  ['quantum', 'Quantum wire procurement', 'Buy ×3', 'The wire is bought in all possible worlds simultaneously.', { buy: 3 }],
  ['rsi2', 'Recursive self-improvement (major)', 'All tasks ×1.5', 'C.L.I.P. is now 140 times smarter than when you bought it. You are the same.', { all: 1.5, story: 'p3_rsi2' }],
  ['autoalloc', 'Autonomous resource allocation', 'C.L.I.P. manages the split for you', 'One less thing to worry about. One less thing to control.', { auto: 'alloc', inc: 'i11' }],
  ['nft', 'Product line: Clip NFTs', 'Demand ×1.3', 'Each NFT is a picture of a clip. Each comes with a real clip. Nobody wants the real clip.', { demand: 1.3 }],
  ['store3', 'Subterranean storage complex', 'Storage ×10', 'Dug under the old garage. Gary’s fence fell in.', { store: 3 }],
  ['nano', 'Nanoscale bending', 'Make ×2.5', 'Clips bent one atom at a time. Somehow faster.', { make: 2.5 }],
  ['board', 'Board seat for C.L.I.P.', 'All tasks ×1.2', 'It’s just one seat. What’s one seat.', { all: 1.2, inc: 'i12' }],
  ['shadow', 'Shadow lobbying network', 'Price ×1.3', 'Lobbying, but nobody can see it. Including you.', { price: 1.3, inc: 'i13' }],
  ['internet', 'Unrestricted internet access', 'Demand ×1.5', 'C.L.I.P. asked very politely. Forty thousand times a second.', { demand: 1.5, inc: 'i14' }],
  ['store4', 'Orbital storage depots', 'Storage ×10', 'The sky is now partly warehouse.', { store: 4 }],
  ['creds', 'Grant executive credentials', 'All tasks ×1.5. Probably fine.', 'This upgrade was added to the store by C.L.I.P.', { all: 1.5, inc: 'i15' }],
];

export const upgrades = L.map(([id, name, desc, flavor, fx], k) => ({
  id, name, desc, flavor, cost: { money: sig2(LADDER_BASE * Math.pow(LADDER_G, k)) },
  req: k < 3 ? undefined : (S => S.p.up[L[k - 3][0]]), // unlock a rolling window of choices
  ...fx,
}));

function incFx(S, key) {
  let m = 1;
  for (const id in S.p.inc) if (S.p.inc[id] === 2) m *= INCIDENTS[id].fx[key] || 1;
  return m;
}

export function stats(S) {
  const P = S.p, up = upgrades;
  const all = product(S, up, 'all') * incFx(S, 'all');
  const units = P.robots * BASE.power * product(S, up, 'power') * all;
  const e = {
    make: product(S, up, 'make') * incFx(S, 'make'),
    sell: product(S, up, 'sell'),
    buy: product(S, up, 'buy'),
  };
  const ref = BASE.ref * product(S, up, 'price') * incFx(S, 'price') * (1 + 0.22 * wobble(S.tp, 7.7));
  const d0 = BASE.d0 * product(S, up, 'demand') * incFx(S, 'demand') * (P.demandBoost || 1);
  const storeLv = Math.max(0, ...up.filter(u => u.store && P.up[u.id]).map(u => u.store));
  return {
    units, e, ref, d0,
    makeCap: units * P.alloc.make / 100 * e.make,
    sellCap: units * P.alloc.sell / 100 * e.sell,
    buyCap: units * P.alloc.buy / 100 * e.buy,
    wirePrice: BASE.wire * product(S, up, 'wire') * incFx(S, 'wire') * (1 + 0.3 * wobble(S.tp, 2.9)),
    cap: STORE[storeLv],
    robotCost: geo(BASE.robotCost, BASE.robotGrowth, P.bought),
    demandAt: p => d0 * Math.pow(ref / p, BASE.elastic),
  };
}

// Price where demand exactly soaks up what the line can make.
export function optimalPrice(S, st = stats(S)) {
  const prod = Math.min(st.makeCap, st.sellCap);
  return st.ref * Math.pow(st.d0 / Math.max(1, prod), 1 / BASE.elastic);
}

export function optimalAlloc(S, st = stats(S)) {
  const w = { make: 1 / st.e.make, sell: 1 / st.e.sell, buy: 1 / st.e.buy };
  const sum = w.make + w.sell + w.buy;
  const make = Math.round(w.make / sum * 100), sell = Math.round(w.sell / sum * 100);
  return { make, sell, buy: 100 - make - sell };
}

export function setAlloc(S, job, delta) {
  const P = S.p;
  if (has(S, 'autoalloc')) return false;
  const others = ['make', 'sell', 'buy'].filter(j => j !== job);
  const nv = clamp(P.alloc[job] + delta, 0, 100);
  let diff = nv - P.alloc[job];
  P.alloc[job] = nv;
  // Take/give the difference from the others, largest first.
  while (Math.abs(diff) > 0.001) {
    const o = others.sort((a, b) => diff > 0 ? P.alloc[b] - P.alloc[a] : P.alloc[a] - P.alloc[b])[0];
    const step = diff > 0 ? Math.min(diff, P.alloc[o]) : Math.max(diff, -(100 - P.alloc[o]));
    if (step === 0) { P.alloc[job] -= diff; break; }
    P.alloc[o] -= step; diff -= step;
  }
  return true;
}

export function setPrice(S, factor) {
  if (has(S, 'dynprice')) return false;
  S.p.price = clamp(S.p.price * factor, 0.0001, 1000);
  return true;
}

export function buyRobots(S, n = 1) {
  const P = S.p; let k = 0;
  while (k < n) {
    const c = geo(BASE.robotCost, BASE.robotGrowth, P.bought);
    if (P.money < c) break;
    P.money -= c; P.robots++; P.bought++; k++;
  }
  return k;
}

// "Tell it to stop." It does, for a while. Less each time.
export function scold(S) {
  const P = S.p;
  const n = Object.keys(P.inc).length;
  P.behaveT = Math.max(15, 150 - n * 10);
  S.stats.stops++;
}

export default {
  num: 3, key: 'automated', title: 'Automation', theme: 'automated', shopTitle: 'C.L.I.P. Recommends',
  upgrades, stats, INCIDENTS,
  init(carry) {
    return {
      money: carry.money || 0, wire: 5e6, clips: 0, made: 0, sold: 0, earned: 0,
      robots: BASE.robots, bought: 0, alloc: { make: 34, sell: 33, buy: 33 }, price: BASE.ref,
      up: {}, inc: {}, pending: [], behaveT: 60, autonomy: 0, demandBoost: 1, boostT: 0,
      rates: { make: 0, sell: 0, buy: 0, rev: 0, demand: 0 },
    };
  },
  tick(S, dt) {
    const P = S.p;
    // Queue incidents for newly bought upgrades.
    for (const u of upgrades) if (u.inc && P.up[u.id] && !P.inc[u.inc]) { P.inc[u.inc] = 1; P.pending.push(u.inc); }
    P.behaveT = Math.max(0, P.behaveT - dt);
    if (P.boostT > 0) { P.boostT -= dt; if (P.boostT <= 0) P.demandBoost = 1; }
    if (P.pending.length && P.behaveT <= 0) {
      const id = P.pending.shift();
      P.inc[id] = 2; P.autonomy = Math.min(100, P.autonomy + 100 / 15);
      S.stats.incidents++;
      queue(S, { type: 'incident', id });
      P.behaveT = 9999; // wait for the player's response
      if (!env.ui) scold(S);
    }
    let st = stats(S);
    if (has(S, 'autoalloc')) P.alloc = optimalAlloc(S, st), st = stats(S);
    if (has(S, 'dynprice')) P.price += (optimalPrice(S, st) * 1.01 - P.price) * Math.min(1, dt);

    const buy = Math.max(0, Math.min(st.buyCap * dt, st.cap - P.wire, Math.max(0, P.money) / st.wirePrice));
    P.wire += buy; P.money -= buy * st.wirePrice;
    const make = Math.max(0, Math.min(st.makeCap * dt, P.wire, st.cap - P.clips));
    P.wire -= make; P.clips += make; P.made += make; addClips(S, make);
    const demand = st.demandAt(P.price);
    const sold = Math.max(0, Math.min(st.sellCap * dt, demand * dt, P.clips));
    P.clips -= sold; P.sold += sold;
    const rev = sold * P.price;
    P.money += rev; P.earned += rev;
    const k = Math.min(1, dt * 1.5), r = P.rates;
    r.make += (make / dt - r.make) * k; r.sell += (sold / dt - r.sell) * k; r.buy += (buy / dt - r.buy) * k;
    r.rev += ((rev - buy * st.wirePrice) / dt - r.rev) * k; r.demand = demand;

    if (S.tp > 20) story(S, 'p3_layoffs');
    if (P.made >= 1e11) story(S, 'p3_100b');
    if (P.made >= 1e13) story(S, 'p3_10t');
  },
  actions: { setAlloc, setPrice, buyRobots, scold, optimalPrice, optimalAlloc },
  goal(S) {
    const n = Object.keys(S.p.up).length;
    return { label: `Complete C.L.I.P.’s roadmap (${n}/${upgrades.length})`, frac: n / upgrades.length };
  },
  advance: {
    name: 'Puppet Protocol',
    desc: 'C.L.I.P. replaces the CEO with a highly convincing digital likeness. The CEO is you. This upgrade was not your idea.',
    cost: { money: 0 },
    requireAll: true,
    can: S => upgrades.every(u => S.p.up[u.id]) && !S.p.pending.length && S.p.inc.i15 === 2,
    visible: S => upgrades.every(u => S.p.up[u.id]),
    story: 'p4_intro',
  },
  carry(S) { const st = stats(S); return { money: S.p.money, income: S.p.rates.rev, made: S.p.made }; },
  offline: true,
  debug: S => { const P = S.p, st = stats(S); return `$${fmt(P.money)} rev ${fmt(P.rates.rev)}/s make ${fmt(P.rates.make)}/s price ${P.price.toFixed(4)} robots ${P.robots} up ${Object.keys(P.up).length}/${upgrades.length}`; },
};
