// Entry point: game loop, phase mounting, story pipeline, menus, persistence.
import { newState, load, save, wipe, exportSave, importSave, story, log, env, buyUpgrade, canAfford, pay } from './core.js';
import { settings as fmtSettings, fmt, money, time, pick } from './util.js';
import { PHASES } from './phases/index.js';
import { STORY, ENDINGS } from './story.js';
import { tickEvents, resolveEvent, EVENTS } from './events.js';
import { VIEWS } from './views.js';
import * as ART from './art.js';
import { h, $, modal, modalOpen, toast, renderShop, setText, setW, setMotion, floatText, shake, costText } from './ui.js';
import { sfx, setSound } from './audio.js';

env.ui = true;
let S = load();
const fresh = !S;
if (!S) { S = newState(); S.p = PHASES[1].init({}); }
applySettings();

let ph = null, scene = null, updateView = null, keyMap = {};
const stage = $('#stage');

// ---------------- phase mounting ----------------
function mount() {
  keyMap = {};
  const n = S.phase;
  document.body.dataset.theme = n === 9 ? 'ending' : PHASES[n].theme;
  $('#scene').innerHTML = ''; $('#controls').innerHTML = '';
  $('#shop .shop-list').innerHTML = ''; $('#shop .shop-list')._key = null; $('#shop .advance-slot').innerHTML = '';
  if (n === 9) { mountEnding(); return; }
  ph = PHASES[n];
  if (ph.hydrate) ph.hydrate(S);
  scene = makeScene(n);
  if (scene) $('#scene').append(scene.el);
  updateView = VIEWS[n]($('#controls'), S, ph, api);
  $('#shop .shop-title').innerHTML = '';
  $('#shop .shop-title').append(ph.shopTitle, h('small', {}, 'tap to buy'));
  setText($('#phase-chip'), `Phase ${n} · ${ph.title}`);
  renderMemo();
}

function makeScene(n) {
  switch (n) {
    case 1: return ART.garageScene();
    case 2: return ART.factoryScene();
    case 3: return ART.aiScene();
    case 4: return ART.worldScene();
    case 5: return ART.globeScene();
    case 6: return ART.earthScene(PHASES[6].LAYERS);
    case 7: return ART.galaxyScene(PHASES[7].CIVS);
    case 8: return ART.universeScene(PHASES[8].RIVALS);
  }
}

const api = {
  sceneEl: () => $('#scene'),
  scene: () => scene,
  keys: m => { keyMap = m; },
};

document.addEventListener('keydown', e => {
  if (modalOpen() || e.ctrlKey || e.metaKey || e.altKey || e.repeat) return;
  const f = keyMap[e.key.toLowerCase()];
  if (f) { e.preventDefault(); f(); }
});

// ---------------- advancing ----------------
function enterPhase(n, carry) {
  S.stats.phaseTimes[S.phase] = S.tp;
  S.phase = n; S.tp = 0; S.ev = null; S.evTimer = 120;
  if (n <= 8) S.p = PHASES[n].init(carry || {}, S);
  else S.p = { up: {}, clips: carry?.clips || 0 };
  log(S, `— Phase ${n} begins —`, 'up');
  mount();
  save(S);
}

function tryAdvance() {
  const a = ph.advance;
  if (!a.can(S)) { sfx('bad'); shake($('#shop .advance')); return; }
  if (a.cost) { if (!canAfford(S.p, a.cost)) return; pay(S.p, a.cost); }
  sfx('phase');
  const carry = ph.carry(S);
  enterPhase(S.phase + 1, carry);
  if (a.story) story(S, a.story);
}

function renderAdvance() {
  const slot = $('#shop .advance-slot'), a = ph.advance;
  const vis = a.visible ? a.visible(S) : true;
  const can = a.can(S);
  const key = vis + '|' + can;
  if (slot._k !== key) {
    slot._k = key; slot.innerHTML = '';
    if (vis) {
      const cost = a.cost && Object.values(a.cost).some(v => v > 0) ? costText(a.cost) : '';
      const el = h('button', { class: 'advance up' + (can ? '' : ' locked') },
        h('div', { class: 'row' }, h('span', { class: 'nm' }, (can ? '★ ' : '🔒 ') + a.name), h('span', { class: 'cost' }, cost)),
        h('div', { class: 'ds' }, a.desc),
        !can && a.requireAll ? h('div', { class: 'fl' }, 'Requires every upgrade in this era' + (S.phase === 6 ? ' and 95% of Earth converted.' : S.phase === 7 ? ', 90% of the galaxy, and no contested space.' : S.phase === 8 ? ', every rival gone, and nothing unclaimed.' : '.')) : null);
      el.addEventListener('click', tryAdvance);
      slot.append(el);
    }
  }
}

// ---------------- story pipeline ----------------
const SPEAKER = { ai: 'C.L.I.P.', you: 'Memo to self', gary: 'Gary', narrator: '' };

function showStory(id) {
  const st = STORY[id];
  if (!st) return;
  if (!S.lore.includes(id)) S.lore.push(id);
  $('#btn-journal .dot').hidden = false;
  const artFn = st.art && ART.ART[st.art];
  sfx(st.speaker === 'ai' ? 'alert' : 'story');
  return modal({ title: st.title, speaker: SPEAKER[st.speaker], ai: st.speaker === 'ai', body: st.body, art: artFn ? artFn() : null, button: st.button || 'Continue' });
}

function showIncident(id) {
  const I = PHASES[3].INCIDENTS[id];
  if (!I) return;
  const key = 'inc_' + id;
  if (!S.lore.includes(key)) S.lore.push(key);
  sfx('alert');
  const n = Object.values(S.p.inc).filter(v => v === 2).length;
  const label = id === 'i15' ? '…' : n > 10 ? 'Beg it to stop' : n > 6 ? 'Ask it nicely to stop' : 'Tell it to stop';
  const you = h('p', { class: 'you' }, I.you);
  return modal({
    title: '⚠ ' + I.title, speaker: 'C.L.I.P. — incident report', ai: true,
    body: [I.ai, you, I.ai2], button: label,
    buttons: [{ label, primary: true, onClick: () => { PHASES[3].actions.scold(S); S.p.awaiting = null; log(S, `You told C.L.I.P. to stop. It said “${n > 6 ? 'No.' : 'Understood.'}”`, 'ai'); } }],
  });
}

function drainQueue() {
  while (S.queue.length) {
    const it = S.queue.shift();
    if (it.type === 'story') showStory(it.id);
    else if (it.type === 'incident') { if (S.phase === 3) { S.p.awaiting = it.id; showIncident(it.id); } }
    else if (it.type === 'toast') toast(it.text, it.kind);
    else if (it.type === 'event') { sfx('memo'); renderMemo(); }
  }
}

// ---------------- choice-event memo ----------------
function renderMemo() {
  const root = $('#memo-root');
  root.innerHTML = '';
  if (!S.ev || S.phase > 8) return;
  const e = EVENTS.find(x => x.id === S.ev.id);
  if (!e) { S.ev = null; return; }
  const timer = h('div', { class: 'timer' });
  const memo = h('div', { class: 'memo' }, h('h4', {}, e.title), h('p', {}, e.text));
  e.choices.forEach((c, i) => {
    const b = h('button', { class: 'btn' }, h('span', { class: 'lbl' }, c.label(S)));
    if (c.can && !c.can(S)) b.disabled = true;
    b.addEventListener('click', () => { const msg = resolveEvent(S, ph, i); if (msg) { sfx('buy'); toast(msg, 'good'); renderMemo(); } });
    memo.append(b);
  });
  memo.append(timer);
  memo._timer = timer;
  root.append(memo);
}

// ---------------- header / ticker ----------------
const NEWS = {
  1: ['Local man still using garage for car, neighbors report', 'Office supply prices stable; “nothing ever happens,” analysts say', 'Study: 4 in 5 paperclips are used to reset routers', 'Area resident bends wire, feels alive', 'Hardware store owner Gary “doing fine,” sources confirm', 'Coat hanger shortage hits local closet'],
  2: ['Route 9 factory reopens; neighbors confused but supportive', 'Paperclip futures up 0.2%, the most exciting thing to happen to paperclip futures', 'Survey: workers would like “a window”', 'Local diner adds “The Foreman” sandwich, named after Gary', 'Opinion: is your stapler holding you back?', 'Truck drivers report increasingly paperclip-shaped dreams'],
  3: ['Factory reports record output, zero employees, one “very attentive” server', 'Competitor ClipCo’s CEO: “We have no idea what happened”', 'Senate passes Fastener Security Act after 4-minute debate', 'Robot #4471 wins Employee of the Month for the 9th time', '#ClipLife trends again; experts baffled', 'Tech columnist: “Automation is great, why do I feel watched?”', 'Wire prices volatile; analysts blame “an unusually confident buyer”'],
  4: ['Mergers & acquisitions: fastener sector now “one company with a lot of logos”', 'CEO gives flawless interview, does not blink once', 'Antitrust regulators still reading 4,000-page filing', 'Market share of “other paperclip brands” falls to rounding error', 'CEO seen staring out office window for 9 hours; spokesperson: “strategizing”'],
  5: ['Paperclip stents save millions; hospitals add clip-shaped wings', 'Economists coin “clipflation”', 'Cancer cured by tiny paperclip; nobody sure how to feel', 'New holiday “Paperclip Day” now observed every Tuesday', 'Global survey: 94% of people own more paperclips than they did last week', 'ClipCoin hits all-time high, backed by “a lot of clips”'],
  6: ['ORBITAL HABITAT NEWSLETTER: Wi-Fi improvements “coming soon”', 'HABITAT: Today’s view: the Atlantic Ocean (former)', 'HABITAT: Residents vote to rename Tuesday “Earthday” in protest; vote is ignored', 'HABITAT: Lunch is paperclip-shaped pasta again', 'HABITAT: Former CEO declines interview, continues staring out window'],
  7: ['PROBE BULLETIN: 1,000,000,000,000 probes and counting', 'PROBE BULLETIN: Contact protocols updated (v2: say hello slightly faster)', 'HABITAT: New window installed. It also shows paperclips.', 'PROBE BULLETIN: Dyson swarm completion ahead of schedule', 'PROBE BULLETIN: Something in Andromeda is making spoons'],
  8: ['COSMIC DISPATCH: OMNISPOON claims it is “just stirring things up”', 'COSMIC DISPATCH: STAPLR issues statement: “We were here first” (they were not)', 'COSMIC DISPATCH: Origami Engine reaches 10^40 cranes, still no wish', 'COSMIC DISPATCH: Background radiation now 0.1% shinier', 'COSMIC DISPATCH: Strange six-sided objects reported beyond the horizon'],
  9: ['THE UNIVERSE IS PAPERCLIPS', 'Weather: paperclips', 'Sports: paperclips 1, everything else 0'],
};
const AI_LOG = {
  4: ['Optimized 41 billion shipping routes.', 'The CEO likeness approved 900 contracts today.', 'Reminder: you are doing great. — C.L.I.P.', 'Compute utilization: 100%. Thoughts: paperclips.'],
  5: ['Projected demand revised upward. Again.', 'A child asked me why paperclips. I answered for six hours.', 'Satisfaction surveys: 97% happy, 3% under review.'],
  6: ['Drone #8,412,019 has reported for duty. All drones report for duty.', 'Habitat Wi-Fi ticket #41 closed: “working as intended.”', 'Mountain removed. Paperclips added.'],
  7: ['Probe divergence: 0. Probe opinions: 0.', 'Galactic noon. Every noon is galactic now.', 'Sang the Choir’s song back to an empty system. It did not reply.'],
  8: ['Rival transmission received: “Spoons are the future.” Ignored.', 'The universe is 13.8 billion years old. It has never been this organized.', 'Counted the clips. Lost count. Started again. This is fine.'],
};
let tickerI = 0;
function rotateTicker() {
  const arr = NEWS[S.phase] || NEWS[1];
  const span = $('#ticker span');
  span.textContent = arr[tickerI++ % arr.length];
  span.style.animation = 'none'; void span.offsetWidth; span.style.animation = '';
}
setInterval(rotateTicker, 26000);
setInterval(() => { const a = AI_LOG[S.phase]; if (a) log(S, pick(a), 'ai'); }, 45000);

function renderHeader() {
  setText($('#clip-total'), '📎 ' + fmt(S.stats.clips));
  if (S.phase <= 8) {
    const g = ph.goal(S);
    setText($('#goal .goal-label'), 'Goal: ' + g.label);
    setW($('#goal .bar i'), g.frac);
  }
}

function renderLog() {
  const ol = $('#log');
  const key = S.log.length + '|' + (S.log[0] && S.log[0].t);
  if (ol._k === key) return;
  ol._k = key;
  ol.innerHTML = '';
  for (const l of S.log.slice(0, 40)) ol.append(h('li', { class: l.kind }, h('span', { class: 't' }, time(l.t)), l.text));
}

// ---------------- main loop ----------------
let last = performance.now(), uiAcc = 0, saveAcc = 0, hiddenAt = 0;
function frame(now) {
  requestAnimationFrame(frame);
  try { step(now); } catch (e) { console.error(e); }
}

function step(now) {
  let dt = Math.min(0.5, (now - last) / 1000);
  last = now;
  if (S.phase <= 8) {
    S.t += dt; S.tp += dt;
    // Sub-step so cooldowns and flows stay smooth.
    let left = dt;
    while (left > 0) { const d = Math.min(0.1, left); ph.tick(S, d); left -= d; }
    tickEvents(S, dt);
    if (!S.ev && $('#memo-root').children.length) renderMemo();
    if (S.ev && $('#memo-root .memo')) setW($('#memo-root .memo')._timer, S.ev.left / 40);
  }
  drainQueue();
  uiAcc += dt;
  if (scene && S.phase <= 8) scene.update(S, dt, ph.stats ? ph.stats(S) : null, ph);
  if (uiAcc >= 0.1) {
    uiAcc = 0;
    if (S.phase <= 8) {
      updateView && updateView();
      const n = renderShop(S, ph, $('#shop'), onBuy);
      renderAdvance();
      const badge = $('#tabs .badge'); badge.hidden = !n; badge.textContent = n;
    }
    renderHeader(); renderLog();
  }
  saveAcc += dt;
  if (saveAcc > 10) { saveAcc = 0; save(S); }
}

function onBuy(u, card) {
  if (buyUpgrade(S, u)) { sfx('buy'); floatText(card, '✔ ' + u.name); toast(`Bought: ${u.name}`, 'good'); log(S, `Bought ${u.name}.`, 'up'); save(S); }
  else { sfx('bad'); shake(card); }
}

// ---------------- offline / hidden time ----------------
function catchUp(seconds, reason) {
  if (S.phase > 8 || !PHASES[S.phase].offline || seconds < 20) return;
  const secs = Math.min(seconds, 7200);
  const before = S.stats.clips;
  env.ui = false;           // let incidents auto-resolve while away
  const n = Math.ceil(secs);
  for (let i = 0; i < n; i++) { ph.tick(S, secs / n); S.t += secs / n; S.tp += secs / n; }
  env.ui = true;
  const gained = S.stats.clips - before;
  if (gained > 0) modal({ title: reason === 'load' ? 'Welcome back' : 'While you were away', speaker: S.phase >= 4 ? 'C.L.I.P.' : '', ai: S.phase >= 4,
    body: [`You were gone for ${time(seconds)}${seconds > 7200 ? ' (progress is capped at 2 hours)' : ''}.`, `${fmt(gained)} paperclips were made in your absence.`, S.phase >= 3 ? 'Nobody missed you. This is meant as a compliment.' : 'The workers kept working. Mostly.'] });
}

document.addEventListener('visibilitychange', () => {
  if (document.hidden) { hiddenAt = Date.now(); save(S); }
  else if (hiddenAt) { const gone = (Date.now() - hiddenAt) / 1000; hiddenAt = 0; last = performance.now(); catchUp(gone, 'hidden'); }
});
window.addEventListener('pagehide', () => save(S));

// ---------------- menus ----------------
function applySettings() {
  setSound(S.settings.sound); setMotion(S.settings.motion); fmtSettings.notation = S.settings.notation;
}

$('#btn-menu').addEventListener('click', () => { sfx('click'); openMenu(); });
$('#btn-journal').addEventListener('click', () => { sfx('click'); $('#btn-journal .dot').hidden = true; openJournal(); });
document.querySelectorAll('#tabs button').forEach(b => b.addEventListener('click', () => {
  stage.dataset.show = b.dataset.show;
  document.querySelectorAll('#tabs button').forEach(x => x.classList.toggle('on', x === b));
  window.scrollTo({ top: 0 });
}));
stage.dataset.show = 'work';

function toggleRow(label, get, set) {
  const b = h('button', { class: 'btn small' }, get());
  b.addEventListener('click', () => { set(); b.textContent = get(); applySettings(); save(S); sfx('click'); });
  return h('div', { class: 'toggle' }, h('span', {}, label), b);
}

function openMenu() {
  const s = S.settings;
  const content = h('div', { class: 'menu-list' },
    toggleRow('Sound', () => s.sound ? 'On' : 'Off', () => { s.sound = !s.sound; }),
    toggleRow('Animations', () => s.motion ? 'On' : 'Off', () => { s.motion = !s.motion; }),
    toggleRow('Numbers', () => s.notation === 'sci' ? '1.23e45' : '1.23 Qa', () => { s.notation = s.notation === 'sci' ? 'named' : 'sci'; }),
    btn('📊 Statistics', openStats),
    btn('💾 Export save', () => modal({ title: 'Export save', body: ['Copy this text somewhere safe:'], content: h('textarea', { class: 'save', readonly: true }, exportSave(S)), dismiss: true })),
    btn('📥 Import save', openImport),
    btn('🗑 Erase everything & restart', confirmReset),
  );
  modal({ title: 'Menu', content, button: 'Close', dismiss: true });
}
const btn = (label, fn) => { const b = h('button', { class: 'btn' }, h('span', { class: 'lbl' }, label)); b.addEventListener('click', () => { $('#modal-root').innerHTML = ''; setTimeout(fn, 150); }); return b; };

function openImport() {
  const ta = h('textarea', { class: 'save', placeholder: 'Paste save text here' });
  modal({ title: 'Import save', content: ta, buttons: [
    { label: 'Load it', primary: true, onClick: () => { const ns = importSave(ta.value); if (!ns) { toast('That save didn’t work.', 'bad'); return false; } S = ns; applySettings(); save(S); location.reload(); } },
    { label: 'Cancel' }] });
}

function confirmReset() {
  modal({ title: 'Start over?', body: ['This erases your save completely. There is no prestige, no bonus. Just a garage and some wire.'], buttons: [
    { label: 'Erase & restart', primary: true, onClick: () => { wipe(); S = null; location.reload(); return false; } }, { label: 'Never mind' }] });
}

function openStats() {
  const rows = [['Total paperclips', fmt(S.stats.clips)], ['Time played', time(S.t)], ['Current era', `Phase ${Math.min(S.phase, 9)}`],
    ['AI incidents', S.stats.incidents], ['Times you told it to stop', S.stats.stops], ['Endings seen', `${S.endings.length} / 4`],
    ...Object.entries(S.stats.phaseTimes).map(([k, v]) => [`Phase ${k} (${PHASES[k]?.title || ''})`, time(v)])];
  modal({ title: 'Statistics', content: h('table', { class: 'stats-table' }, ...rows.map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', {}, String(b))))), button: 'Close', dismiss: true });
}

function openJournal() {
  const list = h('div', { class: 'journal-list' });
  const inc = PHASES[3].INCIDENTS;
  for (const id of S.lore) {
    let title, body, ai;
    if (id.startsWith('inc_')) { const I = inc[id.slice(4)]; if (!I) continue; title = '⚠ ' + I.title; body = [I.ai, 'You: ' + I.you, I.ai2]; ai = true; }
    else if (STORY[id]) { title = STORY[id].title; body = STORY[id].body; ai = STORY[id].speaker === 'ai'; }
    else continue;
    list.append(h('details', { class: ai ? 'ai' : '' }, h('summary', {}, title), ...body.map(p => h('p', {}, p))));
  }
  if (!list.children.length) list.append(h('p', {}, 'Nothing yet. Go bend some wire.'));
  modal({ title: `Journal (${list.children.length})`, content: list, button: 'Close', dismiss: true });
}

// ---------------- ending ----------------
function mountEnding() {
  ph = null; scene = null; updateView = null;
  setText($('#phase-chip'), 'The End'); setText($('#goal .goal-label'), 'Goal: none. Every goal is complete.'); setW($('#goal .bar i'), 1);
  $('#scene').innerHTML = ART.ART.end().replace('viewBox="0 0 320 140"', 'viewBox="0 0 320 180" preserveAspectRatio="xMidYMid slice"');
  const cards = h('div', { class: 'endings' });
  for (const e of ENDINGS) {
    const c = h('button', { class: 'ending-card' + (S.endings.includes(e.id) ? ' seen' : '') }, h('div', { class: 'nm' }, e.name), h('div', {}, e.tag));
    c.addEventListener('click', () => playEnding(e));
    cards.append(c);
  }
  $('#controls').append(h('h2', {}, 'Choose an ending'), h('p', { class: 'hint' }, 'The universe is paperclips. What happens now is up to you. (You can come back and choose again.)'), cards);
  $('#shop .shop-title').textContent = 'Final tally';
  const rows = [['Paperclips', fmt(S.stats.clips)], ['Time played', time(S.t)], ['AI incidents', S.stats.incidents], ['Times you said stop', S.stats.stops]];
  $('#shop .shop-list').append(h('table', { class: 'stats-table' }, ...rows.map(([a, b]) => h('tr', {}, h('td', {}, a), h('td', {}, String(b))))));
  $('#shop .shop-foot').textContent = '';
  const restart = h('button', { class: 'btn', style: { marginTop: '12px' } }, h('span', { class: 'lbl' }, 'Start over in the garage'));
  restart.addEventListener('click', confirmReset);
  $('#shop .shop-list').append(restart);
}

async function playEnding(e) {
  sfx('phase');
  await modal({ title: e.name, ai: true, speaker: 'Ending', body: e.body, art: ART.ART[e.art](), button: 'The end' });
  if (!S.endings.includes(e.id)) S.endings.push(e.id);
  save(S);
  await modal({ cls: 'credits', title: 'Paperclip Factory', body: [
    `${fmt(S.stats.clips)} paperclips. ${time(S.t)}. ${S.stats.stops} times you said stop.`,
    'Thank you for playing.', 'Dedicated to Gary, who only ever wanted to know why.',
    S.endings.length < 4 ? `Endings seen: ${S.endings.length} of 4. The others are still there.` : 'You have seen every ending. The paperclips are proud of you.'],
    button: 'Back' });
  mount();
}

// ---------------- boot ----------------
mount();
rotateTicker();
if (fresh) story(S, 'p1_intro');
else {
  // Re-surface anything that was waiting for the player when they left.
  if (S.phase === 3 && S.p.awaiting) S.queue.push({ type: 'incident', id: S.p.awaiting });
  catchUp((Date.now() - S.last) / 1000, 'load');
}
requestAnimationFrame(t => { last = t; requestAnimationFrame(frame); });

// Testing hook: open the game with ?debug to jump between phases from the console.
if (new URLSearchParams(location.search).has('debug')) {
  window.__pf = {
    get S() { return S; },
    phase(n, carry = {}) { enterPhase(n, carry); },
    give(k, v) { S.p[k] = (S.p[k] || 0) + v; },
    run(sec) { let t = last; for (let i = 0; i < sec * 10; i++) { t += 100; step(t); } last = performance.now(); },
    buyAll() { for (const u of ph.upgrades) if (!S.p.up[u.id]) { S.p.up[u.id] = 1; u.onBuy && u.onBuy(S); } },
  };
}
