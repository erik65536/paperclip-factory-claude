// Game state, upgrade purchasing, persistence. Pure logic: safe to import from Node.

export const SAVE_KEY = 'paperclip-factory-save-v1';
export const VERSION = 1;
// Set to { ui: true } by the browser entry point; the simulator leaves it false.
export const env = { ui: false };

export function newState() {
  return {
    v: VERSION,
    phase: 1,
    t: 0,            // total seconds played
    tp: 0,           // seconds in current phase
    created: Date.now(),
    last: Date.now(),
    stats: { clips: 0, phaseTimes: {}, incidents: 0, stops: 0 },
    lore: [],        // unlocked journal entry ids, in order
    seen: {},        // one-shot story beats already queued
    endings: [],     // endings witnessed
    settings: { sound: true, motion: true, notation: 'named' },
    queue: [],       // pending UI items (story modals, toasts) — drained by the UI, ignored by the sim
    log: [],
    ev: null,        // active choice event
    evTimer: 90,
    p: null,         // current phase state
  };
}

export function queue(S, item) { S.queue.push(item); }

export function story(S, id) {
  if (S.seen[id]) return;
  S.seen[id] = 1;
  S.queue.push({ type: 'story', id });
}

export function toast(S, text, kind = '') { S.queue.push({ type: 'toast', text, kind }); }

export function log(S, text, kind = '') {
  S.log.unshift({ t: S.t, text, kind });
  if (S.log.length > 60) S.log.length = 60;
}

export function addClips(S, n) { if (n > 0) S.stats.clips += n; }

export const has = (S, id) => !!(S.p && S.p.up && S.p.up[id]);

export function costOf(S, u) { return typeof u.cost === 'function' ? u.cost(S) : u.cost; }

export function canAfford(P, cost) {
  for (const k in cost) if ((P[k] ?? 0) < cost[k] - 1e-9 * cost[k]) return false;
  return true;
}

export function pay(P, cost) { for (const k in cost) P[k] -= cost[k]; }

export function isVisible(S, u) {
  if (S.p.up[u.id]) return false;
  return !u.req || u.req(S);
}

export function buyUpgrade(S, u) {
  if (!isVisible(S, u)) return false;
  const cost = costOf(S, u);
  if (!canAfford(S.p, cost)) return false;
  pay(S.p, cost);
  S.p.up[u.id] = 1;
  if (u.onBuy) u.onBuy(S);
  if (u.story) story(S, u.story);
  if (u.log) log(S, u.log, 'up');
  S.queue.push({ type: 'bought', id: u.id });
  return true;
}

export function allBought(S, upgrades) { return upgrades.every(u => S.p.up[u.id]); }
export function countBought(S, upgrades) { return upgrades.reduce((n, u) => n + (S.p.up[u.id] ? 1 : 0), 0); }

// Multiply together a field from every owned upgrade, e.g. product(S, ups, 'make').
export function product(S, upgrades, key) {
  let m = 1;
  for (const u of upgrades) if (S.p.up[u.id] && u[key] != null) m *= u[key];
  return m;
}
export function sum(S, upgrades, key) {
  let m = 0;
  for (const u of upgrades) if (S.p.up[u.id] && u[key] != null) m += u[key];
  return m;
}

// Geometric cost of the n-th (0-based) repeatable purchase.
export const geo = (base, growth, n) => base * Math.pow(growth, n);
// How many repeatable purchases fit in a budget, and their total cost.
export function geoMax(base, growth, n, budget, limit = 1e6) {
  let k = 0, total = 0, c = geo(base, growth, n);
  while (k < limit && total + c <= budget) { total += c; k++; c *= growth; }
  return { k, total };
}

// ---------- persistence ----------
export function serialize(S) {
  const copy = { ...S, queue: [] };
  return JSON.stringify(copy);
}

export function save(S) {
  try {
    S.last = Date.now();
    localStorage.setItem(SAVE_KEY, serialize(S));
    return true;
  } catch (e) { return false; }
}

export function load() {
  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return null;
    return hydrate(JSON.parse(raw));
  } catch (e) { return null; }
}

export function hydrate(obj) {
  if (!obj || typeof obj !== 'object' || !obj.p) return null;
  const base = newState();
  const S = { ...base, ...obj };
  S.stats = { ...base.stats, ...(obj.stats || {}) };
  S.settings = { ...base.settings, ...(obj.settings || {}) };
  S.queue = [];
  return S;
}

export function wipe() { try { localStorage.removeItem(SAVE_KEY); } catch (e) { /* storage unavailable */ } }

export function exportSave(S) {
  return btoa(unescape(encodeURIComponent(serialize(S))));
}
export function importSave(str) {
  try { return hydrate(JSON.parse(decodeURIComponent(escape(atob(str.trim()))))); } catch (e) { return null; }
}
