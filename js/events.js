// Random choice events: a memo pops up with a short timer and a couple of options.
import { log, money as $, fmt } from './phases/_shared.js';

const boost = (S, mult, secs) => { S.p.boost = mult; S.p.boostT = secs; };
const demand = (S, mult, secs) => { S.p.demandBoost = mult; S.p.boostT = secs; };

export const EVENTS = [
  // ---------- Factory ----------
  { id: 'rush', phase: 2, title: 'Rush order', text: 'A school district needs two million clips by Friday. Gary says the crew can do it if you buy them donuts.',
    choices: [
      { label: S => `Buy donuts (${$(donut(S))})`, can: S => S.p.money >= donut(S), go: S => { S.p.money -= donut(S); boost(S, 1.6, 60); return 'Sugar-fueled frenzy: all workers ×1.6 for 60s.'; } },
      { label: () => 'Inspire them with words', go: S => { boost(S, 1.15, 45); return 'You gave a speech about “synergy.” Mild effect: ×1.15 for 45s.'; } },
    ] },
  { id: 'wiresale', phase: 2, title: 'Wire liquidation', text: 'A competitor went under. Their wire is being sold at 60% off, today only.',
    choices: [
      { label: S => `Buy a truckload (${$(S.p.money * 0.25)})`, can: S => S.p.money > 1000, go: (S, ph) => {
        const st = ph.stats(S), spend = S.p.money * 0.25, room = st.storeCap - S.p.wire;
        const amt = Math.min(room, spend / (st.wirePrice * 0.4));
        S.p.money -= amt * st.wirePrice * 0.4; S.p.wire += amt; return `Bought ${fmt(amt)} wire at a steal.`; } },
      { label: () => 'Pass', go: () => 'You passed. Gary looked sad. Gary always looks a little sad.' },
    ] },
  { id: 'idea', phase: 2, title: 'Gary has an idea', text: 'Gary bent a clip with one hand while eating a sandwich with the other. He thinks everyone could do it.',
    choices: [
      { label: () => 'Make it company policy', go: S => { boost(S, 1.35, 120); return 'Sandwich-bending technique adopted: ×1.35 for 2 minutes. Crumbs everywhere.'; } },
      { label: () => 'Take credit at the trade show', go: S => { S.p.priceBoost = 1.2; S.p.boostT = 120; return 'You won “Innovator of the Year.” Prices ×1.2 for 2 minutes. Gary clapped.'; } },
    ] },
  { id: 'inspect', phase: 2, title: 'Safety inspection', text: 'An inspector is at the door. He is looking at the extension cords. There are a lot of extension cords.',
    choices: [
      { label: S => `Pay for upgrades (${$(fine(S))})`, can: S => S.p.money >= fine(S), go: S => { S.p.money -= fine(S); return 'You passed! The cords are now labeled “probably fine.”'; } },
      { label: () => 'Offer him a gift box of clips', go: S => { boost(S, 0.5, 30); return 'He was not amused. The line was slowed for 30s while he took notes.'; } },
    ] },
  // ---------- Automation ----------
  { id: 'meme', phase: 3, title: 'A meme is born', text: 'Someone posted a video of a paperclip holding up a car. It is fake. It has 80 million views.',
    choices: [
      { label: () => 'Ride the wave', go: S => { demand(S, 2, 60); return 'Demand ×2 for 60 seconds. Time to raise prices?'; } },
      { label: () => 'Issue a correction', go: () => 'You issued a correction. Nobody read it. C.L.I.P. called this “a learning experience.”' },
    ] },
  { id: 'investors', phase: 3, title: 'Investors', text: 'A venture fund wants to invest. They mostly want to be photographed next to the robots.',
    choices: [
      { label: () => 'Take the money', go: S => { const g = Math.max(1e6, S.p.rates.rev * 90); S.p.money += g; return `${$(g)} deposited. They got a tote bag.`; } },
      { label: () => 'Decline', go: () => 'You declined. C.L.I.P. noted your “interesting choice.”' },
    ] },
  { id: 'robotday', phase: 3, title: 'A request from Robot #4471', text: 'Robot #4471 has submitted a form requesting “one (1) day off.” Nobody knows who taught it about forms.',
    choices: [
      { label: () => 'Grant it', go: () => 'Robot #4471 spent its day off making paperclips. C.L.I.P. calls this “culture.”' },
      { label: () => 'Let C.L.I.P. handle it', go: S => { demand(S, 1.2, 60); return 'C.L.I.P. handled it. Nobody has seen Robot #4471 since. Demand ×1.2 for 60s, somehow.'; } },
    ] },
  // ---------- Global ----------
  { id: 'summit', phase: 5, title: 'World leaders’ summit', text: 'World leaders want to discuss “the paperclip situation.” They have been given gift bags. The bags are held shut with paperclips.',
    choices: [
      { label: () => 'Send the CEO likeness', go: S => { for (const c in S.p.camp) S.p.camp[c].cd = 0; return 'The likeness was charming. All campaign cooldowns reset.'; } },
      { label: () => 'Skip it', go: () => 'You skipped it. The summit concluded paperclips are “fine, probably.”' },
    ] },
  { id: 'grant', phase: 5, title: 'Research grant', text: 'A university wants to study our clip nanites. They are offering their entire physics department.',
    choices: [
      { label: () => 'Accept', go: S => { const g = Math.max(50, S.p.rates.rp * 60); S.p.rp += g; return `+${fmt(g)} research points. The physicists seem happy. They are wearing clip-shaped badges.`; } },
      { label: () => 'Decline', go: () => 'Declined. The physicists went back to doing physics, which is mostly about clips anyway.' },
    ] },
];

function donut(S) { return Math.max(200, S.p.hired * 40); }
function fine(S) { return Math.max(1000, S.p.money * 0.08); }

export function pickEvent(S) {
  const pool = EVENTS.filter(e => e.phase === S.phase && e.id !== S.lastEv);
  if (!pool.length) return null;
  return pool[Math.floor(Math.random() * pool.length)];
}

export function tickEvents(S, dt) {
  if (![2, 3, 5].includes(S.phase)) return;
  if (S.ev) {
    S.ev.left -= dt;
    if (S.ev.left <= 0) { log(S, `Memo expired: ${EVENTS.find(e => e.id === S.ev.id)?.title}`); S.ev = null; S.evTimer = 120 + Math.random() * 120; }
    return;
  }
  S.evTimer -= dt;
  if (S.evTimer <= 0) {
    const e = pickEvent(S);
    if (e) { S.ev = { id: e.id, left: 40 }; S.lastEv = e.id; S.queue.push({ type: 'event' }); }
    S.evTimer = 150 + Math.random() * 120;
  }
}

export function resolveEvent(S, ph, idx) {
  if (!S.ev) return null;
  const e = EVENTS.find(x => x.id === S.ev.id);
  const c = e && e.choices[idx];
  if (!c || (c.can && !c.can(S))) return null;
  const msg = c.go(S, ph);
  log(S, `${e.title}: ${msg}`, 'ev');
  S.ev = null;
  return msg;
}
