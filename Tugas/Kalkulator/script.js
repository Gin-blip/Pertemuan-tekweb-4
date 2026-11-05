'use strict';
(() => {
const PREC = 12;                               
const pow10 = n => 10n ** BigInt(n);
const abs = x => (x < 0n ? -x : x);
const NUM_RE = /^[+-]?(\d+\.?\d*|\.\d+)$/;

const parse = raw => {                         
  const s = String(raw).trim().replace(',', '.');
  if (!NUM_RE.test(s)) return null;
  const [int, frac = ''] = s.replace(/^[+-]/, '').split('.');
  const n = BigInt(int + frac || '0');
  return { n: s.startsWith('-') ? -n : n, s: frac.length };
};
const align = (a, b) => {
  const s = Math.max(a.s, b.s);
  return [a.n * pow10(s - a.s), b.n * pow10(s - b.s), s];
};
const OPS = {
  '+': (a, b) => { const [x, y, s] = align(a, b); return { n: x + y, s }; },
  '-': (a, b) => { const [x, y, s] = align(a, b); return { n: x - y, s }; },
  '*': (a, b) => ({ n: a.n * b.n, s: a.s + b.s }),
  '/': (a, b) => {
    if (b.n === 0n) throw new RangeError('DIV0');
    const num = a.n * pow10(b.s + PREC), den = b.n * pow10(a.s);
    let q = num / den;                         // dibulatkan half-away-from-zero
    if (2n * abs(num % den) >= abs(den)) q += (num < 0n) === (den < 0n) ? 1n : -1n;
    return { n: q, s: PREC };
  },
};
const format = ({ n, s }) => {
  const digits = abs(n).toString().padStart(s + 1, '0');
  let out = s ? `${digits.slice(0, -s)}.${digits.slice(-s)}` : digits;
  if (out.includes('.')) out = out.replace(/\.?0+$/, '');
  return (n < 0n && /[1-9]/.test(out) ? '-' : '') + out;
};
/** @returns {{ok:true,text:string}|{ok:false,code:'EMPTY'|'INVALID'|'DIV0',field:'a'|'b'}} */
const calculate = (rawA, op, rawB) => {
  for (const [field, raw] of [['a', rawA], ['b', rawB]]) {
    if (!raw.trim()) return { ok: false, code: 'EMPTY', field };
    if (!parse(raw)) return { ok: false, code: 'INVALID', field };
  }
  try { return { ok: true, text: format(OPS[op](parse(rawA), parse(rawB))) }; }
  catch (e) {
    if (e instanceof RangeError) return { ok: false, code: 'DIV0', field: 'b' };
    throw e;
  }
};

const Sfx = (() => {
  let ctx, master, enabled = true;
  const ensure = () => {
    if (!ctx) {
      ctx = new (window.AudioContext || window.webkitAudioContext)();
      master = ctx.createGain(); master.gain.value = 0.22; master.connect(ctx.destination);
    }
    if (ctx.state === 'suspended') ctx.resume();
    return ctx;
  };
  const tone = (freq, { t = 0, dur = 0.08, type = 'square', vol = 1, slide = 0 } = {}) => {
    if (!enabled) return;
    const c = ensure(), at = c.currentTime + t;
    const osc = c.createOscillator(), amp = c.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, at);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(30, freq + slide), at + dur);
    amp.gain.setValueAtTime(vol, at);
    amp.gain.exponentialRampToValueAtTime(0.001, at + dur);
    osc.connect(amp).connect(master);
    osc.start(at); osc.stop(at + dur + 0.02);
  };
  return {
    unlock: ensure,
    toggle: () => (enabled = !enabled),
    click: f => tone(f, { dur: 0.07, slide: f * 0.5 }),
    ok: () => { tone(784, { t: 0.07, dur: 0.08 }); tone(1175, { t: 0.14, dur: 0.18, type: 'triangle' }); },
    error: () => {
      tone(220, { t: 0.05, dur: 0.18, type: 'sawtooth', slide: -90 });
      tone(110, { t: 0.22, dur: 0.4, type: 'sawtooth', slide: -60 });
    },
    start: () => {
      [262, 330, 392, 523, 659, 784].forEach((f, i) => tone(f, { t: i * 0.075, dur: 0.11 }));
      tone(1047, { t: 0.5, dur: 0.5, type: 'triangle' });
      tone(523, { t: 0.5, dur: 0.5, vol: 0.5 });
    },
  };
})();

const $ = s => document.querySelector(s);
const el = { bezel: $('.bezel'), screen: $('.screen'), a: $('#a'), b: $('#b'), expr: $('#expr'), result: $('#result'), msg: $('#msg'), snd: $('#snd') };
const SYMBOL = { '+': '+', '-': '-', '*': '\u00d7', '/': '\u00f7' };
const PITCH = { '+': 523, '-': 440, '*': 659, '/': 392 };
const MESSAGES = {
  EMPTY: 'ISI KEDUA ANGKA DULU',
  INVALID: 'HANYA ANGKA, TANDA - DAN KOMA/TITIK',
  DIV0: 'TIDAK BISA BAGI 0. UBAH ANGKA B',
};
const INITIAL = { phase: 'idle', expr: 'READY PLAYER 1', text: '0', msg: '', bad: null };
const state = { ...INITIAL };

const retrigger = (node, cls) => { node.classList.remove(cls); void node.offsetWidth; node.classList.add(cls); };
const shown = t => (t.length > 22 ? Number(t).toExponential(6) : t);  

const render = () => {
  const text = shown(state.text);
  el.result.textContent = text;
  el.result.style.setProperty('--len', text.length);
  el.expr.textContent = state.expr;
  el.msg.textContent = state.msg;
  el.screen.dataset.phase = state.phase;
  for (const f of ['a', 'b']) el[f].setAttribute('aria-invalid', String(state.bad === f));
};
const setState = patch => { Object.assign(state, patch); render(); };

const sanitize = v => {
  const s = v.replace(/[^\d.,-]/g, '').replace(/(?!^)-/g, '');         
  const i = s.search(/[.,]/);
  return i < 0 ? s : s.slice(0, i + 1) + s.slice(i + 1).replace(/[.,]/g, ''); 
};

const run = op => {
  Sfx.click(PITCH[op]);                                                  
  const r = calculate(el.a.value, op, el.b.value);
  if (r.ok) {
    setState({ phase: 'ok', text: r.text, bad: null, msg: '',
      expr: `${el.a.value.trim()} ${SYMBOL[op]} ${el.b.value.trim()} =` });
    retrigger(el.result, 'pop'); Sfx.ok();
  } else {
    setState({ phase: 'error', text: r.code === 'DIV0' ? 'GAME OVER' : 'ERR', bad: r.field,
      expr: '!! ERROR !!', msg: MESSAGES[r.code] });
    retrigger(el.bezel, 'shake'); Sfx.error(); el[r.field].focus();
  }
};

$('.ops').addEventListener('click', e => { const k = e.target.closest('[data-op]'); if (k) run(k.dataset.op); });

for (const f of ['a', 'b']) el[f].addEventListener('input', () => {
  el[f].value = sanitize(el[f].value);
  if (state.phase === 'error') setState({ ...INITIAL });
});
for (const n of document.querySelectorAll('[data-neg]')) n.addEventListener('click', () => {
  const i = el[n.dataset.neg];
  i.value = i.value.startsWith('-') ? i.value.slice(1) : '-' + i.value;
  i.dispatchEvent(new Event('input')); Sfx.click(740);
});
$('#clr').addEventListener('click', () => {
  el.a.value = el.b.value = ''; Sfx.click(300); setState({ ...INITIAL });
  if (matchMedia('(pointer:fine)').matches) el.a.focus();
});
el.snd.addEventListener('click', () => {
  const on = Sfx.toggle();
  el.snd.setAttribute('aria-pressed', String(!on));
  el.snd.textContent = on ? 'SND ON' : 'SND OFF';
  if (on) Sfx.click(880);
});

addEventListener('pointermove', e => {
  const root = document.documentElement.style;
  root.setProperty('--lx', (e.clientX / innerWidth * 2 - 1).toFixed(2));
  root.setProperty('--ly', (e.clientY / innerHeight * 2 - 1).toFixed(2));
}, { passive: true });

const boot = $('.boot');
boot.addEventListener('click', () => {
  Sfx.unlock(); Sfx.start();
  document.body.classList.add('on');
  $('.stage').inert = false;
  if (matchMedia('(pointer:fine)').matches) el.a.focus({ preventScroll: true });
}, { once: true });
boot.focus();
render();
})();