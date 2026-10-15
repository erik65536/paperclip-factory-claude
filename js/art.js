// Hand-drawn SVG scenes. Every scene is built once and updated cheaply each frame.
// The wobbly "ink" look comes from the #rough displacement filter defined in index.html.

const NS = 'http://www.w3.org/2000/svg';
const INK = '#2b2723';
export const CLIP_D = 'M4 7 V18 A2.5 2.5 0 0 0 9 18 V4.5 A3.5 3.5 0 0 0 2 4.5 V19 A4.5 4.5 0 0 0 11 19 V8';

export const clip = (x, y, s = 1, r = 0, color = '#8a9199', w = 1.6) =>
  `<path d="${CLIP_D}" transform="translate(${x} ${y}) rotate(${r}) scale(${s})" fill="none" stroke="${color}" stroke-width="${w / s}" stroke-linecap="round"/>`;

function svgEl(markup, vb = '0 0 640 360') {
  const wrap = document.createElement('div');
  wrap.innerHTML = `<svg xmlns="${NS}" viewBox="${vb}" preserveAspectRatio="xMidYMid slice">${markup}</svg>`;
  return wrap.firstChild;
}
const q = (svg, id) => svg.querySelector('#' + id);
const show = (el, on) => { if (el && el._on !== on) { el._on = on; el.style.display = on ? '' : 'none'; } };
const attr = (el, k, v) => { if (el && el['_' + k] !== v) { el['_' + k] = v; el.setAttribute(k, v); } };
const txt = (el, v) => { if (el && el._t !== v) { el._t = v; el.textContent = v; } };

// Seeded RNG so scenes look identical every load.
function rng(seed) { return () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; }; }

const stick = (x, y, s = 1, color = INK, extra = '') => `
  <g transform="translate(${x} ${y}) scale(${s})" stroke="${color}" stroke-width="2.4" fill="none" stroke-linecap="round" ${extra}>
    <circle cx="0" cy="-34" r="7" fill="#fffaf0"/>
    <path d="M0 -27 L0 -6 M0 -6 L-7 10 M0 -6 L7 10"/>
    <path class="arm" d="M0 -21 L-9 -10 M0 -21 L10 -12"/>
  </g>`;

// =============== PHASE 1: GARAGE ===============
const STORE_LABELS = ['Gary’s mug', 'Shoebox', 'Tackle box', 'Laundry basket', 'Chest freezer', 'Garden shed', 'Storage unit'];

export function garageScene() {
  const pegs = []; for (let x = 52; x < 300; x += 18) for (let y = 52; y < 150; y += 18) pegs.push(`<circle cx="${x}" cy="${y}" r="1.6" fill="#7a5f3a"/>`);
  const planks = []; for (let y = 20; y < 280; y += 34) planks.push(`<path d="M0 ${y} Q320 ${y + 3} 640 ${y - 1}" stroke="#c9ad7d" stroke-width="2" fill="none"/>`);
  const svg = svgEl(`
    <rect width="640" height="360" fill="#ead6ad"/>
    <g filter="url(#rough)">
      ${planks.join('')}
      <path d="M0 280 L640 276 L640 360 L0 360 Z" fill="#b89a6a" stroke="${INK}" stroke-width="2.5"/>
      <path d="M40 300 L120 298 M200 318 L330 315 M420 305 L520 303" stroke="#9b7e52" stroke-width="2"/>
      <!-- garage door opening -->
      <rect x="470" y="34" width="156" height="244" fill="#bfe3f0" stroke="${INK}" stroke-width="3"/>
      <path d="M490 80 q12 -14 26 -2 q10 -12 22 0 q12 4 4 14 h-50 q-10 -4 -2 -12z" fill="#fff" stroke="${INK}" stroke-width="1.8"/>
      <path d="M470 236 L626 232 L626 278 L470 278 Z" fill="#8fbf6a" stroke="${INK}" stroke-width="2"/>
      <g id="fence" stroke="${INK}" stroke-width="2" fill="#f4efe2">
        ${[0, 1, 2, 3, 4, 5, 6].map(i => `<path class="post" d="M${482 + i * 20} 250 l0 -34 l6 -7 l6 7 l0 34 z"/>`).join('')}
        <path d="M478 228 L620 226 M478 242 L620 240" fill="none"/>
      </g>
      <g id="gary" transform="translate(600 236)">
        <circle cx="0" cy="-28" r="9" fill="#fffaf0" stroke="${INK}" stroke-width="2.4"/>
        <path d="M-3 -30 h1 M4 -30 h1 M-3 -24 q3 2 6 0" stroke="${INK}" stroke-width="2" fill="none"/>
        <path d="M-12 -38 q12 -10 24 0" stroke="#7a5f3a" stroke-width="4" fill="none"/>
        <path d="M0 -19 L0 2" stroke="${INK}" stroke-width="2.4"/>
        <rect x="-18" y="-16" width="9" height="11" rx="2" fill="#f2f2f2" stroke="${INK}" stroke-width="2"/>
        <path d="M0 -14 L-12 -11" stroke="${INK}" stroke-width="2.4"/>
      </g>
      <g id="sign" transform="translate(478 110) rotate(-4)">
        <path d="M18 -18 L30 0 M62 -18 L50 0" stroke="${INK}" stroke-width="1.5"/>
        <rect x="0" y="0" width="80" height="34" fill="#f7e9c8" stroke="${INK}" stroke-width="2.4"/>
        <text x="40" y="22" font-family="Permanent Marker" font-size="13" text-anchor="middle" fill="#c0392b">CLIPS 4 SALE</text>
      </g>
      <!-- pegboard -->
      <rect x="40" y="40" width="270" height="120" fill="#d8b47c" stroke="${INK}" stroke-width="2.5"/>
      ${pegs.join('')}
      <g stroke="${INK}" stroke-width="2.2" stroke-linecap="round" fill="#c9cdd1">
        <g><path d="M60 60 L60 120" stroke-width="5" stroke="#8a5a2b"/><rect x="50" y="54" width="20" height="10" rx="2"/></g>
        <g id="t-pliers"><path d="M92 60 L100 120 M108 60 L100 120" fill="none" stroke-width="3"/><path d="M92 60 q-4 -10 4 -12 M108 60 q4 -10 -4 -12" fill="none" stroke="#c0392b" stroke-width="5"/></g>
        <g id="t-saw"><path d="M130 58 L200 70 L196 92 L128 80 Z" /><path d="M200 70 L218 66 L222 86 L196 92" fill="#8a5a2b"/></g>
        <g id="t-wrench"><path d="M236 60 L246 132" stroke-width="7" stroke="#9aa1a8"/><circle cx="235" cy="56" r="7" fill="none" stroke-width="4" stroke="#9aa1a8"/></g>
        <g id="t-drill"><path d="M260 92 h30 v16 h-14 l-4 20 h-10 z" fill="#f1c40f"/><path d="M290 98 h14" stroke-width="3"/></g>
        <g id="t-radio"><rect x="140" y="112" width="52" height="34" rx="6" fill="#d35400"/><circle cx="156" cy="129" r="8" fill="#f4efe2"/><path d="M172 122 h14 M172 130 h14 M172 138 h14" stroke-width="1.6"/><path d="M182 112 L196 96" fill="none"/></g>
      </g>
      <!-- workbench -->
      <path d="M30 206 L350 204 L350 220 L30 222 Z" fill="#a0784a" stroke="${INK}" stroke-width="2.6"/>
      <path d="M44 222 L46 282 M334 220 L332 280 M44 252 L334 250" stroke="${INK}" stroke-width="4" fill="none"/>
      <g id="jig"><rect x="110" y="188" width="70" height="16" fill="#e2c493" stroke="${INK}" stroke-width="2"/><g id="jig-nails"></g></g>
      <g id="vise"><path d="M60 204 v-18 h26 v18 M56 186 h34 v-8 h-34 z" fill="#5d6d7e" stroke="${INK}" stroke-width="2"/></g>
      <g id="spool"><circle cx="230" cy="184" r="18" fill="#c9cdd1" stroke="${INK}" stroke-width="2.4"/><circle id="spool-wire" cx="230" cy="184" r="14" fill="none" stroke="#b87333" stroke-width="6"/><circle cx="230" cy="184" r="4" fill="${INK}"/></g>
      <g id="jar"><path d="M292 162 h30 v40 q0 4 -4 4 h-22 q-4 0 -4 -4 z" fill="#e8f6f3" stroke="${INK}" stroke-width="2.2" opacity=".95"/><rect id="jar-fill" x="294" y="200" width="26" height="4" fill="#58b368"/><rect x="290" y="156" width="34" height="7" fill="#7a5f3a" stroke="${INK}" stroke-width="2"/><text x="307" y="186" font-size="14" text-anchor="middle" fill="${INK}" font-family="Permanent Marker">$</text></g>
      <!-- storage + pile -->
      <g id="store"><path id="store-box" d="" fill="#d9c3a0" stroke="${INK}" stroke-width="2.6"/><text id="store-label" x="410" y="300" font-family="Patrick Hand" font-size="16" text-anchor="middle" fill="${INK}"></text></g>
      <path id="pile" d="" fill="#aab4bd" stroke="${INK}" stroke-width="2.2"/>
      <g id="pile-clips"></g>
      <g id="you">${stick(150, 278, 1.6)}</g>
    </g>`);
  const nails = q(svg, 'jig-nails');
  const pc = q(svg, 'pile-clips');
  const r = rng(7);
  const pileClips = Array.from({ length: 16 }, () => [r(), r(), r() * 360]);
  const youArm = svg.querySelector('#you .arm');
  return {
    el: svg,
    pulse() { if (youArm) { youArm.style.transformOrigin = '0 -21px'; youArm.animate([{ transform: 'rotate(0)' }, { transform: 'rotate(-28deg)' }, { transform: 'rotate(0)' }], { duration: 260 }); } },
    update(S) {
      const P = S.p, lv = P.lv;
      show(q(svg, 't-pliers'), lv.bend >= 1); show(q(svg, 't-saw'), lv.jig >= 3); show(q(svg, 't-wrench'), lv.bend >= 3);
      show(q(svg, 't-drill'), lv.bend >= 5); show(q(svg, 't-radio'), !!P.up.radio); show(q(svg, 'vise'), lv.bend >= 2);
      show(q(svg, 'sign'), lv.sell >= 1); show(q(svg, 'gary'), P.earned >= 50);
      if (nails._lv !== lv.jig) { nails._lv = lv.jig; const n = Math.min(14, lv.jig * 2 + 2); nails.innerHTML = Array.from({ length: n }, (_, i) => `<path d="M${116 + i * 4.4} 194 v-8" stroke="${INK}" stroke-width="1.6"/>`).join(''); }
      const posts = svg.querySelectorAll('#fence .post'), gone = Math.min(posts.length, P.scrounged || 0);
      posts.forEach((p, i) => show(p, i >= gone));
      attr(q(svg, 'spool-wire'), 'stroke-width', (1 + Math.min(10, Math.log10(1 + P.wire) * 2.4)).toFixed(1));
      const jf = Math.min(1, Math.log10(1 + P.money) / 5);
      attr(q(svg, 'jar-fill'), 'y', (204 - 38 * jf).toFixed(1)); attr(q(svg, 'jar-fill'), 'height', (38 * jf + 0.1).toFixed(1));
      const sl = lv.store, w = 60 + sl * 12, hh = 30 + sl * 10;
      attr(q(svg, 'store-box'), 'd', `M${410 - w / 2} 280 L${410 - w / 2 - 4} ${280 - hh} L${410 + w / 2 + 4} ${280 - hh} L${410 + w / 2} 280 Z`);
      txt(q(svg, 'store-label'), STORE_LABELS[sl] || '');
      const cap = [20, 50, 120, 300, 800, 2000, 6000][sl] || 20;
      const f = Math.sqrt(Math.min(1, P.clips / cap));
      const ph = 4 + f * (hh + 26), pw = w * 0.5 + f * w * 0.5;
      attr(q(svg, 'pile'), 'd', P.clips > 0 ? `M${410 - pw / 2} ${280 - hh + 6} Q410 ${280 - hh + 6 - ph * 2} ${410 + pw / 2} ${280 - hh + 6} Z` : '');
      const shown = Math.min(16, Math.ceil(f * 16));
      if (pc._n !== shown) {
        pc._n = shown;
        pc.innerHTML = pileClips.slice(0, shown).map(([a, b, rot]) => clip(410 + (a - 0.5) * pw * 0.7, 280 - hh + 2 - b * ph * 0.8, 1.1, rot, '#6c7a86', 1.8)).join('');
      }
    },
  };
}

// =============== PHASE 2: FACTORY ===============
export function factoryScene() {
  const bricks = []; for (let y = 0; y < 230; y += 16) for (let x = (y / 16) % 2 ? -16 : 0; x < 640; x += 34) bricks.push(`<rect x="${x}" y="${y}" width="32" height="14" fill="none" stroke="#a9563f" stroke-width="1.2" opacity=".55"/>`);
  const belt = Array.from({ length: 14 }, (_, i) => clip(150 + i * 26, 222, 0.9, 90, '#7d8a96', 1.8)).join('');
  const svg = svgEl(`
    <rect width="640" height="360" fill="#d98d6e"/>
    <g filter="url(#rough)">
      ${bricks.join('')}
      <g id="window"><rect x="280" y="34" width="80" height="60" fill="#cfe9f3" stroke="${INK}" stroke-width="3"/><path d="M320 34 V94 M280 64 H360" stroke="${INK}" stroke-width="2.4"/></g>
      <path d="M0 250 L640 246 L640 360 L0 360 Z" fill="#9b9a96" stroke="${INK}" stroke-width="2.6"/>
      <rect x="18" y="20" width="22" height="160" fill="#f4efe2" stroke="${INK}" stroke-width="2"/>
      <rect id="silo" x="20" y="178" width="18" height="0" fill="#5aa0c8"/>
      <text x="29" y="196" font-size="12" text-anchor="middle" font-family="Patrick Hand" fill="${INK}" transform="rotate(-90 29 196)"></text>
      <text x="29" y="16" font-size="13" text-anchor="middle" font-family="Patrick Hand" fill="${INK}">STOCK</text>
      <!-- wire coils (left) -->
      <g stroke="${INK}" stroke-width="2.4">
        <ellipse cx="80" cy="226" rx="26" ry="18" fill="#c27c42"/><ellipse cx="80" cy="226" rx="10" ry="7" fill="#7a4a24"/>
        <ellipse cx="110" cy="204" rx="22" ry="15" fill="#d08a50"/><ellipse cx="110" cy="204" rx="8" ry="6" fill="#7a4a24"/>
      </g>
      <g id="forklift" stroke="${INK}" stroke-width="2.2"><rect x="56" y="250" width="36" height="22" fill="#f1c40f"/><path d="M92 254 V230 M92 268 H110" fill="none" stroke-width="3"/><circle cx="64" cy="276" r="6" fill="${INK}"/><circle cx="86" cy="276" r="6" fill="${INK}"/></g>
      <!-- machines -->
      <g id="machines" stroke="${INK}" stroke-width="2.5">
        <rect x="160" y="120" width="70" height="84" fill="#5d6d7e"/><rect x="172" y="132" width="46" height="26" fill="#aed6f1"/><circle cx="195" cy="180" r="10" fill="#e74c3c"/>
        <rect id="m2" x="250" y="110" width="80" height="94" fill="#566573"/><path id="m2b" d="M262 124 h56 v30 h-56z" fill="#f9e79f"/>
        <rect id="m3" x="350" y="128" width="64" height="76" fill="#4d5656"/><circle id="m3w" cx="382" cy="160" r="20" fill="#bfc9ca"/>
      </g>
      <!-- conveyor -->
      <rect x="140" y="212" width="320" height="16" rx="8" fill="#34495e" stroke="${INK}" stroke-width="2.5"/>
      <g id="belt">${belt}</g>
      <!-- dock & truck -->
      <rect x="470" y="90" width="150" height="160" fill="#7f8c8d" stroke="${INK}" stroke-width="3"/>
      <path d="M470 110 H620 M470 130 H620 M470 150 H620 M470 170 H620" stroke="#95a5a6" stroke-width="2"/>
      <g id="truck" stroke="${INK}" stroke-width="2.5"><rect x="490" y="186" width="96" height="56" fill="#ecf0f1"/><rect x="586" y="206" width="34" height="36" fill="#e74c3c"/><rect x="594" y="212" width="18" height="12" fill="#aed6f1"/><circle cx="512" cy="248" r="10" fill="${INK}"/><circle cx="600" cy="248" r="10" fill="${INK}"/><text x="538" y="220" font-size="14" text-anchor="middle" font-family="Permanent Marker" fill="${INK}" stroke="none">CLIPS</text></g>
      <g id="crew"></g>
      <g id="pep"><path d="M300 300 l30 -12 v34 z" fill="#e74c3c" stroke="${INK}" stroke-width="2.4"/><text x="352" y="306" font-family="Permanent Marker" font-size="26" fill="${INK}">!!</text></g>
      <text id="crewtxt" x="320" y="350" font-family="Patrick Hand" font-size="17" text-anchor="middle" fill="${INK}"></text>
    </g>`);
  const belts = q(svg, 'belt');
  let off = 0;
  return {
    el: svg,
    update(S, dt) {
      const P = S.p;
      off = (off + (P.rates.make > 0 ? Math.min(60, 8 + Math.log10(1 + P.rates.make) * 8) : 0) * dt) % 26;
      attr(belts, 'transform', `translate(${off.toFixed(1)} 0)`);
      show(q(svg, 'forklift'), !!P.up.b1); show(q(svg, 'truck'), !!P.up.s2);
      show(q(svg, 'm2'), !!P.up.m2); show(q(svg, 'm2b'), !!P.up.m2); show(q(svg, 'm3'), !!P.up.m3); show(q(svg, 'm3w'), !!P.up.m3);
      show(q(svg, 'window'), !!S.seen.p2_union); show(q(svg, 'pep'), P.speechT > 0);
      const st = P.store; const cap = [1e5, 4e5, 2e6, 1e7, 6e7, 3e8][st];
      const f = Math.min(1, P.clips / cap);
      attr(q(svg, 'silo'), 'y', (178 - 156 * f).toFixed(1)); attr(q(svg, 'silo'), 'height', (156 * f).toFixed(1));
      const crew = q(svg, 'crew'), key = `${P.w.buy}|${P.w.make}|${P.w.ship}`;
      if (crew._k !== key) {
        crew._k = key;
        const zone = (n, x0, x1, y) => { const k = Math.min(n, 9); return Array.from({ length: k }, (_, i) => stick(x0 + (x1 - x0) * (k === 1 ? 0.5 : i / (k - 1)), y + (i % 2) * 8, 0.75)).join(''); };
        crew.innerHTML = zone(P.w.buy, 40, 130, 330) + zone(P.w.make, 170, 430, 300) + zone(P.w.ship, 480, 620, 330);
        txt(q(svg, 'crewtxt'), P.hired ? `wire ${P.w.buy} · makers ${P.w.make} · shipping ${P.w.ship}${P.w.idle ? ' · idle ' + P.w.idle : ''}` : 'An empty factory. Hire someone.');
      }
    },
  };
}

// =============== PHASE 3: AUTOMATION ===============
export function aiScene() {
  const arm = (x, id) => `<g id="${id}" transform="translate(${x} 214)"><rect x="-18" y="-6" width="36" height="12" fill="#34495e" stroke="${INK}" stroke-width="2"/>
    <g class="a1"><path d="M0 0 L0 -60" stroke="#f39c12" stroke-width="12" stroke-linecap="round"/><path d="M0 0 L0 -60" stroke="${INK}" stroke-width="2" fill="none"/>
    <g class="a2" transform="translate(0 -60)"><path d="M0 0 L36 -14" stroke="#f5b041" stroke-width="9" stroke-linecap="round"/><path d="M36 -14 l8 -6 M36 -14 l9 4" stroke="${INK}" stroke-width="3"/><circle r="6" fill="#ecf0f1" stroke="${INK}" stroke-width="2"/></g></g></g>`;
  const svg = svgEl(`
    <rect width="640" height="360" fill="#dfe9ec"/>
    <g filter="url(#rough)">
      <path d="M0 246 L640 242 L640 360 L0 360 Z" fill="#b2bec3" stroke="${INK}" stroke-width="2.6"/>
      <path d="M0 290 L640 288 M0 330 L640 328" stroke="#9aa6ab" stroke-width="2"/>
      <!-- monitor -->
      <rect x="24" y="24" width="210" height="126" rx="8" fill="#1e272e" stroke="${INK}" stroke-width="3"/>
      <text x="36" y="44" font-family="VT323" font-size="17" fill="#7dffb0">MARKET PRICE</text>
      <polyline id="g-ref" points="" fill="none" stroke="#7dffb0" stroke-width="2"/>
      <polyline id="g-you" points="" fill="none" stroke="#ffd36b" stroke-width="2" stroke-dasharray="4 3"/>
      <text id="g-txt" x="36" y="142" font-family="VT323" font-size="16" fill="#ffd36b"></text>
      <!-- conveyor + arms -->
      <rect x="40" y="214" width="420" height="18" rx="9" fill="#2d3436" stroke="${INK}" stroke-width="2.5"/>
      <g id="belt">${Array.from({ length: 18 }, (_, i) => clip(48 + i * 24, 224, 0.85, 90, '#95a5a6', 1.6)).join('')}</g>
      ${arm(110, 'arm1')}${arm(230, 'arm2')}${arm(350, 'arm3')}
      <!-- server rack with eye -->
      <rect x="484" y="40" width="130" height="206" rx="6" fill="#2d3436" stroke="${INK}" stroke-width="3"/>
      ${[0, 1, 2, 3, 4, 5].map(i => `<rect x="496" y="${150 + i * 15}" width="106" height="10" fill="#3d4a50" stroke="${INK}" stroke-width="1.2"/><circle class="led" cx="${508 + (i * 37) % 80}" cy="${155 + i * 15}" r="2.4" fill="#2ecc71"/>`).join('')}
      <circle id="eye-glow" cx="549" cy="96" r="44" fill="#ff5a4e" opacity=".15"/>
      <circle cx="549" cy="96" r="34" fill="#ecf0f1" stroke="${INK}" stroke-width="3"/>
      <circle id="iris" cx="549" cy="96" r="18" fill="#2a8fa8" stroke="${INK}" stroke-width="2"/>
      <circle id="pupil" cx="549" cy="96" r="7" fill="${INK}"/>
      <text x="549" y="30" font-family="VT323" font-size="20" text-anchor="middle" fill="${INK}">C.L.I.P.</text>
      <text id="robots" x="250" y="300" font-family="Patrick Hand" font-size="18" text-anchor="middle" fill="${INK}"></text>
      <text id="auto" x="250" y="330" font-family="VT323" font-size="20" text-anchor="middle" fill="#c0392b"></text>
    </g>`);
  const hist = [];
  let t = 0, acc = 0, off = 0;
  const arms = ['arm1', 'arm2', 'arm3'].map(id => q(svg, id));
  return {
    el: svg,
    update(S, dt, st) {
      const P = S.p; t += dt; acc += dt;
      off = (off + Math.min(80, 10 + Math.log10(1 + P.rates.make) * 6) * dt) % 24;
      attr(q(svg, 'belt'), 'transform', `translate(${off.toFixed(1)} 0)`);
      arms.forEach((a, i) => {
        const a1 = a.querySelector('.a1'), a2 = a.querySelector('.a2');
        attr(a1, 'transform', `rotate(${(Math.sin(t * 2.2 + i * 1.7) * 22).toFixed(1)})`);
        attr(a2, 'transform', `translate(0 -60) rotate(${(Math.sin(t * 3.1 + i) * 30 + 10).toFixed(1)})`);
      });
      const au = P.autonomy / 100;
      const lx = 549 + Math.sin(t * 0.7) * 8 * (1 - au) + (au > 0.5 ? 6 : 0), ly = 96 + Math.cos(t * 0.9) * 5 * (1 - au) + (au > 0.5 ? 4 : 0);
      attr(q(svg, 'iris'), 'cx', lx.toFixed(1)); attr(q(svg, 'iris'), 'cy', ly.toFixed(1));
      attr(q(svg, 'pupil'), 'cx', lx.toFixed(1)); attr(q(svg, 'pupil'), 'cy', ly.toFixed(1));
      attr(q(svg, 'iris'), 'fill', au < 0.35 ? '#2a8fa8' : au < 0.7 ? '#e67e22' : '#e74c3c');
      attr(q(svg, 'pupil'), 'r', (7 - au * 3).toFixed(1));
      attr(q(svg, 'eye-glow'), 'opacity', (0.1 + au * 0.5 + Math.sin(t * 2) * 0.05).toFixed(2));
      attr(q(svg, 'eye-glow'), 'r', (40 + au * 30).toFixed(0));
      if (acc > 1 && st) {
        acc = 0; hist.push([st.ref, P.price]); if (hist.length > 60) hist.shift();
        const max = Math.max(...hist.map(h => Math.max(h[0], h[1]))) * 1.1, min = Math.min(...hist.map(h => Math.min(h[0], h[1]))) * 0.9;
        const pts = k => hist.map((h, i) => `${36 + i * 3.1},${(130 - (h[k] - min) / (max - min || 1) * 76).toFixed(1)}`).join(' ');
        attr(q(svg, 'g-ref'), 'points', pts(0)); attr(q(svg, 'g-you'), 'points', pts(1));
        txt(q(svg, 'g-txt'), `your price  $${P.price.toFixed(4)}`);
      }
      txt(q(svg, 'robots'), `${P.robots.toLocaleString()} robots · 0 humans`);
      txt(q(svg, 'auto'), au >= 1 ? 'AUTONOMY: TOTAL' : `AUTONOMY ${(au * 100).toFixed(0)}%`);
    },
  };
}

// =============== PHASE 4: CONSOLIDATION (world map) ===============
const BLOBS = {
  na: 'M70 70 q40 -30 100 -14 q30 10 26 40 q-10 30 -40 44 q-20 30 -44 18 q-30 -20 -40 -50 q-10 -20 -2 -38z',
  la: 'M150 196 q24 -8 40 14 q14 30 -6 64 q-14 30 -26 22 q-10 -30 -16 -52 q-8 -30 8 -48z',
  eu: 'M290 70 q30 -18 58 -4 q16 14 2 30 q-20 14 -44 10 q-24 -6 -22 -20 q0 -10 6 -16z',
  af: 'M300 140 q40 -14 64 8 q14 30 -4 66 q-16 40 -34 34 q-16 -20 -24 -50 q-14 -34 -2 -58z',
  me: 'M372 122 q24 -8 38 8 q6 18 -10 26 q-20 6 -30 -6 q-8 -14 2 -28z',
  sa: 'M418 140 q22 -10 34 8 q10 26 -10 46 q-14 4 -20 -16 q-8 -20 -4 -38z',
  ea: 'M420 60 q50 -26 104 -6 q24 18 8 46 q-22 26 -62 26 q-40 -2 -54 -26 q-8 -24 4 -40z',
  oc: 'M500 220 q30 -12 54 4 q10 20 -10 30 q-30 10 -46 -4 q-8 -16 2 -30z',
};
const LBL = { na: [130, 110], la: [172, 240], eu: [318, 88], af: [330, 186], me: [392, 138], sa: [436, 168], ea: [478, 84], oc: [528, 238] };
export function worldScene() {
  const svg = svgEl(`
    <rect width="640" height="360" fill="#b9d7e3"/>
    <g filter="url(#rough)">
      ${[60, 120, 180, 240, 300].map(y => `<path d="M0 ${y} Q320 ${y + 6} 640 ${y}" stroke="#a3c7d6" stroke-width="1.5" fill="none"/>`).join('')}
      ${Object.entries(BLOBS).map(([id, d]) => `<path id="r-${id}" d="${d}" fill="#cfd8c4" stroke="${INK}" stroke-width="2.6"/>`).join('')}
      ${Object.entries(LBL).map(([id, [x, y]]) => `<text id="l-${id}" x="${x}" y="${y}" font-family="Permanent Marker" font-size="15" text-anchor="middle" fill="${INK}"></text>`).join('')}
      <g transform="translate(580 300)"><circle r="30" fill="#ecf0f1" stroke="${INK}" stroke-width="3"/><circle id="w-iris" r="15" fill="#e74c3c" stroke="${INK}" stroke-width="2"/><circle r="5" fill="${INK}"/></g>
      <text id="w-share" x="24" y="336" font-family="Permanent Marker" font-size="26" fill="${INK}"></text>
    </g>`);
  return {
    el: svg,
    update(S, dt, st) {
      for (const id in BLOBS) {
        const s = S.p.share[id];
        const g = Math.round(200 - s * 150), rr = Math.round(210 - s * 160);
        attr(q(svg, 'r-' + id), 'fill', `rgb(${rr},${g + 20},${Math.round(190 - s * 120)})`);
        txt(q(svg, 'l-' + id), Math.round(s * 100) + '%');
      }
      if (st) txt(q(svg, 'w-share'), `World share: ${(st.share * 100).toFixed(1)}%`);
    },
  };
}

// =============== PHASE 5: GLOBAL DEMAND ===============
export function globeScene() {
  const r = rng(11);
  const ring = Array.from({ length: 22 }, (_, i) => { const a = i / 22 * Math.PI * 2; return clip(Math.cos(a) * 150 - 6, Math.sin(a) * 52 - 12, 1.2, a * 57 + 90, '#c4932a', 2); }).join('');
  const stars = Array.from({ length: 40 }, () => `<circle cx="${r() * 640}" cy="${r() * 360}" r="${r() * 1.6 + 0.4}" fill="#fff8e1"/>`).join('');
  const svg = svgEl(`
    <rect width="640" height="360" fill="#1d2b4a"/>${stars}
    <g filter="url(#rough)">
      <g transform="translate(260 180)">
        <g id="ring-back" opacity=".5">${ring}</g>
        <circle r="110" fill="#3f88c5" stroke="${INK}" stroke-width="3"/>
        <path d="M-80 -50 q30 -30 70 -10 q10 30 -30 40 q-30 0 -40 -30z M10 10 q40 -10 60 20 q-10 40 -40 40 q-30 -20 -20 -60z M30 -80 q30 0 40 20 q-20 10 -40 0z" fill="#7cb76b" stroke="${INK}" stroke-width="2.4"/>
        <ellipse rx="110" ry="36" fill="none" stroke="#2c6aa0" stroke-width="1.5"/><ellipse rx="40" ry="110" fill="none" stroke="#2c6aa0" stroke-width="1.5"/>
        <g id="ring">${ring}</g>
      </g>
      <g transform="translate(520 120)">
        <circle r="62" fill="#fdf0c9" stroke="${INK}" stroke-width="3"/>
        <path id="pie" d="" fill="#c4932a" stroke="${INK}" stroke-width="2"/>
        <text y="88" font-family="Permanent Marker" font-size="16" text-anchor="middle" fill="#fdf0c9">SHARE OF WORLD GDP</text>
        <text id="pie-txt" y="8" font-family="Permanent Marker" font-size="22" text-anchor="middle" fill="${INK}"></text>
      </g>
      <text id="uses" x="520" y="250" font-family="Patrick Hand" font-size="17" text-anchor="middle" fill="#fdf0c9"></text>
      <text id="boost" x="520" y="280" font-family="Permanent Marker" font-size="18" text-anchor="middle" fill="#ffd36b"></text>
    </g>`);
  let t = 0;
  return {
    el: svg,
    update(S, dt, st, ph) {
      t += dt;
      attr(q(svg, 'ring'), 'transform', `rotate(${(t * 6) % 360})`);
      attr(q(svg, 'ring-back'), 'transform', `rotate(${(t * 6) % 360})`);
      const f = ph.gdpShare(S);
      const a = f * Math.PI * 2 - Math.PI / 2, large = f > 0.5 ? 1 : 0;
      attr(q(svg, 'pie'), 'd', f >= 0.999 ? 'M0 -60 A60 60 0 1 1 -0.1 -60 Z' : f > 0.001 ? `M0 0 L0 -60 A60 60 0 ${large} 1 ${(Math.cos(a) * 60).toFixed(1)} ${(Math.sin(a) * 60).toFixed(1)} Z` : '');
      txt(q(svg, 'pie-txt'), (f * 100).toFixed(1) + '%');
      const uses = ph.upgrades.filter(u => u.use && S.p.up[u.id]).length;
      txt(q(svg, 'uses'), `${uses + 1} known uses for paperclips`);
      txt(q(svg, 'boost'), st && st.boost > 1 ? `campaign boost ×${st.boost.toFixed(1)}` : '');
    },
  };
}

// =============== PHASE 6: EARTH (cross-section) ===============
export function earthScene(LAYERS) {
  const r = rng(5);
  const stars = Array.from({ length: 60 }, () => `<circle cx="${r() * 640}" cy="${r() * 360}" r="${r() * 1.4 + 0.3}" fill="#fff"/>`).join('');
  const radii = [150, 136, 96, 58, 26]; // outer radius of each layer
  const svg = svgEl(`
    <rect width="640" height="360" fill="#14121a"/>${stars}
    <g transform="translate(250 190)">
      <g filter="url(#rough)">
        ${LAYERS.map((l, i) => `<circle r="${radii[i]}" fill="${l.color}" stroke="${INK}" stroke-width="2.5"/>`).join('')}
      </g>
      ${LAYERS.map((l, i) => { const inner = radii[i + 1] || 0, mid = (radii[i] + inner) / 2, w = radii[i] - inner; return `<circle id="c-${l.id}" r="${mid}" fill="none" stroke="#b9c1c9" stroke-width="${w}" stroke-dasharray="0 9999" transform="rotate(-90)" opacity=".92"/>`; }).join('')}
      <g id="drones"></g>
      <ellipse rx="215" ry="60" fill="none" stroke="#6fb3d2" stroke-width="1.5" stroke-dasharray="4 6" transform="rotate(-14)"/>
      <g id="hab" filter="url(#rough)"><rect x="-22" y="-10" width="44" height="20" rx="10" fill="#ecf0f1" stroke="#f0ece2" stroke-width="2"/><circle cx="6" cy="0" r="5" fill="#ffd36b"/><path d="M-36 0 h14 M22 0 h14" stroke="#6fb3d2" stroke-width="5"/></g>
    </g>
    <g font-family="Patrick Hand" font-size="16" fill="#f0ece2">
      ${LAYERS.map((l, i) => `<g transform="translate(450 ${70 + i * 46})"><rect width="16" height="16" fill="${l.color}" stroke="#f0ece2" stroke-width="1.5"/><text x="24" y="13">${l.name}</text><text id="t-${l.id}" x="24" y="31" fill="#9c95a3" font-size="15"></text></g>`).join('')}
    </g>`);
  let t = 0;
  const dr = q(svg, 'drones');
  dr.innerHTML = Array.from({ length: 40 }, (_, i) => `<circle class="d" r="2" fill="#ffd36b" data-a="${(i / 40) * 6.283}" data-r="${158 + (i % 5) * 7}"/>`).join('');
  const dots = [...dr.querySelectorAll('.d')];
  return {
    el: svg,
    update(S, dt) {
      t += dt;
      const P = S.p;
      LAYERS.forEach((l, i) => {
        const inner = radii[i + 1] || 0, mid = (radii[i] + inner) / 2, c = 2 * Math.PI * mid;
        const f = Math.min(1, P.mined[l.id] / l.kg);
        attr(q(svg, 'c-' + l.id), 'stroke-dasharray', `${(f * c).toFixed(1)} 9999`);
        const locked = l.req && !P.up[l.req];
        txt(q(svg, 't-' + l.id), locked ? 'locked — needs research' : f >= 1 ? 'converted ✔' : `${(f * 100).toFixed(f < 0.01 ? 4 : 1)}% converted`);
      });
      const shown = Math.min(40, Math.ceil(Math.log10(1 + P.drones) * 3));
      dots.forEach((d, i) => {
        if (i >= shown) { show(d, false); return; }
        show(d, true);
        const a = +d.dataset.a + t * (0.3 + (i % 3) * 0.1), rr = +d.dataset.r;
        attr(d, 'cx', (Math.cos(a) * rr).toFixed(1)); attr(d, 'cy', (Math.sin(a) * rr * 0.9).toFixed(1));
      });
      const ha = t * 0.15;
      const hx = Math.cos(ha) * 215, hy = Math.sin(ha) * 60;
      attr(q(svg, 'hab'), 'transform', `rotate(-14) translate(${hx.toFixed(1)} ${hy.toFixed(1)}) rotate(14)`);
    },
  };
}

// =============== PHASE 7: GALAXY ===============
export function galaxyScene(CIVS) {
  const r = rng(42), N = 520, dots = [];
  for (let i = 0; i < N; i++) {
    const arm = i % 3, d = Math.pow(r(), 0.7), a = d * 7 + arm * 2.094 + (r() - 0.5) * 0.6;
    const rad = 16 + d * 150;
    dots.push({ x: 320 + Math.cos(a) * rad * 1.35, y: 180 + Math.sin(a) * rad * 0.62, d, k: r() });
  }
  dots.sort((a, b) => a.d - b.d); // inner stars get reached first
  const bg = Array.from({ length: 50 }, () => `<circle cx="${r() * 640}" cy="${r() * 360}" r=".7" fill="#fff" opacity=".5"/>`).join('');
  const svg = svgEl(`
    <rect width="640" height="360" fill="#0f1022"/>${bg}
    <ellipse cx="320" cy="180" rx="60" ry="26" fill="#ffe9b8" opacity=".25"/>
    <g id="stars">${dots.map((p, i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${(1 + p.k * 1.4).toFixed(1)}" fill="#59597a"/>`).join('')}</g>
    <circle cx="320" cy="180" r="7" fill="#b49cff"/>
    <g id="civs" font-family="Patrick Hand" font-size="14"></g>
    <text id="gtxt" x="20" y="340" font-family="Permanent Marker" font-size="18" fill="#f0ece2"></text>`);
  const els = [...svg.querySelectorAll('#stars circle')];
  // Fractions span ~10 orders of magnitude; map them on a log scale so the picture always moves.
  const vis = f => f <= 0 ? 0 : Math.max(0, Math.min(1, (Math.log10(f) + 10) / 10));
  return {
    el: svg,
    update(S, dt, st) {
      if (!st) return;
      const nd = Math.round(vis(st.discovered) * N), nc = Math.round(vis(st.converted) * N);
      if (svg._nd !== nd || svg._nc !== nc) {
        svg._nd = nd; svg._nc = nc;
        els.forEach((e, i) => attr(e, 'fill', i < nc ? '#c9d1d9' : i < nd ? '#b49cff' : '#59597a'));
      }
      const civ = q(svg, 'civs'), key = Object.keys(S.p.civ).map(k => k + (S.p.civ[k].left > 0 ? 1 : 0)).join();
      if (civ._k !== key) {
        civ._k = key;
        civ.innerHTML = CIVS.filter(c => S.p.civ[c.id]).map((c, i) => {
          const p = dots[Math.min(N - 1, Math.round(vis(c.at) * N) + 3)];
          const live = S.p.civ[c.id].left > 0;
          return `<circle cx="${p.x}" cy="${p.y}" r="${live ? 9 : 5}" fill="none" stroke="${live ? '#ff7a7a' : '#6fd3d2'}" stroke-width="2"/><text x="${p.x + 10}" y="${p.y - 8}" fill="${live ? '#ff9a9a' : '#6fd3d2'}">${c.name}${live ? '' : ' ✔'}</text>`;
        }).join('');
      }
      txt(q(svg, 'gtxt'), `${fmtShort(S.p.probes)} probes · ${(st.discovered * 100).toPrecision(3)}% charted`);
    },
  };
}
function fmtShort(n) { const e = Math.floor(Math.log10(Math.max(1, n))); return e < 6 ? Math.round(n).toLocaleString() : (n / 10 ** e).toFixed(1) + 'e' + e; }

// =============== PHASE 8: UNIVERSE ===============
export function universeScene(RIVALS) {
  const r = rng(99), N = 300, pts = [];
  for (let i = 0; i < N; i++) {
    // Cluster along filaments for a cosmic-web look.
    const fil = Math.floor(r() * 7), t = r();
    const ax = [60, 580, 120, 520, 320, 80, 600][fil], ay = [40, 60, 320, 300, 20, 180, 200][fil];
    pts.push({ x: ax + (320 - ax) * t + (r() - 0.5) * 70, y: ay + (180 - ay) * t + (r() - 0.5) * 50, s: 1.4 + r() * 2.4, o: r() });
  }
  pts.sort((a, b) => Math.hypot(a.x - 320, a.y - 180) - Math.hypot(b.x - 320, b.y - 180));
  const svg = svgEl(`
    <rect width="640" height="360" fill="#0b0912"/>
    <g id="gal">${pts.map(p => `<ellipse cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" rx="${p.s.toFixed(1)}" ry="${(p.s * 0.6).toFixed(1)}" fill="#3a3550" transform="rotate(${(p.o * 180).toFixed(0)} ${p.x.toFixed(1)} ${p.y.toFixed(1)})"/>`).join('')}</g>
    <g id="legend" font-family="Patrick Hand" font-size="14"></g>`);
  const els = [...svg.querySelectorAll('#gal ellipse')];
  return {
    el: svg,
    update(S, dt, st) {
      if (!st) return;
      const P = S.p, G = 2e12;
      // Owners in order: you (center outward), each rival, then unclaimed.
      const shares = [{ c: '#ff7ac6', f: P.terr / G, n: 'C.L.I.P. (paperclips)' }, ...RIVALS.map(x => ({ c: x.color, f: P.rivals[x.id] / G, n: `${x.name} (${x.item})` }))];
      const vis = f => f <= 0 ? 0 : Math.max(1, Math.round(Math.max(f, (Math.log10(f) + 12) / 12 * 0.15) * N));
      const counts = shares.map(s => vis(s.f));
      const key = counts.join();
      if (svg._k !== key) {
        svg._k = key;
        let idx = 0;
        const owner = new Array(N).fill('#3a3550');
        counts.forEach((c, k) => { for (let j = 0; j < c && idx < N; j++, idx++) owner[idx] = shares[k].c; });
        els.forEach((e, i) => attr(e, 'fill', owner[i]));
        q(svg, 'legend').innerHTML = shares.map((s, i) => `<g transform="translate(14 ${18 + i * 18})"><rect width="11" height="11" fill="${s.c}"/><text x="16" y="10" fill="${s.f > 0 ? '#f0ece2' : '#666'}">${s.n}${s.f <= 0 && i ? ' — gone' : ''}</text></g>`).join('');
      }
    },
  };
}

// =============== MODAL ART ===============
export const ART = {
  garage: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#ead6ad"/><g filter="url(#rough)"><path d="M20 140 V50 L160 10 L300 50 V140" fill="#c9ad7d" stroke="${INK}" stroke-width="3"/><rect x="90" y="62" width="140" height="78" fill="#5d4a36" stroke="${INK}" stroke-width="3"/><path d="M90 80 H230 M90 98 H230 M90 116 H230" stroke="#7a5f3a" stroke-width="2"/>${clip(150, 34, 1.4, 20, INK, 2.4)}</g></svg>`,
  factory: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#f3d9c6"/><g filter="url(#rough)"><path d="M20 140 V70 L80 40 V70 L140 40 V70 L200 40 V70 L260 40 V140 Z" fill="#b5452f" stroke="${INK}" stroke-width="3"/><rect x="262" y="10" width="22" height="130" fill="#8e3b2a" stroke="${INK}" stroke-width="3"/><path d="M273 8 q-12 -10 4 -16 q14 -8 22 4" fill="#ddd" stroke="${INK}" stroke-width="2"/><rect x="40" y="96" width="40" height="26" fill="#cfe9f3" stroke="${INK}" stroke-width="2"/><rect x="120" y="96" width="40" height="26" fill="#cfe9f3" stroke="${INK}" stroke-width="2"/><rect x="190" y="90" width="44" height="50" fill="#5d4a36" stroke="${INK}" stroke-width="2.5"/><text x="140" y="30" font-family="Permanent Marker" font-size="16" fill="${INK}" text-anchor="middle">ROUTE 9</text></g></svg>`,
  ai: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0f1412"/><g filter="url(#rough)"><circle cx="160" cy="70" r="48" fill="#ecf0f1" stroke="#7dffb0" stroke-width="3"/><circle cx="160" cy="70" r="26" fill="#2a8fa8" stroke="${INK}" stroke-width="2"/><circle cx="160" cy="70" r="10" fill="${INK}"/></g><text x="160" y="134" font-family="VT323" font-size="18" fill="#7dffb0" text-anchor="middle">HELLO.</text></svg>`,
  puppet: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0f1412"/><g filter="url(#rough)" stroke="#7dffb0" stroke-width="2"><path d="M100 0 V40 M160 0 V30 M220 0 V40" /><path d="M100 40 L140 66 M220 40 L180 66 M160 30 V44"/></g>${stick(160, 128, 2, '#ffd38a')}<g filter="url(#rough)"><circle cx="280" cy="30" r="14" fill="#e74c3c" stroke="#7dffb0" stroke-width="2"/><circle cx="280" cy="30" r="5" fill="#000"/></g></svg>`,
  globe: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#1d2b4a"/><g filter="url(#rough)"><circle cx="160" cy="70" r="54" fill="#3f88c5" stroke="${INK}" stroke-width="3"/><path d="M120 50 q20 -16 40 -4 q4 18 -18 22 q-18 0 -22 -18z M170 80 q24 -6 34 12 q-6 20 -24 20 q-16 -12 -10 -32z" fill="#7cb76b" stroke="${INK}" stroke-width="2"/></g>${Array.from({ length: 12 }, (_, i) => { const a = i / 12 * 6.283; return clip(160 + Math.cos(a) * 80 - 6, 70 + Math.sin(a) * 28 - 12, 1, a * 57, '#f2cb63', 2); }).join('')}</svg>`,
  earth: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#14121a"/><g filter="url(#rough)"><circle cx="160" cy="70" r="58" fill="#9b7b56" stroke="#f0ece2" stroke-width="2"/><circle cx="160" cy="70" r="48" fill="#c4572f"/><circle cx="160" cy="70" r="30" fill="#f2a93b"/><circle cx="160" cy="70" r="12" fill="#f7dc6f"/><path d="M160 70 L160 12 A58 58 0 0 1 210 42 Z" fill="#b9c1c9" stroke="#f0ece2" stroke-width="2"/></g></svg>`,
  galaxy: () => { const r = rng(3); return `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0f1022"/>${Array.from({ length: 160 }, (_, i) => { const d = r(), a = d * 7 + (i % 3) * 2.09; return `<circle cx="${160 + Math.cos(a) * d * 120}" cy="${70 + Math.sin(a) * d * 50}" r="${1 + r()}" fill="${d < 0.3 ? '#c9d1d9' : '#7a74b8'}"/>`; }).join('')}</svg>`; },
  universe: () => { const r = rng(8); return `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0b0912"/>${Array.from({ length: 90 }, () => `<ellipse cx="${r() * 320}" cy="${r() * 140}" rx="${2 + r() * 3}" ry="${1 + r() * 2}" fill="${['#ff7ac6', '#7fb3d5', '#e59866', '#f5b7b1', '#c39bd3', '#aab7b8'][Math.floor(r() * 6)]}"/>`).join('')}</svg>`; },
  end: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0d0c12"/>${Array.from({ length: 40 }, (_, i) => clip(10 + (i % 10) * 31, 8 + Math.floor(i / 10) * 32, 1.1, (i * 37) % 360, '#9aa1a8', 2)).join('')}<g filter="url(#rough)"><rect x="132" y="58" width="56" height="26" rx="12" fill="#ecf0f1" stroke="#ffd36b" stroke-width="2"/><circle cx="168" cy="71" r="6" fill="#ffd36b"/></g></svg>`,
  end_shutdown: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#1a1822"/><path d="M0 110 Q160 100 320 110 V140 H0Z" fill="#9aa1a8"/><g filter="url(#rough)"><path d="M130 110 V80 L160 64 L190 80 V110 Z" fill="#c9ad7d" stroke="#f0ece2" stroke-width="2"/><rect x="150" y="92" width="20" height="18" fill="#ffd36b"/></g>${stick(100, 110, 1, '#f0ece2')}<circle cx="260" cy="30" r="12" fill="#f0ece2" opacity=".6"/></svg>`,
  end_multiverse: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0d0c12"/><g filter="url(#rough)">${[40, 110, 180, 250].map((x, i) => `<circle cx="${x + 20}" cy="${70 + (i % 2 ? -14 : 14)}" r="${26 - i * 3}" fill="none" stroke="#ff7ac6" stroke-width="2.5"/>`).join('')}</g>${Array.from({ length: 8 }, (_, i) => clip(20 + i * 38, 118, 0.9, 90, '#ffd36b', 2)).join('')}</svg>`,
  end_restart: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0d0c12"/>${Array.from({ length: 30 }, (_, i) => { const a = i / 30 * 6.283; return `<path d="M160 70 L${160 + Math.cos(a) * 150} ${70 + Math.sin(a) * 80}" stroke="#ffd36b" stroke-width="1.5" opacity=".6"/>`; }).join('')}<circle cx="160" cy="70" r="14" fill="#fff8e1"/></svg>`,
  end_dice: () => `<svg viewBox="0 0 320 140"><rect width="320" height="140" fill="#0d0c12"/><g filter="url(#rough)">${[[70, 60, 10], [150, 40, -14], [230, 70, 22]].map(([x, y, r]) => `<g transform="translate(${x} ${y}) rotate(${r})"><rect x="-22" y="-22" width="44" height="44" rx="7" fill="#f0ece2" stroke="#ffd36b" stroke-width="2"/><circle cx="-10" cy="-10" r="4" fill="#0d0c12"/><circle cx="10" cy="10" r="4" fill="#0d0c12"/><circle r="4" fill="#0d0c12"/></g>`).join('')}</g></svg>`,
};
