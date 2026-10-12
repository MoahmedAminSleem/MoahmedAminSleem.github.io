/* ═══════════════════════════════════════════════════════════
   PER-ANKH · THE HOUSE OF LIFE — engine
   Mohamed Amin Sleem
   ═══════════════════════════════════════════════════════════ */
(() => {
'use strict';

const doc = document.documentElement;
const qs  = (s, c = document) => c.querySelector(s);
const qsa = (s, c = document) => [...c.querySelectorAll(s)];
const reduced     = matchMedia('(prefers-reduced-motion: reduce)').matches;
const finePointer = matchMedia('(pointer: fine)').matches;
const AR_DIGITS = '٠١٢٣٤٥٦٧٨٩';
const arNum = n => String(n).replace(/\d/g, d => AR_DIGITS[+d]);
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ── toast ─────────────────────────────────────────────── */
const toastEl = qs('#toast');
let toastT;
const toast = m => {
  if (!toastEl) return;
  toastEl.textContent = m;
  toastEl.classList.add('is-on');
  clearTimeout(toastT);
  toastT = setTimeout(() => toastEl.classList.remove('is-on'), 2600);
};

/* ── shared: crown step activation ─────────────────────── */
let chartPlayed = false;
let chartP = 0.05;
let runKpis = () => {};
let runChart = () => {};
const activateStep = i => {
  const steps = qsa('.step');
  const vises = qsa('.vis');
  steps.forEach((s, j) => s.classList.toggle('is-on', j === i));
  vises.forEach((v, j) => v.classList.toggle('is-on', j === i));
  const scale = qs('.vis--scale');
  if (scale) {
    if (i === 2) setTimeout(() => scale.classList.add('maat-balanced'), 350);
    else scale.classList.remove('maat-balanced');
  }
  if (i === 3) { runKpis(); runChart(); }
};

/* ── chart ─────────────────────────────────────────────── */
const chartCanvas = qs('#crownChart');
const chartData = [32, 38, 35, 44, 42, 52, 49, 58, 55, 63, 60, 69, 66, 74, 71, 79, 77, 84, 82, 88, 86, 91, 89, 94];
const setupChart = () => {
  if (!chartCanvas) return;
  const dpr = Math.min(devicePixelRatio || 1, 2);
  const w = chartCanvas.clientWidth || 640;
  const h = chartCanvas.clientHeight || 240;
  chartCanvas.width = w * dpr;
  chartCanvas.height = h * dpr;
  chartCanvas.getContext('2d').setTransform(dpr, 0, 0, dpr, 0, 0);
};
const drawChart = p => {
  chartP = p;
  if (!chartCanvas) return;
  const ctx = chartCanvas.getContext('2d');
  const W = chartCanvas.width / (Math.min(devicePixelRatio || 1, 2));
  const H = chartCanvas.height / (Math.min(devicePixelRatio || 1, 2));
  ctx.clearRect(0, 0, W, H);
  ctx.strokeStyle = 'rgba(237,227,204,.06)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 5; i++) { ctx.beginPath(); ctx.moveTo(0, H * i / 5); ctx.lineTo(W, H * i / 5); ctx.stroke(); }
  const n = Math.max(2, Math.floor(chartData.length * p));
  const px = i => 14 + (W - 28) * i / (chartData.length - 1);
  const py = v => H - 16 - (H - 44) * (v / 100);
  ctx.beginPath();
  ctx.moveTo(px(0), py(chartData[0]));
  for (let i = 1; i < n; i++) {
    const x0 = px(i - 1), y0 = py(chartData[i - 1]), x1 = px(i), y1 = py(chartData[i]);
    const mx = (x0 + x1) / 2;
    ctx.bezierCurveTo(mx, y0, mx, y1, x1, y1);
  }
  ctx.strokeStyle = '#d9a441'; ctx.lineWidth = 2.4; ctx.lineJoin = 'round'; ctx.stroke();
  const lastX = px(n - 1), lastY = py(chartData[n - 1]);
  ctx.lineTo(lastX, H - 4); ctx.lineTo(px(0), H - 4); ctx.closePath();
  const g = ctx.createLinearGradient(0, 0, 0, H);
  g.addColorStop(0, 'rgba(217,164,65,.30)'); g.addColorStop(1, 'rgba(217,164,65,0)');
  ctx.fillStyle = g; ctx.fill();
  ctx.beginPath(); ctx.arc(lastX, lastY, 4, 0, 7); ctx.fillStyle = '#f0c96a'; ctx.fill();
  ctx.beginPath(); ctx.arc(lastX, lastY, 8, 0, 7); ctx.strokeStyle = 'rgba(240,201,106,.4)'; ctx.lineWidth = 1; ctx.stroke();
};

/* ── basics (always on) ────────────────────────────────── */
const initBasics = () => {
  // copy email
  const btn = qs('#copyEmail');
  if (btn) btn.addEventListener('click', async () => {
    const em = btn.dataset.email;
    try { await navigator.clipboard.writeText(em); }
    catch { const t = document.createElement('textarea'); t.value = em; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    toast('EMAIL COPIED — حُفِظَتِ الرِّسالة');
  });
  // rail active sync
  const secs = ['#hero', '#about', '#skills', '#crown', '#works', '#journey', '#contact'];
  const btns = qsa('.rail__btn');
  const io = new IntersectionObserver(es => es.forEach(x => {
    if (x.isIntersecting) {
      const i = secs.indexOf('#' + x.target.id);
      btns.forEach((b, j) => b.classList.toggle('is-on', j === i));
    }
  }), { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(s => { const el = qs(s); if (el) io.observe(el); });
  // easter egg
  const ankh = qs('.footer__ankh');
  if (ankh) {
    let ck = 0, ct;
    ankh.style.cursor = 'pointer';
    ankh.addEventListener('click', () => {
      ck++; clearTimeout(ct); ct = setTimeout(() => ck = 0, 900);
      if (ck >= 3) { ck = 0; toast('THE SACRED SCARAB — الكاتبُ يراك · +20 WISDOM'); flash(); }
    });
  }
  const flash = () => {
    const f = document.createElement('div');
    f.className = 'flash'; document.body.appendChild(f);
    setTimeout(() => f.remove(), 900);
    f.animate([{ opacity: 0 }, { opacity: 1 }, { opacity: 0 }], { duration: 850, easing: 'ease-out' });
  };
};

/* ── particle field (hero) ─────────────────────────────── */
class Field {
  constructor(canvas) {
    this.c = canvas;
    this.ctx = canvas.getContext('2d');
    this.dpr = Math.min(devicePixelRatio || 1, 2);
    this.t = 0; this.progress = 0;
    this.mouse = { x: -9e3, y: -9e3 };
    this.state = 'idle';
    this.resize(); this.spawn();
    addEventListener('resize', debounce(() => { this.resize(); this.spawn(); }, 220));
    const zone = canvas.parentElement;
    zone.addEventListener('pointermove', e => {
      const r = canvas.getBoundingClientRect();
      this.mouse.x = e.clientX - r.left; this.mouse.y = e.clientY - r.top;
    });
    zone.addEventListener('pointerleave', () => { this.mouse.x = -9e3; this.mouse.y = -9e3; });
    this.loop = this.loop.bind(this);
    requestAnimationFrame(this.loop);
  }
  resize() {
    const r = this.c.parentElement.getBoundingClientRect();
    this.w = r.width; this.h = r.height;
    this.c.width = this.w * this.dpr; this.c.height = this.h * this.dpr;
    this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);
    this.makeTargets();
  }
  makeTargets() {
    // ankh point cloud (analytic)
    const pts = [], W = this.w, H = this.h;
    const s = Math.min(W * 0.24, H * 0.21);
    const cx = W * 0.5, cy = H * 0.40;
    const RX = s * 0.78, RY = s * 0.98;
    for (let i = 0; i < 84; i++) { const a = (i / 84) * Math.PI * 2; pts.push({ x: cx + Math.cos(a) * RX, y: cy + Math.sin(a) * RY }); }
    const vTop = cy + RY, vBot = cy + RY + s * 1.62;
    for (let i = 0; i < 26; i++) { const p = i / 25; pts.push({ x: cx + (Math.random() - .5) * 2.2, y: vTop + p * (vBot - vTop) }); }
    const hY = cy + RY + s * 0.62;
    for (let i = 0; i < 20; i++) { const p = i / 19; pts.push({ x: cx - s * 1.0 + p * s * 2.0, y: hY + (Math.random() - .5) * 2 }); }
    this.targets = pts;
  }
  spawn() {
    const area = this.w * this.h;
    this.n = Math.round(Math.min(430, Math.max(150, area / 2700)));
    this.ps = [];
    for (let i = 0; i < this.n; i++) {
      const r = Math.random();
      this.ps.push({
        x: Math.random() * this.w, y: Math.random() * this.h,
        vx: (Math.random() - .5) * .5, vy: (Math.random() - .5) * .5,
        tx: null, ty: null,
        s: Math.random() * 1.5 + .7,
        c: r < .5 ? 0 : (r < .92 ? 1 : 2),
        o: Math.random() * .5 + .3,
        tw: Math.random() * Math.PI * 2,
      });
    }
    this.targets.forEach((t, i) => { const p = this.ps[i % this.ps.length]; p.tx = t.x; p.ty = t.y; });
  }
  gather() { this.state = 'gather'; }
  setProgress(p) { this.progress = p; }
  step() {
    this.t += 0.0055;
    const ctx = this.ctx, colors = ['237,227,204', '217,164,65', '99,126,214'];
    ctx.clearRect(0, 0, this.w, this.h);
    const sc = this.progress;
    for (let ci = 0; ci < 3; ci++) {
      ctx.fillStyle = `rgb(${colors[ci]})`;
      for (const p of this.ps) {
        if (p.c !== ci) continue;
        if (this.state === 'gather' && p.tx != null) {
          const dx = p.tx - p.x, dy = p.ty - p.y;
          p.vx += dx * 0.0065 + (Math.random() - .5) * .05;
          p.vy += dy * 0.0065 + (Math.random() - .5) * .05;
          if (Math.hypot(dx, dy) < 3.2) { p.vx *= .3; p.vy *= .3; }
        } else {
          const a = Math.sin(p.x * 0.004 + this.t * 2.1 + p.tw) + Math.cos(p.y * 0.0032 - this.t * 1.7 + p.tw);
          p.vx += Math.cos(a) * 0.022;
          p.vy += Math.sin(a) * 0.022 - 0.006;
        }
        const mdx = p.x - this.mouse.x, mdy = p.y - this.mouse.y, md = Math.hypot(mdx, mdy);
        if (md < 130 && md > .01) { const f = (130 - md) / 130 * .95; p.vx += mdx / md * f; p.vy += mdy / md * f; }
        if (sc > 0.05) { p.vx += (Math.random() - .5) * sc * .8; p.vy += (Math.random() - .5) * sc * .8 + .05 * sc; }
        p.vx *= .93; p.vy *= .93;
        p.x += p.vx; p.y += p.vy;
        if (p.x < -20) p.x = this.w + 20; if (p.x > this.w + 20) p.x = -20;
        if (p.y < -20) p.y = this.h + 20; if (p.y > this.h + 20) p.y = -20;
        const alpha = p.o * (1 - sc * .88) * (0.72 + 0.28 * Math.sin(this.t * 3 + p.tw));
        ctx.globalAlpha = alpha;
        ctx.fillRect(p.x, p.y, p.s, p.s);
      }
    }
    ctx.globalAlpha = 1;
  }
  loop() {
    if (!document.hidden) this.step();
    requestAnimationFrame(this.loop);
  }
}

/* ── map data-level -> --lvl (both modes) ──────────────── */
qsa('.cart').forEach(c => c.style.setProperty('--lvl', (c.dataset.level || 80) + '%'));

/* ── wrap r-line content into inner spans (mask pattern) ─ */
qsa('.r-line').forEach(el => {
  if (el.querySelector(':scope > .r-line__in')) return;
  const inner = document.createElement('span');
  inner.className = 'r-line__in';
  while (el.firstChild) inner.appendChild(el.firstChild);
  el.appendChild(inner);
});

/* ═══════════════════════════════════════════════════════
   MODE SELECT
   ═══════════════════════════════════════════════════════ */
const runFull = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !reduced;

if (!runFull) {
  doc.classList.add('no-lib');
  const loader = qs('#loader');
  if (loader) loader.classList.add('is-done');
  initBasics();
  // graceful basics
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) x.target.classList.add('is-in'); }), { threshold: .25 });
  qsa('.cart').forEach(c => io.observe(c));
  const ioS = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) activateStep(+x.target.dataset.idx); }), { rootMargin: '-38% 0px -38% 0px' });
  qsa('.step').forEach((s, i) => { s.dataset.idx = i; ioS.observe(s); });
  qsa('.stat__n').forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
  setupChart(); drawChart(1);
  qs('.vis--scale')?.classList.add('maat-balanced');
  qsa('.kpi b').forEach(b => { b.textContent = (+b.dataset.kpi).toFixed(1); });
  qsa('a[href^="#"]').forEach(a => a.addEventListener('click', e => {
    const el = qs(a.getAttribute('href'));
    if (el) { e.preventDefault(); el.scrollIntoView(); }
  }));
  qs('#toTop')?.addEventListener('click', () => scrollTo({ top: 0 }));
  return;
}

/* ═══════════════════════════════════════════════════════
   FULL EXPERIENCE
   ═══════════════════════════════════════════════════════ */
gsap.registerPlugin(ScrollTrigger);

/* ── lenis ─────────────────────────────────────────────── */
const lenis = new Lenis({ duration: 1.15, smoothWheel: true });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ── cursor ────────────────────────────────────────────── */
if (finePointer) {
  document.body.classList.add('has-cursor');
  const cur = qs('#cursor'), dot = qs('.cursor__dot'), ring = qs('.cursor__ring'), label = qs('#cursorLabel');
  let x = innerWidth / 2, y = innerHeight / 2, rx = x, ry = y;
  addEventListener('pointermove', e => {
    x = e.clientX; y = e.clientY;
    dot.style.transform = `translate(${x}px,${y}px) translate(-50%,-50%)`;
  }, { passive: true });
  const follow = () => {
    rx += (x - rx) * .16; ry += (y - ry) * .16;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  };
  follow();
  const sel = 'a,button,.cart,.panel,.clink,.stele';
  document.addEventListener('pointerover', e => { if (e.target.closest(sel)) cur.classList.add('is-link'); });
  document.addEventListener('pointerout',  e => { if (e.target.closest(sel)) cur.classList.remove('is-link'); });
  const fr = qs('.frieze');
  if (fr) {
    fr.addEventListener('pointerenter', () => { cur.classList.add('is-drag'); label.textContent = 'DRAG · اسحب'; });
    fr.addEventListener('pointerleave', () => cur.classList.remove('is-drag'));
  }
}

/* ── loader ────────────────────────────────────────────── */
const runLoader = done => {
  const loader = qs('#loader');
  if (!loader) return done();
  const num = qs('.ld__num'), ar = qs('.ld__ar');
  const paths = qsa('.ld__cartpath');
  const st = { v: 0 };
  const tl = gsap.timeline({
    onComplete: () => { loader.classList.add('is-done'); done(); }
  });
  tl.to(paths, { strokeDashoffset: 0, duration: 1.3, stagger: .14, ease: 'power2.inOut' }, 0)
    .to(st, {
      v: 100, duration: 1.55, ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(st.v);
        num.textContent = String(v).padStart(2, '0');
        ar.textContent = arNum(v).padStart(2, '٠');
      }
    }, 0)
    .to({}, { duration: .15 })
    .add(() => loader.classList.add('is-open'))
    .to({}, { duration: 1.02 });
  loader.addEventListener('click', () => tl.progress(1), { once: true });
};

/* ── field ─────────────────────────────────────────────── */
let field = null;
const heroCanvas = qs('#field');
if (heroCanvas) field = new Field(heroCanvas);

/* ── hero intro ────────────────────────────────────────── */
const heroIntro = () => {
  field && field.gather();
  gsap.timeline({ defaults: { ease: 'power3.out' } })
    .fromTo('.hero__name .r-line__in', { yPercent: 115, y: 0 }, { yPercent: 0, y: 0, duration: 1.15, stagger: .1 }, 0)
    .fromTo('.hero__kicker', { y: -16, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, .3)
    .fromTo(['.hero__sub', '.hero__meta', '.hero__cta', '.hero__scroll'],
      { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .9, stagger: .09 }, .5);
};

runLoader(heroIntro);

/* ── rosetta rotation ──────────────────────────────────── */
(() => {
  const el = qs('#rosettaText');
  if (!el) return;
  const phrases = [
    'I map the work before I model the data.',
    'أرسمُ العملَ قبل أن أنمذجَ البيانات.',
    'capture → clean → model → weigh → decide',
    'البياناتُ لا تكذب — لكنها تحتاجُ من يفكُّ رموزها.',
    '10,000+ orders. One decision.',
    'القياسُ أمانة — والميزانُ لا يحابي.',
  ];
  const POOL_L = '<>/#%&*+=·:01';
  const POOL_A = 'أبتثجحخدذرزسشصضطظعغفقكلمنهوي';
  let pi = 0;
  const scramble = to => {
    const pool = /[\u0600-\u06FF]/.test(to) ? POOL_A : POOL_L;
    let frame = 0;
    const tick = () => {
      const reveal = Math.floor(frame / 2);
      let out = '';
      for (let i = 0; i < to.length; i++) {
        out += i < reveal ? to[i] : (to[i] === ' ' ? ' ' : pool[(Math.random() * pool.length) | 0]);
      }
      el.textContent = out; frame++;
      if (reveal <= to.length) setTimeout(tick, 22);
      else el.textContent = to;
    };
    tick();
  };
  setInterval(() => { pi = (pi + 1) % phrases.length; scramble(phrases[pi]); }, 3900);
})();

/* ── generic reveals ───────────────────────────────────── */
qsa('.r-fade').filter(el => !el.closest('.hero')).forEach(el => {
  gsap.fromTo(el, { y: 22, opacity: 0 }, {
    y: 0, opacity: 1, duration: .95, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
});
qsa('.r-line__in').filter(el => !el.closest('.hero')).forEach(el => {
  gsap.fromTo(el, { yPercent: 115, y: 0 }, {
    yPercent: 0, y: 0, duration: 1.05, ease: 'power4.out',
    scrollTrigger: { trigger: el.closest('.r-line'), start: 'top 86%' }
  });
});
qsa('.r-chisel').forEach(el => {
  const io = new IntersectionObserver(([e]) => {
    if (e.isIntersecting) { el.classList.add('is-cut'); io.disconnect(); }
  }, { threshold: .35 });
  io.observe(el);
});

/* ── stats counters ────────────────────────────────────── */
qsa('.stat__n').forEach(el => {
  const target = +el.dataset.count, suf = el.dataset.suffix || '';
  ScrollTrigger.create({
    trigger: el, start: 'top 88%', once: true,
    onEnter: () => {
      const o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.7, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) + suf });
    }
  });
});

/* ── cartouches ────────────────────────────────────────── */
qsa('.cart').forEach(c => {
  c.style.setProperty('--lvl', (c.dataset.level || 80) + '%');
  ScrollTrigger.create({ trigger: c, start: 'top 90%', once: true, onEnter: () => c.classList.add('is-in') });
  if (finePointer) {
    c.addEventListener('pointerenter', () => c.style.transition = 'transform .14s ease-out, border-color .4s, box-shadow .4s');
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      const rx = ((e.clientY - r.top) / r.height - .5) * -7;
      const ry = ((e.clientX - r.left) / r.width - .5) * 7;
      c.style.transform = `perspective(700px) rotateX(${rx.toFixed(2)}deg) rotateY(${ry.toFixed(2)}deg) translateY(-4px)`;
    });
    c.addEventListener('pointerleave', () => {
      c.style.transition = 'transform .5s cubic-bezier(.22,1,.36,1), border-color .4s, box-shadow .4s';
      c.style.transform = '';
    });
  }
});

/* ── crown steps ───────────────────────────────────────── */
qsa('.step').forEach((step, i) => {
  ScrollTrigger.create({
    trigger: step, start: 'top 64%', end: 'bottom 36%',
    onToggle: self => { if (self.isActive) activateStep(i); }
  });
});
const runKpisFn = () => {
  qsa('.kpi b').forEach(b => {
    const t = +b.dataset.kpi;
    const o = { v: 0 };
    gsap.to(o, { v: t, duration: 1.15, ease: 'power2.out', onUpdate: () => b.textContent = o.v.toFixed(1) });
  });
};
const runChartFn = () => {
  if (chartPlayed) return;
  chartPlayed = true;
  const o = { p: 0.05 };
  gsap.to(o, { p: 1, duration: 1.7, ease: 'power2.inOut', onUpdate: () => drawChart(o.p) });
};
runKpis = runKpisFn;
runChart = runChartFn;
setupChart();
drawChart(0.05);
addEventListener('resize', debounce(() => { setupChart(); drawChart(chartP); }, 220));

/* ── frieze horizontal ─────────────────────────────────── */
const mm = gsap.matchMedia();
mm.add('(min-width: 861px)', () => {
  const track = qs('#friezeTrack'), wrap = qs('.frieze');
  if (!track || !wrap) return;
  const dist = () => track.scrollWidth - wrap.clientWidth + 60;
  const tween = gsap.to(track, {
    x: () => -dist(), ease: 'none',
    scrollTrigger: {
      trigger: wrap, start: 'top top', end: () => '+=' + dist(),
      pin: true, scrub: 1, anticipatePin: 1, invalidateOnRefresh: true,
    }
  });
  qsa('.panel__img').forEach(img => {
    gsap.fromTo(img, { xPercent: -5 }, {
      xPercent: 5, ease: 'none',
      scrollTrigger: {
        trigger: img.closest('.panel'), containerAnimation: tween,
        start: 'left right', end: 'right left', scrub: true,
      }
    });
  });
});
gsap.from('.panel', {
  y: 44, opacity: 0, duration: .9, stagger: .07, ease: 'power3.out',
  scrollTrigger: { trigger: '.frieze', start: 'top 78%' }
});

/* ── dynasties ─────────────────────────────────────────── */
gsap.to('#spineFill', {
  scaleY: 1, ease: 'none',
  scrollTrigger: { trigger: '.dyn', start: 'top 72%', end: 'bottom 58%', scrub: .5 }
});
qsa('.dyn__card').forEach(c => {
  gsap.fromTo(c, { y: 36, opacity: 0 }, {
    y: 0, opacity: 1, duration: .9, ease: 'power3.out',
    scrollTrigger: { trigger: c, start: 'top 87%' }
  });
});
qsa('.cred__card').forEach(c => {
  gsap.fromTo(c, { y: 24, opacity: 0 }, {
    y: 0, opacity: 1, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: c, start: 'top 92%' }
  });
});

/* ── crown steps entrance ──────────────────────────────── */
gsap.from('.step', {
  y: 26, duration: .8, stagger: .1, ease: 'power3.out',
  scrollTrigger: { trigger: '.crown__steps', start: 'top 80%' }
});

/* ── hero scroll behavior ──────────────────────────────── */
ScrollTrigger.create({
  trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .4,
  onUpdate: self => field && field.setProgress(self.progress)
});
gsap.to('.hero__inner', {
  y: -70, opacity: .18, ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .6 }
});

/* ── rail progress ─────────────────────────────────────── */
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: self => { const p = qs('#railProg'); if (p) p.style.transform = `scaleY(${self.progress})`; }
});

/* ── anchors ───────────────────────────────────────────── */
qsa('a[href^="#"], a[data-scroll]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || !id.startsWith('#')) return;
    const el = qs(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { duration: 1.5, offset: 0 });
  });
});
qs('#toTop')?.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.6 }));

/* ── basics in full mode too ───────────────────────────── */
initBasics();

/* ── refresh ───────────────────────────────────────────── */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());

})();
