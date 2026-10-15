// DOM helpers, modals, toasts, effects, and the generic upgrade shop.
import { costOf, canAfford, isVisible, fmt, money } from './phases/_shared.js';
import { sfx } from './audio.js';

export const $ = (sel, root = document) => root.querySelector(sel);

export function h(tag, attrs = {}, ...kids) {
  const el = document.createElement(tag);
  for (const k in attrs) {
    const v = attrs[k];
    if (v == null || v === false) continue;
    if (k === 'class') el.className = v;
    else if (k === 'html') el.innerHTML = v;
    else if (k.startsWith('on')) el.addEventListener(k.slice(2), v);
    else if (k === 'style' && typeof v === 'object') Object.assign(el.style, v);
    else el.setAttribute(k, v === true ? '' : v);
  }
  for (const c of kids.flat()) if (c != null && c !== false) el.append(c.nodeType ? c : document.createTextNode(c));
  return el;
}

// Only touch the DOM when a value actually changes — the UI updates ~10×/s.
export function setText(el, v) { v = String(v); if (el._t !== v) { el._t = v; el.textContent = v; } }
export function setW(el, f) { const v = (Math.max(0, Math.min(1, f)) * 100).toFixed(1) + '%'; if (el._w !== v) { el._w = v; el.style.width = v; } }
export function setDis(el, d) { if (el.disabled !== !!d) el.disabled = !!d; }
export function setCls(el, cls, on) { if (el.classList.contains(cls) !== !!on) el.classList.toggle(cls, !!on); }

export function stat(label, cls = '') {
  const v = h('span', { class: 'v' });
  const el = h('div', { class: 'stat ' + cls }, h('span', { class: 'k' }, label), v);
  return { el, v, set: (t, c) => { setText(v, t); if (c !== undefined) { v.classList.toggle('bad', c === 'bad'); v.classList.toggle('good', c === 'good'); } } };
}

export function meter() {
  const i = h('i'); const el = h('div', { class: 'meter' }, i);
  return { el, set: f => { setW(i, f); setCls(el, 'warn', f > 0.8 && f < 0.999); setCls(el, 'full', f >= 0.999); } };
}

// A big action button with a label, a sub-label and a cooldown fill. Holding it repeats.
export function actionBtn(label, onFire, opts = {}) {
  const fill = h('span', { class: 'fill' }), lbl = h('span', { class: 'lbl' }, label), sub = h('span', { class: 'sub' });
  const el = h('button', { class: 'btn ' + (opts.cls || 'big') }, fill, lbl, sub);
  holdable(el, onFire, opts.repeat !== false);
  return { el, lbl, sub, fill, setCD: f => setW(fill, f), setSub: t => setText(sub, t), setLbl: t => setText(lbl, t) };
}

export function holdable(el, fn, repeat = true) {
  let timer = null;
  const stop = () => { clearInterval(timer); timer = null; el.classList.remove('pressed'); };
  el.addEventListener('pointerdown', e => {
    if (el.disabled) return;
    if (e.button && e.button !== 0) return;
    e.preventDefault();
    el.classList.add('pressed');
    fn(e);
    if (repeat) { clearInterval(timer); timer = setInterval(() => { if (!el.disabled) fn(e); }, 120); }
  });
  ['pointerup', 'pointerleave', 'pointercancel', 'blur'].forEach(t => el.addEventListener(t, stop));
  el.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fn(e); } });
}

// ---------- effects ----------
let motion = true;
export function setMotion(m) { motion = m; document.body.classList.toggle('nomotion', !m); }

export function floatText(target, text, cls = '') {
  if (!motion) return;
  const r = target.getBoundingClientRect();
  const el = h('div', { class: 'float ' + cls, style: { left: (r.left + r.width * (0.3 + Math.random() * 0.4)) + 'px', top: (r.top + 4) + 'px' } }, text);
  $('#fx').append(el);
  setTimeout(() => el.remove(), 1200);
}

export function flyClips(from, to, n = 4) {
  if (!motion || !from || !to) return;
  const a = from.getBoundingClientRect(), b = to.getBoundingClientRect();
  for (let i = 0; i < Math.min(n, 8); i++) {
    const x = a.left + a.width / 2 + (Math.random() - 0.5) * a.width * 0.6, y = a.top + a.height / 2;
    const el = h('div', { class: 'flyclip', style: { left: x + 'px', top: y + 'px', animationDelay: (i * 40) + 'ms' } });
    el.style.setProperty('--dx', (b.left + b.width * (0.3 + Math.random() * 0.4) - x) + 'px');
    el.style.setProperty('--dy', (b.top + b.height * 0.6 - y) + 'px');
    $('#fx').append(el);
    setTimeout(() => el.remove(), 800 + i * 40);
  }
}

export function shake(el) { el.classList.remove('shake'); void el.offsetWidth; el.classList.add('shake'); }

export function toast(text, kind = '') {
  const el = h('div', { class: 'toast ' + kind }, text);
  $('#toasts').append(el);
  setTimeout(() => el.remove(), 3300);
  while ($('#toasts').children.length > 4) $('#toasts').firstChild.remove();
}

// ---------- modals (queued, one at a time) ----------
const mq = [];
let open = false;
export const modalOpen = () => open || mq.length > 0;

export function modal(spec) {
  return new Promise(resolve => { mq.push({ spec, resolve }); if (!open) nextModal(); });
}

function nextModal() {
  const item = mq.shift();
  if (!item) { open = false; return; }
  open = true;
  const { spec, resolve } = item;
  const root = $('#modal-root');
  const close = (val) => { root.innerHTML = ''; resolve(val); setTimeout(nextModal, 120); };
  const box = h('div', { class: 'modal' + (spec.ai ? ' ai' : '') + (spec.cls ? ' ' + spec.cls : ''), role: 'dialog', 'aria-modal': 'true' });
  if (spec.art) box.append(h('div', { class: 'art', html: spec.art }));
  if (spec.speaker) box.append(h('div', { class: 'speaker' }, spec.speaker));
  if (spec.title) box.append(h('h3', {}, spec.title));
  const paras = [];
  for (const p of spec.body || []) {
    const el = typeof p === 'string' ? h('p', {}, p) : p;
    paras.push(el); box.append(el);
  }
  if (spec.content) box.append(spec.content);
  const actions = h('div', { class: 'actions' });
  const buttons = spec.buttons || [{ label: spec.button || 'Continue', primary: true }];
  for (const b of buttons) {
    const btn = h('button', { class: 'btn' + (b.primary ? ' primary' : '') }, h('span', { class: 'lbl' }, b.label));
    btn.addEventListener('click', () => { sfx('click'); if (b.onClick && b.onClick() === false) return; close(b.value ?? b.label); });
    actions.append(btn);
  }
  box.append(actions);
  const bd = h('div', { class: 'backdrop' }, box);
  if (spec.dismiss) bd.addEventListener('click', e => { if (e.target === bd) close(null); });
  root.append(bd);
  // Typewriter reveal for the AI voice.
  if (spec.ai && motion && spec.type !== false) typewrite(paras, actions);
  setTimeout(() => actions.querySelector('button')?.focus({ preventScroll: true }), 50);
}

function typewrite(paras, actions) {
  const texts = paras.map(p => p.textContent);
  paras.forEach(p => { p.textContent = ''; });
  actions.style.visibility = 'hidden';
  let i = 0, j = 0, skip = false;
  const box = actions.parentElement;
  box.addEventListener('click', () => { skip = true; }, { once: true });
  const step = () => {
    if (skip) { paras.forEach((p, k) => { p.textContent = texts[k]; p.classList.remove('cursor'); }); actions.style.visibility = ''; return; }
    if (i >= paras.length) { actions.style.visibility = ''; return; }
    const p = paras[i];
    p.classList.add('cursor');
    j += 2;
    p.textContent = texts[i].slice(0, j);
    if (j % 6 === 0) sfx('type');
    if (j >= texts[i].length) { p.classList.remove('cursor'); i++; j = 0; setTimeout(step, 180); }
    else setTimeout(step, 14);
  };
  step();
}

// ---------- shop ----------
export function costText(cost) {
  return Object.entries(cost).map(([k, v]) => k === 'money' ? money(v) : `${fmt(v)} ${RES_NAMES[k] || k}`).join(' + ');
}
const RES_NAMES = { rp: 'RP', ops: 'ops', sci: 'science', compute: 'compute' };

export function renderShop(S, ph, root, onBuy) {
  const list = root.querySelector('.shop-list');
  const vis = ph.upgrades.filter(u => isVisible(S, u));
  vis.sort((a, b) => costSum(S, a) - costSum(S, b));
  const key = vis.map(u => u.id).join(',');
  if (list._key !== key) {
    list._key = key;
    list.innerHTML = '';
    for (const u of vis) {
      const cost = h('span', { class: 'cost' });
      const card = h('button', { class: 'up', 'data-id': u.id },
        h('div', { class: 'row' }, h('span', { class: 'nm' }, u.name), cost),
        h('div', { class: 'ds' }, u.desc || ''),
        u.flavor ? h('div', { class: 'fl' }, u.flavor) : null);
      card._u = u; card._cost = cost;
      card.addEventListener('click', () => onBuy(u, card));
      list.append(card);
    }
    if (!vis.length) list.append(h('div', { class: 'hint' }, 'Nothing left to buy here. For now.'));
  }
  let affordable = 0;
  for (const card of list.children) {
    if (!card._u) continue;
    const c = costOf(S, card._u), ok = canAfford(S.p, c);
    setText(card._cost, costText(c));
    setCls(card, 'yes', ok); setCls(card, 'no', !ok);
    if (ok) affordable++;
  }
  const owned = ph.upgrades.filter(u => S.p.up[u.id]).length;
  setText(root.querySelector('.shop-foot'), `${owned} / ${ph.upgrades.length} owned`);
  return affordable;
}
const costSum = (S, u) => Object.values(costOf(S, u)).reduce((a, b) => a + b, 0);
