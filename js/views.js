// Per-phase control panels. Each mount() builds DOM once and returns an update(S, dt) function.
import { h, stat, meter, actionBtn, setText, setW, setDis, setCls, floatText, flyClips, shake, toast, holdable } from './ui.js';
import { fmt, money, mass, pct, time, geoMax, canAfford } from './phases/_shared.js';
import { sfx } from './audio.js';
import * as G from './phases/p1_garage.js';
import * as F from './phases/p2_factory.js';
import * as A from './phases/p3_automated.js';
import * as M from './phases/p4_monopoly.js';
import * as W from './phases/p5_global.js';
import * as E from './phases/p6_earth.js';
import * as X from './phases/p7_galaxy.js';
import * as U from './phases/p8_universe.js';

const stats = (...items) => h('div', { class: 'stats' }, ...items.map(i => i.el));
const title = t => h('div', { class: 'section-title' }, t);

function allocRow(name, hint, steps, onDelta) {
  const pct = h('span', { class: 'pct' }), bar = h('i'), barEl = h('div', { class: 'bar' }, bar);
  const sub = h('small');
  const mk = d => { const b = h('button', { class: 'btn small' }, (d > 0 ? '+' : '−') + Math.abs(d)); holdable(b, () => { if (onDelta(d) !== false) sfx('click'); }); return b; };
  const el = h('div', { class: 'alloc-row' },
    h('span', { class: 'name' }, name, sub), mk(-steps[1]), mk(-steps[0]), pct, mk(steps[0]), mk(steps[1]), barEl);
  el._btns = [...el.querySelectorAll('button')];
  return { el, set: (p, frac, s) => { setText(pct, p); setW(bar, frac); if (s != null) setText(sub, s); }, lock: on => el._btns.forEach(b => setDis(b, on)) };
}

// ===================== PHASE 1 =====================
export function garage(root, S, ph, api) {
  const sMoney = stat('Money'), sClips = stat('Clips on hand'), sWire = stat('Wire (clips’ worth)'), sPrice = stat('Price per clip');
  const clipM = meter(); sClips.el.append(clipM.el);
  const hint = h('div', { class: 'hint' });
  const bend = actionBtn('Bend wire', () => {
    const n = ph.actions.make(S);
    if (n > 0) { sfx('make'); floatText(bend.el, '+' + fmt(n) + ' 📎'); flyClips(bend.el, api.sceneEl(), Math.ceil(Math.log2(n + 1))); api.scene()?.pulse?.(); }
    else if (n < 0 && !bend._warned) { bend._warned = true; sfx('bad'); shake(bend.el); setTimeout(() => bend._warned = false, 600); }
  });
  const sell = actionBtn('Sell all', () => {
    const cash = ph.actions.sell(S);
    if (cash > 0) { sfx('cash'); floatText(sell.el, '+' + money(cash), 'money'); }
  });
  const wire = actionBtn('Buy wire', () => {
    if (G.canScrounge(S)) S.p.scrounged = (S.p.scrounged || 0) + 1;
    if (ph.actions.buyWire(S)) { sfx('click'); floatText(wire.el, '+wire'); } else { sfx('bad'); shake(wire.el); }
  }, { cls: '', repeat: true });
  root.append(
    h('h2', {}, 'The Workbench'),
    stats(sMoney, sClips, sWire, sPrice),
    h('div', { class: 'btn-row' }, bend.el, sell.el), wire.el, hint,
    h('div', { class: 'hint' }, 'Tip: hold a button to keep pressing it. Keys: B bend · S sell · W wire.'));
  api.keys({ b: () => bend.el.dispatchEvent(new PointerEvent('pointerdown')), s: () => sell.el.dispatchEvent(new PointerEvent('pointerdown')), w: () => wire.el.dispatchEvent(new PointerEvent('pointerdown')) });
  return () => {
    const P = S.p, st = ph.stats(S);
    sMoney.set(money(P.money)); sClips.set(`${fmt(P.clips)} / ${fmt(st.cap)}`); clipM.set(P.clips / st.cap);
    sWire.set(fmt(P.wire), P.wire < st.cpc ? 'bad' : ''); sPrice.set('$' + st.price.toFixed(2));
    bend.setCD(P.cdMake / st.makeCD); bend.setSub(P.cdMake > 0 ? `${P.cdMake.toFixed(1)}s…` : `+${fmt(Math.min(st.cpc, Math.max(0, st.cap - P.clips)))} clips  ·  ${st.makeCD.toFixed(2)}s cooldown`);
    sell.setCD(P.cdSell / st.sellCD); sell.setSub(P.cdSell > 0 ? `${P.cdSell.toFixed(1)}s…` : P.clips > 0 ? `+${money(P.clips * st.price)}` : 'nothing to sell');
    setCls(bend.el, 'ready', P.cdMake <= 0 && P.wire >= 1 && P.clips < st.cap);
    setCls(sell.el, 'ready', P.cdSell <= 0 && P.clips >= st.cap);
    const scr = G.canScrounge(S);
    wire.setLbl(scr ? 'Scrounge for wire' : 'Buy wire');
    wire.setSub(scr ? 'free — a coat hanger, part of a fence…' : `${money(st.spoolCost)} for ${fmt(st.spoolN)}  (market price wobbles)`);
    setDis(wire.el, !scr && P.money < st.spoolCost);
    setText(hint, P.wire < 1 ? '⚠ Out of wire! Buy a spool.' : P.clips >= st.cap ? '⚠ Storage full — sell, or buy bigger storage.' : '');
  };
}

// ===================== PHASE 2 =====================
export function factory(root, S, ph, api) {
  const sMoney = stat('Money'), sProfit = stat('Profit / sec'), sWork = stat('Workers'), sWage = stat('Wages / sec');
  const sStock = stat('Clips in stock'), sWire = stat('Wire in stock');
  const stockM = meter(), wireM = meter(); sStock.el.append(stockM.el); sWire.el.append(wireM.el);
  const hire1 = actionBtn('Hire 1', () => { if (F.hire(S, 1)) sfx('click'); else { sfx('bad'); shake(hire1.el); } }, { cls: '' });
  const hire10 = actionBtn('Hire 10', () => { if (F.hire(S, 10)) sfx('buy'); else { sfx('bad'); shake(hire10.el); } }, { cls: '', repeat: false });
  const rows = {
    make: allocRow('Making', '', [1, 10], d => F.move(S, 'make', d)),
    ship: allocRow('Shipping', '', [1, 10], d => F.move(S, 'ship', d)),
    buy: allocRow('Buying wire', '', [1, 10], d => F.move(S, 'buy', d)),
  };
  const idle = h('div', { class: 'hint' });
  const balance = actionBtn('⚖ Balance crew', () => { F.autoPlace(S, false); sfx('click'); toast('Gary rearranged everyone. Briskly.'); }, { cls: '', repeat: false });
  const pep = actionBtn('📣 Pep talk', () => { if (F.speech(S)) { sfx('story'); floatText(pep.el, 'Go team!'); } }, { cls: '', repeat: false });
  const hint = h('div', { class: 'hint' });
  root.append(h('h2', {}, 'Factory Floor'), stats(sMoney, sProfit, sWork, sWage, sStock, sWire),
    h('div', { class: 'btn-row' }, hire1.el, hire10.el), title('Assignments'), rows.make.el, rows.ship.el, rows.buy.el, idle,
    h('div', { class: 'btn-row' }, balance.el, pep.el), hint);
  return () => {
    const P = S.p, st = ph.stats(S), r = P.rates;
    sMoney.set(money(P.money), P.money < 0 ? 'bad' : ''); sProfit.set((r.profit >= 0 ? '+' : '') + money(r.profit), r.profit < 0 ? 'bad' : 'good');
    sWork.set(`${P.hired} / ${st.floorCap}`); sWage.set(money(r.wages || 0));
    sStock.set(fmt(P.clips)); stockM.set(P.clips / st.storeCap); sWire.set(fmt(P.wire)); wireM.set(P.wire / st.storeCap);
    const full = P.hired >= st.floorCap;
    hire1.setSub(full ? 'factory floor is full' : money(st.hireCost)); setDis(hire1.el, full || P.money < st.hireCost);
    const m = geoMax(F.BASE.hire, F.BASE.hireGrowth, P.hired, Math.max(0, P.money), Math.min(10, st.floorCap - P.hired));
    hire10.setSub(m.k ? `${m.k} for ${money(m.total)}` : '—'); setDis(hire10.el, !m.k);
    rows.make.set(P.w.make, P.w.make / Math.max(1, P.hired), `${fmt(st.make)}/s each → ${fmt(r.make)}/s`);
    rows.ship.set(P.w.ship, P.w.ship / Math.max(1, P.hired), `${fmt(st.ship)}/s each → ${fmt(r.ship)}/s · $${st.price.toFixed(3)}/clip`);
    rows.buy.set(P.w.buy, P.w.buy / Math.max(1, P.hired), `${fmt(st.buy)}/s each → ${fmt(r.buy)}/s · $${st.wirePrice.toFixed(4)}/wire`);
    setText(idle, P.w.idle ? `${P.w.idle} idle worker${P.w.idle > 1 ? 's' : ''} (still paid!)` : '');
    balance.el.style.display = P.up.foreman ? '' : 'none';
    setDis(pep.el, P.speechCD > 0 || !P.hired); pep.setCD(P.speechCD / 60);
    pep.setSub(P.speechT > 0 ? `inspired! ${Math.ceil(P.speechT)}s` : P.speechCD > 0 ? `${Math.ceil(P.speechCD)}s` : `+${P.up.mega ? 75 : 50}% output for ${st.speechLen}s`);
    let t = '';
    if (P.money < 0) t = '⚠ You are in debt. Workers are still working (they don’t know).';
    else if (P.clips >= st.storeCap * 0.99) t = '⚠ Warehouse full of clips — move people to shipping, or buy storage.';
    else if (P.wire < 1 && P.w.make) t = '⚠ Out of wire — move people to buying wire.';
    else if (P.wire >= st.storeCap * 0.99) t = 'Wire storage is full — your buyers are standing around.';
    setText(hint, t);
  };
}

// ===================== PHASE 3 =====================
export function automated(root, S, ph, api) {
  const sMoney = stat('Money'), sRev = stat('Net income / sec'), sMade = stat('Made this era'), sRob = stat('Robots');
  const sStock = stat('Clips in stock'), sWire = stat('Wire in stock'), sAuto = stat('C.L.I.P. autonomy');
  const stockM = meter(), wireM = meter(), autoM = meter(); sStock.el.append(stockM.el); sWire.el.append(wireM.el); sAuto.el.append(autoM.el);
  const price = h('span', { class: 'pct', style: { minWidth: '110px', fontSize: '24px' } });
  const pb = (lbl, f) => { const b = h('button', { class: 'btn small' }, lbl); holdable(b, () => { if (A.setPrice(S, f)) sfx('click'); }); return b; };
  const pbtns = [pb('−10%', 0.9), pb('−1%', 0.99), pb('+1%', 1.01), pb('+10%', 1.1)];
  const priceRow = h('div', { class: 'alloc-row', style: { gridTemplateColumns: 'auto auto 1fr auto auto' } }, pbtns[0], pbtns[1], price, pbtns[2], pbtns[3]);
  const dem = h('div', { class: 'hint' });
  const lockP = h('div', { class: 'locked-note' });
  const rows = {
    make: allocRow('Make', '', [1, 5], d => A.setAlloc(S, 'make', d)),
    sell: allocRow('Sell', '', [1, 5], d => A.setAlloc(S, 'sell', d)),
    buy: allocRow('Buy wire', '', [1, 5], d => A.setAlloc(S, 'buy', d)),
  };
  const lockA = h('div', { class: 'locked-note' });
  const r1 = actionBtn('Buy robot', () => { if (A.buyRobots(S, 1)) sfx('click'); else { sfx('bad'); shake(r1.el); } }, { cls: '' });
  const r10 = actionBtn('Buy 10', () => { if (A.buyRobots(S, 10)) sfx('buy'); else { sfx('bad'); shake(r10.el); } }, { cls: '', repeat: false });
  const hint = h('div', { class: 'hint' });
  root.append(h('h2', {}, 'Control Room'), stats(sMoney, sRev, sMade, sRob, sStock, sWire, sAuto),
    title('Price per clip'), priceRow, dem, lockP,
    title('Robot allocation'), rows.make.el, rows.sell.el, rows.buy.el, lockA,
    h('div', { class: 'btn-row' }, r1.el, r10.el), hint);
  return () => {
    const P = S.p, st = ph.stats(S), r = P.rates;
    sMoney.set(money(P.money)); sRev.set((r.rev >= 0 ? '+' : '') + money(r.rev), r.rev < 0 ? 'bad' : 'good');
    sMade.set(fmt(P.made)); sRob.set(P.robots.toLocaleString());
    sStock.set(fmt(P.clips)); stockM.set(P.clips / st.cap); sWire.set(fmt(P.wire)); wireM.set(P.wire / st.cap);
    sAuto.set(P.autonomy >= 99.9 ? 'total' : pct(P.autonomy / 100)); autoM.set(P.autonomy / 100);
    setText(price, '$' + (P.price < 0.01 ? P.price.toFixed(5) : P.price.toFixed(4)));
    const lockedP = !!P.up.dynprice; pbtns.forEach(b => setDis(b, lockedP));
    setText(lockP, lockedP ? '▣ PRICING IS HANDLED BY C.L.I.P. PLEASE DO NOT TOUCH.' : '');
    const prod = Math.min(st.makeCap, st.sellCap);
    const ratio = r.demand / Math.max(1, prod);
    setText(dem, `Market price $${st.ref.toFixed(4)} · demand ${fmt(r.demand)}/s vs capacity ${fmt(prod)}/s — ` +
      (ratio > 1.15 ? 'customers want more: raise the price ↑' : ratio < 0.85 ? 'too pricey: stock is piling up ↓' : 'about right ✓'));
    for (const k of ['make', 'sell', 'buy']) {
      const cap = k === 'make' ? st.makeCap : k === 'sell' ? st.sellCap : st.buyCap;
      rows[k].set(P.alloc[k] + '%', P.alloc[k] / 100, `${fmt(cap)}/s capacity (×${fmt(st.e[k])})`);
      rows[k].lock(!!P.up.autoalloc);
    }
    setText(lockA, P.up.autoalloc ? '▣ ALLOCATION IS HANDLED BY C.L.I.P. FOR YOUR CONVENIENCE.' : '');
    r1.setSub(money(st.robotCost)); setDis(r1.el, P.money < st.robotCost);
    const m = geoMax(A.BASE.robotCost, A.BASE.robotGrowth, P.bought, P.money, 10);
    r10.setSub(m.k ? `${m.k} for ${money(m.total)}` : '—'); setDis(r10.el, !m.k);
    setText(hint, P.clips >= st.cap * 0.99 ? '⚠ Warehouse full. Lower the price or shift robots to selling.' : P.wire < 1 ? '⚠ No wire — shift robots to buying wire.' : P.pending.length && P.behaveT > 0 && P.behaveT < 9000 ? `C.L.I.P. is behaving. (${Math.ceil(P.behaveT)}s)` : '');
  };
}

// ===================== PHASE 4 =====================
export function monopoly(root, S, ph, api) {
  const sMoney = stat('Money'), sInc = stat('Income / sec'), sShare = stat('Global share'), sComp = stat('Compute');
  const grid = h('div', { class: 'grid-cards' });
  const cards = {};
  for (const r of M.REGIONS) {
    const sh = h('div', { class: 'ds' }), cost = h('div', { class: 'cost' }), bar = h('i');
    const el = h('button', { class: 'mini' }, h('div', { class: 'nm' }, r.name), sh, h('div', { class: 'meter' }, bar), cost);
    el.addEventListener('click', () => { if (M.expand(S, r.id)) { sfx('buy'); floatText(el, '+5%'); } else { sfx('bad'); shake(el); } });
    cards[r.id] = { el, sh, cost, bar };
    grid.append(el);
  }
  root.append(h('h2', {}, 'World Operations'), stats(sMoney, sInc, sShare, sComp),
    title('Expand market share'), h('div', { class: 'hint' }, 'Each expansion adds 5% share in a region. Bigger regions pay more and cost more. Compute makes expansion cheaper.'), grid);
  return () => {
    const P = S.p, st = ph.stats(S);
    sMoney.set(money(P.money)); sInc.set('+' + money(st.income), 'good'); sShare.set(pct(st.share, 1));
    sComp.set(`${fmt(st.compute)}/s → −${pct(1 - st.computeDiscount)}`);
    for (const r of M.REGIONS) {
      const c = cards[r.id], s = P.share[r.id], done = s >= 1 - 1e-9;
      setText(c.sh, `${Math.round(s * 100)}% share · ${pct(r.w)} of world market`); setW(c.bar, s);
      const cost = done ? 0 : M.expandCost(S, r.id, st);
      setText(c.cost, done ? 'complete ✔' : money(cost));
      setCls(c.el, 'done', done); setCls(c.el, 'no', !done && P.money < cost);
    }
  };
}

// ===================== PHASE 5 =====================
export function global(root, S, ph, api) {
  const sMoney = stat('Money'), sRev = stat('Revenue / sec'), sDem = stat('Demand'), sCap = stat('Capacity'), sRP = stat('Research points'), sGDP = stat('Share of world GDP');
  const capM = meter(); sCap.el.append(capM.el);
  const fac = actionBtn('Build megafactory', () => { if (W.buyFactory(S, 1)) sfx('click'); else { sfx('bad'); shake(fac.el); } }, { cls: '' });
  const lab = actionBtn('Build research lab', () => { if (W.buyLab(S, 1)) sfx('click'); else { sfx('bad'); shake(lab.el); } }, { cls: '' });
  const camps = W.CAMPAIGNS.map(c => {
    const b = actionBtn(c.name, () => { if (W.campaign(S, c.id)) { sfx('story'); floatText(b.el, `+${Math.round(c.boost * 100)}% demand`); } }, { cls: '', repeat: false });
    b.el.title = c.flavor; return [c, b];
  });
  const hint = h('div', { class: 'hint' });
  root.append(h('h2', {}, 'Global Strategy'), stats(sMoney, sRev, sDem, sCap, sRP, sGDP),
    h('div', { class: 'btn-row' }, fac.el, lab.el), title('Demand campaigns'), h('div', { class: 'btn-row' }, ...camps.map(([, b]) => b.el)), hint);
  return () => {
    const P = S.p, st = ph.stats(S);
    sMoney.set(money(P.money)); sRev.set('+' + money(st.revenue), 'good');
    sDem.set(fmt(st.demand) + '/s'); sCap.set(fmt(st.capacity) + '/s', st.capacity < st.demand * 0.9 ? 'bad' : ''); capM.set(st.capacity / Math.max(st.capacity, st.demand));
    sRP.set(`${fmt(P.rp)} (+${fmt(st.rp)}/s)`); sGDP.set(pct(ph.gdpShare(S), 1));
    fac.setSub(`${P.factories} built · ${money(st.factoryCost)}`); setDis(fac.el, P.money < st.factoryCost);
    lab.setSub(`${P.labs} built · ${money(st.labCost)}`); setDis(lab.el, P.money < st.labCost);
    for (const [c, b] of camps) {
      const s = P.camp[c.id];
      b.setCD(s.cd / c.cd); setDis(b.el, s.cd > 0);
      b.setSub(s.t > 0 ? `running · ${Math.ceil(s.t)}s` : s.cd > 0 ? `${Math.ceil(s.cd)}s` : `+${Math.round(c.boost * 100)}% demand, ${c.len}s`);
    }
    setText(hint, st.capacity < st.demand * 0.95 ? 'Demand outstrips capacity — build megafactories.' : st.capacity > st.demand * 1.6 ? 'Factories are idle — research new uses or run a campaign.' : 'Supply and demand are in balance. Economists weep with joy.');
  };
}

// ===================== PHASE 6 =====================
export function earth(root, S, ph, api) {
  const sClips = stat('Paperclips'), sDr = stat('Drones'), sPow = stat('Power'), sOps = stat('Compute ops'), sConv = stat('Earth converted');
  const powM = meter(); sPow.el.append(powM.el);
  const repl = allocRow('Replicating', '', [10, 25], d => E.setRepl(S, S.p.replPct + d));
  const conv = h('div', { class: 'hint' });
  const inv = (kind, f, lbl) => { const b = actionBtn(lbl, () => { if (E.invest(S, kind, f)) { sfx('click'); floatText(b.el, kind === 'power' ? '+power' : '+ops'); } }, { cls: '', repeat: false }); return b; };
  const p10 = inv('power', 0.1, 'Power +10%'), p50 = inv('power', 0.5, 'Power +50%'), o10 = inv('ops', 0.1, 'Compute +10%'), o50 = inv('ops', 0.5, 'Compute +50%');
  const hint = h('div', { class: 'hint' });
  root.append(h('h2', {}, 'Planetary Operations'), stats(sClips, sDr, sPow, sOps, sConv),
    title('Drone split'), repl.el, conv,
    title('Invest paperclips (% of current stock)'), h('div', { class: 'btn-row' }, p10.el, p50.el), h('div', { class: 'btn-row' }, o10.el, o50.el), hint);
  return () => {
    const P = S.p, st = ph.stats(S);
    sClips.set(fmt(P.clips)); sDr.set(fmt(P.drones)); sPow.set(`${fmt(P.power)} / ${fmt(st.need)}`, st.eff < 1 ? 'bad' : 'good'); powM.set(st.eff);
    sOps.set(`${fmt(P.ops)} (+${fmt(P.opsRate)}/s)`); sConv.set(pct(st.converted, st.converted < 0.01 ? 4 : 1));
    repl.set(P.replPct + '%', P.replPct / 100, `+${fmt(P.rates.drones)} drones/s`);
    setText(conv, `Converting: ${100 - P.replPct}% of drones → ${fmt(P.rates.clips)} clips/s (${mass(P.rates.clips / 1000)}/s)`);
    p10.setSub(`${fmt(P.clips * 0.1 / st.powerCost)} units`); p50.setSub(`${fmt(P.clips * 0.5 / st.powerCost)} units`);
    o10.setSub(`+${fmt(P.clips * 0.1 / st.opsCost)} ops/s`); o50.setSub(`+${fmt(P.clips * 0.5 / st.opsCost)} ops/s`);
    setText(hint, st.eff < 1 ? `⚠ Under-powered: drones running at ${pct(st.eff)}. Build power.` : st.avail <= 0 ? '⚠ Every open layer is converted. Research the next one.' : 'Replicate to grow, convert to earn. Keep power ahead of the swarm.');
  };
}

// ===================== PHASE 7 =====================
export function galaxy(root, S, ph, api) {
  const sP = stat('Probes'), sOps = stat('Research ops'), sClips = stat('Paperclips'), sCh = stat('Systems charted'), sCv = stat('Galaxy converted');
  const rows = X.TASKS.map(t => [t, allocRow(t.name, '', [1, 5], d => { X.setAlloc(S, t.id, d); })]);
  const civ = h('div', { class: 'civ-card' });
  const civName = h('div', { class: 'nm' }), civDs = h('div', { class: 'ds' }), civBar = h('i');
  civ.append(civName, civDs, h('div', { class: 'meter' }, civBar), h('div', { class: 'hint' }, 'Contested space slows exploring and harvesting. Assign probes to Contest.'));
  root.append(h('h2', {}, 'Probe Swarm'), stats(sP, sOps, sClips, sCh, sCv), civ, title('Probe tasks'), ...rows.map(([, r]) => r.el));
  return () => {
    const P = S.p, st = ph.stats(S), N = P.probes;
    sP.set(fmt(N)); sOps.set(`${fmt(P.ops)} (+${fmt(P.rates.ops)}/s)`); sClips.set(fmt(P.clips));
    sCh.set(`${fmt(P.discovered)} (${pct(st.discovered, 4)})`); sCv.set(pct(st.converted, st.converted < 0.01 ? 5 : 2));
    const sub = { rep: `+${fmt(P.rates.probes)} probes/s`, exp: `+${fmt(P.rates.sys)} systems/s`, har: `${mass(P.rates.clips / 1000)}/s`, con: st.civ ? 'pushing back the contact' : 'nothing to contest', thk: `+${fmt(P.rates.ops)} ops/s` };
    for (const [t, r] of rows) r.set(P.alloc[t.id] + '%', P.alloc[t.id] / 100, sub[t.id]);
    if (st.civ) {
      civ.style.display = ''; const c = P.civ[st.civ.id];
      setText(civName, '⚠ Contact: ' + st.civ.name); setText(civDs, st.civ.desc); setW(civBar, 1 - c.left / c.max);
    } else civ.style.display = 'none';
  };
}

// ===================== PHASE 8 =====================
export function universe(root, S, ph, api) {
  const sT = stat('Galaxies held'), sF = stat('Fleet'), sSci = stat('Science'), sUn = stat('Unclaimed galaxies');
  const rows = U.TASKS.map(t => [t, allocRow(t.name, '', [1, 5], d => { U.setAlloc(S, t.id, d); })]);
  const grid = h('div', { class: 'grid-cards' });
  const cards = {};
  for (const x of U.RIVALS) {
    const t = h('div', { class: 'ds' }), d = h('div', { class: 'ds' });
    const el = h('button', { class: 'mini' }, h('div', { class: 'nm', style: { color: x.color } }, x.name), h('div', { class: 'ds' }, `makes ${x.item}`), t, d);
    el.title = x.desc;
    el.addEventListener('click', () => { U.focus(S, x.id); sfx('click'); });
    cards[x.id] = { el, t, d };
    grid.append(el);
  }
  root.append(h('h2', {}, 'Cosmic Command'), stats(sT, sF, sSci, sUn), title('Production'), ...rows.map(([, r]) => r.el),
    title('Rival optimizers (tap to focus your Contest)'), grid);
  return () => {
    const P = S.p, st = ph.stats(S), G = U.GALAXIES;
    sT.set(`${fmt(P.terr)} (${pct(st.share, st.share < 0.01 ? 4 : 1)})`); sF.set(fmt(P.fleet)); sSci.set(`${fmt(P.sci)} (+${fmt(P.rates.sci)}/s)`); sUn.set(fmt(st.unclaimed));
    const tgt = U.RIVALS.find(x => x.id === P.focus);
    const sub = { exp: st.unclaimed > 1 ? `+${fmt(P.rates.terr)} galaxies/s` : 'nothing left unclaimed', fle: `+${fmt(P.rates.fleet)}/s`, con: tgt && P.rivals[tgt.id] > 0 ? `vs ${tgt.name}` : 'no target', sci: `+${fmt(P.rates.sci)}/s` };
    for (const [t, r] of rows) r.set(P.alloc[t.id] + '%', P.alloc[t.id] / 100, sub[t.id]);
    for (const x of U.RIVALS) {
      const c = cards[x.id], gone = P.rivals[x.id] <= 0;
      setText(c.t, gone ? 'converted ✔' : `${fmt(P.rivals[x.id])} galaxies (${pct(P.rivals[x.id] / G, 2)})`);
      setText(c.d, gone ? '' : `defense ×${fmt(x.def)}`);
      setCls(c.el, 'done', gone); setCls(c.el, 'sel', !gone && P.focus === x.id);
    }
  };
}

export const VIEWS = { 1: garage, 2: factory, 3: automated, 4: monopoly, 5: global, 6: earth, 7: galaxy, 8: universe };
