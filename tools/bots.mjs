// Bot policies per phase. Each tries to play like an attentive (not superhuman) player.
export const BOTS = {};

let acc = 0;
BOTS[1] = (S, ph, dt, h) => {
  acc += dt;
  if (acc < 0.35) return; // human reaction cadence
  acc = 0;
  const P = S.p, A = ph.actions, st = ph.stats(S);
  if (P.wire < st.cpc && !P.up.autowire) A.buyWire(S);
  A.make(S);
  if (P.clips > 0) A.sell(S);
  // Buy upgrades, but keep enough cash for wire.
  const reserve = P.wire < st.cpc * 3 && !P.up.autowire ? st.spoolCost : 0;
  const u = h.cheapestAffordable(S, ph, u => u.cost.money + reserve <= P.money);
  if (u) h.buyUpgrade(u);
};

let acc2 = 0;
BOTS[2] = (S, ph, dt, h) => {
  acc2 += dt;
  if (acc2 < 1) return;
  acc2 = 0;
  const P = S.p, A = ph.actions;
  A.speech(S);
  // Upgrades first (cheapest), then hire with what's left.
  for (let i = 0; i < 3; i++) { const u = h.cheapestAffordable(S, ph); if (!u) break; h.buyUpgrade(u); }
  const st = ph.stats(S);
  if (st.hireCost < P.money * 0.5) A.hire(S, 5);
  A.autoPlace(S, false);
};

let acc3 = 0, priceT = 0;
BOTS[3] = (S, ph, dt, h) => {
  acc3 += dt; priceT += dt;
  if (acc3 < 1) return;
  acc3 = 0;
  const P = S.p, A = ph.actions;
  // A player re-tunes price every ~8s, landing within a few % of optimal.
  if (priceT > 8) { priceT = 0; if (!P.up.dynprice) P.price = A.optimalPrice(S) * (1 + (Math.random() - 0.4) * 0.08); }
  if (!P.up.autoalloc) P.alloc = A.optimalAlloc(S);
  for (let i = 0; i < 3; i++) { const u = h.cheapestAffordable(S, ph); if (!u) break; h.buyUpgrade(u); }
  const next = ph.upgrades.filter(u => !P.up[u.id]).map(u => u.cost.money).sort((a, b) => a - b)[0] || Infinity;
  const st = ph.stats(S);
  if (st.robotCost < P.money * 0.25 || (st.robotCost < P.money && st.robotCost < next * 0.05)) A.buyRobots(S, 10);
};

let acc4 = 0;
BOTS[4] = (S, ph, dt, h) => {
  acc4 += dt;
  if (acc4 < 1) return;
  acc4 = 0;
  const P = S.p, A = ph.actions;
  for (let i = 0; i < 10; i++) {
    const u = ph.upgrades.filter(u => !P.up[u.id]).sort((a, b) => a.cost.money - b.cost.money)[0];
    const r = ph.REGIONS.filter(r => P.share[r.id] < 1 - 1e-9).map(r => [r.id, A.expandCost(S, r.id) / r.w]).sort((a, b) => a[1] - b[1])[0];
    const rc = r ? A.expandCost(S, r[0]) : Infinity;
    if (u && u.cost.money <= rc * 1.5) { if (!h.buyUpgrade(u)) break; }
    else if (r) { if (!A.expand(S, r[0])) break; }
    else break;
  }
};

let acc5 = 0;
BOTS[5] = (S, ph, dt, h) => {
  acc5 += dt;
  if (acc5 < 1) return;
  acc5 = 0;
  const P = S.p, A = ph.actions;
  for (const c of ph.CAMPAIGNS) A.campaign(S, c.id);
  for (let i = 0; i < 3; i++) { const u = h.cheapestAffordable(S, ph); if (!u) break; h.buyUpgrade(u); }
  for (let i = 0; i < 20; i++) {
    const st = ph.stats(S);
    // Keep capacity roughly matched to (unboosted) demand; spend the rest on labs.
    if (st.capacity < st.demand / st.boost * 1.1 && st.factoryCost <= P.money) A.buyFactory(S);
    else if (st.labCost <= P.money) A.buyLab(S);
    else break;
  }
};

let acc6 = 0;
BOTS[6] = (S, ph, dt, h) => {
  acc6 += dt;
  if (acc6 < 2) return;
  acc6 = 0;
  const P = S.p, A = ph.actions, st = ph.stats(S);
  for (let i = 0; i < 3; i++) { const u = h.cheapestAffordable(S, ph); if (!u) break; h.buyUpgrade(u); }
  // Keep power ahead of the swarm; replicate hard while there is matter and power.
  if (st.eff < 1 || P.power < st.need * 1.3) A.invest(S, 'power', 0.5);
  else A.invest(S, 'ops', 0.3);
  const s2 = ph.stats(S);
  A.setRepl(S, s2.avail <= 0 ? 0 : s2.eff < 0.95 ? 10 : 60);
};

let acc7 = 0;
BOTS[7] = (S, ph, dt, h) => {
  acc7 += dt;
  if (acc7 < 3) return;
  acc7 = 0;
  const P = S.p, st = ph.stats(S), N = P.probes, r = st.r;
  for (let i = 0; i < 3; i++) { const u = h.cheapestAffordable(S, ph); if (!u) break; h.buyUpgrade(u); }
  const con = st.civ ? 45 : 0;
  // Harvest capacity vs charted backlog decides explore/harvest split.
  const harCap = N * 0.3 * r.har * st.contested;
  const backlog = st.charted / Math.max(1, harCap); // seconds of harvesting queued
  const exp = st.discovered >= 1 ? 0 : backlog < 60 ? 30 : 10;
  const thk = st.converted >= 0.999 ? 50 : 15;
  const rest = Math.max(0, 100 - con - exp - thk);
  const repShare = st.converted >= 0.999 ? 1 : 0.5;
  P.alloc = { rep: Math.round(rest * repShare), exp, har: rest - Math.round(rest * repShare), con, thk };
};

let acc8 = 0;
BOTS[8] = (S, ph, dt, h) => {
  acc8 += dt;
  if (acc8 < 3) return;
  acc8 = 0;
  const P = S.p, st = ph.stats(S);
  for (let i = 0; i < 3; i++) { const u = h.cheapestAffordable(S, ph); if (!u) break; h.buyUpgrade(u); }
  const left = ph.RIVALS.some(x => P.rivals[x.id] > 0);
  if (st.unclaimed / 2e12 > 0.02) P.alloc = { exp: 50, fle: 25, con: left && P.fleet > 1e9 ? 10 : 0, sci: 15 };
  else P.alloc = { exp: st.unclaimed > 1 ? 10 : 0, fle: 30, con: left ? 40 : 0, sci: 20 };
  const s = P.alloc; s.sci = 100 - s.exp - s.fle - s.con;
  const weakest = ph.RIVALS.filter(x => P.rivals[x.id] > 0).sort((a, b) => P.rivals[a.id] * a.def - P.rivals[b.id] * b.def)[0];
  if (weakest) P.focus = weakest.id;
};
