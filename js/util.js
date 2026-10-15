// Small shared helpers. No DOM access at module scope (the balance simulator imports this in Node).

const SUFFIX = ['', 'K', 'M', 'B', 'T', 'Qa', 'Qi', 'Sx', 'Sp', 'Oc', 'No', 'Dc',
  'UDc', 'DDc', 'TDc', 'QaDc', 'QiDc', 'SxDc', 'SpDc', 'OcDc', 'NoDc', 'Vg'];

export const settings = { notation: 'named' };

export function fmt(n, dp = 2) {
  if (n === Infinity) return '∞';
  if (!isFinite(n)) return '0';
  if (n < 0) return '-' + fmt(-n, dp);
  if (n < 1000) {
    if (n < 10 && n % 1 !== 0) return n.toFixed(Math.min(dp, 2)).replace(/\.?0+$/, '') || '0';
    if (n < 100 && n % 1 !== 0) return n.toFixed(1).replace(/\.0$/, '');
    return Math.floor(n).toString();
  }
  const e = Math.floor(Math.log10(n));
  const tier = Math.floor(e / 3);
  if (settings.notation === 'sci' || tier >= SUFFIX.length) {
    const m = n / Math.pow(10, e);
    return m.toFixed(2) + 'e' + e;
  }
  const v = n / Math.pow(1000, tier);
  return (v >= 100 ? v.toFixed(1) : v.toFixed(2)).replace(/\.?0+$/, '') + SUFFIX[tier];
}

export function fmtInt(n) {
  if (n < 1e6) return Math.floor(n).toLocaleString('en-US');
  return fmt(n);
}

export function money(n) {
  if (n < 0) return '-' + money(-n);
  if (n < 100) return '$' + n.toFixed(2);
  if (n < 1e6) return '$' + Math.floor(n).toLocaleString('en-US');
  return '$' + fmt(n);
}

// Tonne-based units up to yottatonnes, then solar masses.
const MASS_UNITS = [[1e24, 'Yt'], [1e21, 'Zt'], [1e18, 'Et'], [1e15, 'Pt'], [1e12, 'Tt'], [1e9, 'Gt'], [1e6, 'Mt'], [1e3, 'kt'], [1, 't']];
export function mass(kg) {
  if (kg >= 1e29) return fmt(kg / 1.989e30) + ' M☉';
  if (kg < 1000) return fmt(kg) + ' kg';
  const t = kg / 1000;
  for (const [d, u] of MASS_UNITS) if (t >= d) return fmt(t / d) + ' ' + u;
  return fmt(kg) + ' kg';
}

export function time(sec) {
  sec = Math.max(0, Math.floor(sec));
  const h = Math.floor(sec / 3600), m = Math.floor((sec % 3600) / 60), s = sec % 60;
  if (h) return `${h}h ${m}m`;
  if (m) return `${m}m ${s.toString().padStart(2, '0')}s`;
  return `${s}s`;
}

export const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
export const lerp = (a, b, t) => a + (b - a) * t;
export const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export const rand = (a, b) => a + Math.random() * (b - a);

export function pct(f, dp = 0) {
  if (f > 0 && f < 0.0001 && dp < 4) return '<0.01%';
  return (f * 100).toFixed(dp) + '%';
}

// Slow, smooth pseudo-random wobble for market prices: sum of incommensurate sines.
export function wobble(t, seed = 0) {
  return 0.55 * Math.sin(t / 37 + seed) + 0.3 * Math.sin(t / 13.7 + seed * 2.1) + 0.15 * Math.sin(t / 5.3 + seed * 3.7);
}
