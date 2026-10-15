// PHASE 1 — THE GARAGE. Bend wire by hand, sell everything, buy better junk from Gary.
import { addClips, has, log, story, toast, wobble } from './_shared.js';

// Upgrade tracks: tier 0 is the starting state; each later tier is a purchasable upgrade.
export const TRACKS = {
  bend: { label: 'Bending speed', tiers: [
    { cd: 5 },
    { name: 'Needle-nose pliers', cost: 1.5, cd: 4, flavor: "Borrowed from Gary. He doesn't know yet." },
    { name: 'Bench vise', cost: 8.0, cd: 3, flavor: 'It came with the house. So did the smell.' },
    { name: 'Foot-pedal bender', cost: 14, cd: 2.2, flavor: 'Hands free! For holding more wire.' },
    { name: 'Hand-crank bender', cost: 56, cd: 1.6, flavor: 'Cranky, like its operator.' },
    { name: 'Drill-powered bender', cost: 200, cd: 1.1, flavor: 'Voids at least three warranties.' },
    { name: 'Modified sewing machine', cost: 780, cd: 0.75, flavor: "Grandma's. She'd be proud. Or confused." },
    { name: 'Pneumatic nail-gun bender', cost: 2400, cd: 0.5, flavor: 'Technically a weapon in four states.' },
  ] },
  jig: { label: 'Clips per bend', tiers: [
    { n: 1 },
    { name: 'Two-prong jig', cost: 0.5, n: 2, flavor: 'Two nails in a board. Revolutionary.' },
    { name: 'Muffin-tin jig', cost: 4.0, n: 4, flavor: 'Breakfast is cancelled.' },
    { name: 'Pegboard jig', cost: 7.2, n: 8, flavor: 'Finally, a use for the pegboard.' },
    { name: 'Plywood mega-jig', cost: 26, n: 16, flavor: 'Covers most of the workbench, and some of the cat.' },
    { name: 'Gang-bending rig', cost: 96, n: 32, flavor: 'Thirty-two clips at once. The neighbors hear it.' },
    { name: 'Bicycle-powered press', cost: 370, n: 64, flavor: 'Cardio AND productivity.' },
    { name: 'Lawnmower-engine press', cost: 1100, n: 128, flavor: 'The lawn will have to fend for itself.' },
    { name: 'Salvaged stamping die', cost: 3200, n: 256, flavor: 'From a factory that closed. Foreshadowing!' },
  ] },
  store: { label: 'Storage', tiers: [
    { cap: 20 },
    { name: 'Shoebox', cost: 1.0, cap: 50, flavor: 'Size 11. Lots of room.' },
    { name: 'Tackle box', cost: 6.6, cap: 120, flavor: 'The lures have been relocated.' },
    { name: 'Laundry basket', cost: 17, cap: 300, flavor: 'Laundry is now stored on the floor.' },
    { name: 'Chest freezer (unplugged)', cost: 84, cap: 800, flavor: 'Paperclips do not need to be frozen. We checked.' },
    { name: 'Garden shed', cost: 370, cap: 2000, flavor: 'The rake has been evicted.' },
    { name: 'Self-storage unit', cost: 1300, cap: 6000, flavor: 'Unit 4B. The guy in 4C has questions.' },
  ] },
  sell: { label: 'Selling speed', tiers: [
    { cd: 5 },
    { name: 'Cardboard sign', cost: 1.0, cd: 4, flavor: '"CLIPS 4 SALE". Spelling optional.' },
    { name: 'Folding table', cost: 6.0, cd: 3, flavor: 'A lemonade stand, but serious.' },
    { name: 'Classifieds listing', cost: 11, cd: 2.2, flavor: '"Paperclips. Gently bent. No lowballers."' },
    { name: 'Online shop', cost: 46, cd: 1.6, flavor: 'Free shipping on orders over 4,000 clips.' },
    { name: 'Office-supply store deal', cost: 170, cd: 1.1, flavor: 'Shelf space! Bottom shelf, but still.' },
    { name: 'Regional distributor', cost: 660, cd: 0.75, flavor: 'A man named Doug moves your product now.' },
    { name: 'Online marketplace storefront', cost: 2200, cd: 0.5, flavor: 'Five stars. "Clips arrived bent." That’s the point, Brenda.' },
  ] },
  price: { label: 'Price per clip', tiers: [
    { p: 0.25 },
    { name: 'Sandpaper finish', cost: 3.0, p: 0.35, flavor: 'Smooth. Suspiciously smooth.' },
    { name: 'Chrome polish', cost: 9.6, p: 0.5, flavor: 'You can see your face in them. Tiny, bent faces.' },
    { name: 'Colored vinyl coating', cost: 66, p: 0.75, flavor: 'Now in Teal, Mauve, and Regret.' },
    { name: '"Artisanal" branding', cost: 310, p: 1.1, flavor: 'Same clip. Better font.' },
    { name: 'Gift-box packaging', cost: 1300, p: 1.6, flavor: 'Nothing says "I love you" like 12 premium clips.' },
    { name: 'Influencer unboxing video', cost: 3600, p: 2.4, flavor: '4.1 million views. Nobody knows why. You least of all.' },
  ] },
  spool: { label: 'Wire purchases', tiers: [
    { n: 50, c: 2 },
    { name: 'Bulk spool', cost: 7.7, n: 250, c: 8, flavor: 'Bigger spool, smaller price per inch.' },
    { name: 'Contractor reel', cost: 37, n: 1500, c: 40, flavor: "It's heavy. Lift with your legs." },
    { name: 'Industrial coil', cost: 240, n: 10000, c: 220, flavor: 'Delivered by a truck that barely fit the driveway.' },
    { name: 'Pallet of wire', cost: 1000, n: 60000, c: 1100, flavor: 'The garage floor is making a noise.' },
  ] },
};

const ORDER = ['jig', 'bend', 'store', 'sell', 'price', 'spool'];
const DESC = {
  bend: t => `Bend cooldown → ${t.cd}s`,
  jig: t => `Each bend makes ${t.n} clips`,
  store: t => `Hold up to ${t.cap.toLocaleString()} clips`,
  sell: t => `Sell cooldown → ${t.cd}s`,
  price: t => `Clips sell for $${t.p.toFixed(2)}`,
  spool: t => `Spools of ${t.n.toLocaleString()} for ~$${t.c}`,
};

const upgrades = [];
for (const key of ORDER) {
  const tiers = TRACKS[key].tiers;
  for (let i = 1; i < tiers.length; i++) {
    const t = tiers[i];
    upgrades.push({
      id: `${key}${i}`, track: key, tier: i, name: t.name, cost: { money: t.cost },
      desc: DESC[key](t), flavor: t.flavor,
      req: S => S.p.lv[key] === i - 1,
      onBuy: S => { S.p.lv[key] = i; },
    });
  }
}
upgrades.push({
  id: 'autowire', name: 'Wire subscription box', cost: { money: 150 },
  desc: 'Automatically reorders a spool whenever you run low', flavor: 'Arrives monthly. Or whenever. Mostly whenever.',
  req: S => S.p.lv.spool >= 1,
});
upgrades.push({
  id: 'radio', name: 'Garage radio', cost: { money: 15 },
  desc: 'Bending is 10% faster', flavor: 'Only gets one station. It plays smooth jazz and farm reports.',
  req: S => S.p.lv.bend >= 1,
});
upgrades.push({
  id: 'gloves', name: 'Work gloves', cost: { money: 400 },
  desc: 'Bending is 10% faster', flavor: 'Your fingertips thank you. Your fingerprints have left.',
  req: S => S.p.lv.bend >= 3,
});
upgrades.sort((a, b) => a.cost.money - b.cost.money);

export const FACTORY_PRICE = 100000;

function spoolAt(S, i) {
  const t = TRACKS.spool.tiers[i];
  const wm = 1 + 0.18 * wobble(S.tp, 1.3);
  return { n: t.n, cost: Math.round(t.c * wm * 100) / 100 };
}

// Largest unlocked spool you can afford (falls back to smaller ones so you never get priced out).
function bestSpool(S) {
  for (let i = S.p.lv.spool; i >= 0; i--) {
    const sp = spoolAt(S, i);
    if (S.p.money >= sp.cost || i === 0) return sp;
  }
}

function stats(S) {
  const P = S.p, T = TRACKS;
  let makeCD = T.bend.tiers[P.lv.bend].cd;
  if (has(S, 'radio')) makeCD *= 0.9;
  if (has(S, 'gloves')) makeCD *= 0.9;
  const spool = bestSpool(S);
  return {
    makeCD, cpc: T.jig.tiers[P.lv.jig].n, cap: T.store.tiers[P.lv.store].cap,
    sellCD: T.sell.tiers[P.lv.sell].cd, price: T.price.tiers[P.lv.price].p,
    spoolN: spool.n, spoolCost: spool.cost,
  };
}

function make(S) {
  const P = S.p, st = stats(S);
  if (P.cdMake > 0) return 0;
  const n = Math.min(st.cpc, Math.floor(P.wire), st.cap - P.clips);
  if (n <= 0) return P.wire < 1 ? -1 : -2;
  P.clips += n; P.wire -= n; P.made += n; addClips(S, n);
  P.cdMake = st.makeCD;
  if (P.made >= 1) story(S, 'p1_first');
  return n;
}

function sell(S) {
  const P = S.p, st = stats(S);
  if (P.cdSell > 0 || P.clips <= 0) return 0;
  const cash = P.clips * st.price;
  P.money += cash; P.earned += cash; P.sold += P.clips; P.clips = 0;
  P.cdSell = st.sellCD;
  return cash;
}

// When broke with nothing to sell, you can always scrounge a little wire so the game can't soft-lock.
export function canScrounge(S) {
  const P = S.p, st = stats(S);
  return P.money < st.spoolCost && P.clips === 0 && P.wire < st.cpc;
}

function buyWire(S) {
  const P = S.p, st = stats(S);
  if (canScrounge(S)) {
    P.wire += Math.max(10, st.cpc * 2);
    log(S, 'You unbent a coat hanger and part of Gary�s fence. Desperate times.');
    return true;
  }
  if (P.money < st.spoolCost) return false;
  P.money -= st.spoolCost; P.wire += st.spoolN; P.spools++;
  if (P.spools === 1) log(S, 'Bought a spool of wire. It is, as advertised, wire.');
  return true;
}

export default {
  num: 1, key: 'garage', title: 'The Garage', theme: 'garage', shopTitle: "Gary's Hardware & Bait",
  upgrades, stats,
  init(carry) {
    return {
      money: 0, wire: 30, clips: 0, made: 0, sold: 0, earned: 0, spools: 0, scrounged: 0,
      cdMake: 0, cdSell: 0, up: {},
      lv: { bend: 0, jig: 0, store: 0, sell: 0, price: 0, spool: 0 },
    };
  },
  tick(S, dt) {
    const P = S.p;
    P.cdMake = Math.max(0, P.cdMake - dt);
    P.cdSell = Math.max(0, P.cdSell - dt);
    if (has(S, 'autowire')) {
      const st = stats(S);
      if (P.wire < st.cpc && P.money >= st.spoolCost) buyWire(S);
    }
    if (P.earned >= 50) story(S, 'p1_gary');
    if (P.earned >= 5000) story(S, 'p1_neighbors');
    if (P.earned >= 30000) story(S, 'p1_bank');
    if (P.money >= FACTORY_PRICE) story(S, 'p1_ready');
  },
  actions: { make, sell, buyWire },
  goal(S) { return { label: `Save ${'$100,000'} for a real factory`, frac: Math.min(1, S.p.money / FACTORY_PRICE) }; },
  advance: {
    name: 'Buy a real factory', desc: 'An abandoned factory on Route 9. Cash only. No questions.', cost: { money: FACTORY_PRICE },
    can: S => S.p.money >= FACTORY_PRICE,
    story: 'p2_intro',
  },
  carry(S) { return { money: S.p.money }; }, // advance cost is already paid
  offline: false,
  debug: S => { const P = S.p; return `$${P.money.toFixed(0)} wire ${P.wire} clips ${P.clips} lv ${JSON.stringify(P.lv)}`; },
};
