/* ═══════════════════════════════════════════════════════════
   THE DATA LEDGER — engine
   Mohamed Amin Sleem — paper · ink · seal-red · viridian
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

/* ── cairo clock ───────────────────────────────────────── */
const clockEl = qs('#cairoClock');
if (clockEl) {
  const tick = () => {
    try {
      clockEl.textContent = 'CAIRO ' + new Date().toLocaleTimeString('en-GB', { timeZone: 'Africa/Cairo', hour12: false });
    } catch (e) { clockEl.textContent = 'CAIRO'; }
  };
  tick(); setInterval(tick, 1000);
}

/* ── split chars ───────────────────────────────────────── */
qsa('.hn-chars').forEach(el => {
  const txt = el.textContent;
  el.textContent = '';
  [...txt].forEach(ch => {
    const s = document.createElement('span');
    s.className = 'ch';
    s.textContent = ch;
    el.appendChild(s);
  });
});
/* words for folio titles */
qsa('.folio-title').forEach(el => {
  const txt = el.textContent.trim();
  el.textContent = '';
  txt.split(' ').forEach((w, i, arr) => {
    const wrap = document.createElement('span');
    wrap.style.cssText = 'display:inline-block;overflow:hidden;vertical-align:bottom';
    const inner = document.createElement('span');
    inner.className = 'fw';
    inner.textContent = w;
    wrap.appendChild(inner);
    el.appendChild(wrap);
    if (i < arr.length - 1) el.appendChild(document.createTextNode(' '));
  });
});

/* ── levels ────────────────────────────────────────────── */
qsa('.lrow').forEach(r => r.style.setProperty('--lvl', (+r.dataset.level / 100).toFixed(2)));
qsa('.stat').forEach((s, i) => s.style.setProperty('--lvl', [0.72, 0.88, 0.55, 1][i] ?? 1));

/* ── basics (always on) ────────────────────────────────── */
const initBasics = () => {
  const btn = qs('#copyEmail');
  if (btn) btn.addEventListener('click', async () => {
    const em = btn.dataset.email;
    try { await navigator.clipboard.writeText(em); }
    catch { const t = document.createElement('textarea'); t.value = em; document.body.appendChild(t); t.select(); document.execCommand('copy'); t.remove(); }
    toast('EMAIL COPIED — حُفِظَتِ الرِّسالة');
  });
  const stamp = qs('.footer__stamp');
  if (stamp) {
    stamp.style.cursor = 'pointer';
    let ck = 0, ct;
    stamp.addEventListener('click', () => {
      ck++; clearTimeout(ct); ct = setTimeout(() => ck = 0, 900);
      if (ck >= 3) { ck = 0; toast('THE SEAL APPROVES — الخاتمُ يوافق · +20 WISDOM'); flash(); }
    });
  }
  const flash = () => {
    const f = document.createElement('div');
    f.className = 'flash'; document.body.appendChild(f);
    setTimeout(() => f.remove(), 900);
    f.animate([{ opacity: 0 }, { opacity: .55 }, { opacity: 0 }], { duration: 850, easing: 'ease-out' });
  };
};

/* ═══════════════════════════════════════════════════════
   MODE SELECT
   ═══════════════════════════════════════════════════════ */
const runFull = typeof window.gsap !== 'undefined' && typeof window.ScrollTrigger !== 'undefined' && !reduced;

if (!runFull) {
  doc.classList.add('no-lib');
  const loader = qs('#loader');
  if (loader) loader.classList.add('is-done');
  initBasics();
  const io = new IntersectionObserver(es => es.forEach(x => { if (x.isIntersecting) x.target.classList.add('is-in'); }), { threshold: .25 });
  qsa('.folio-head,.lrow,.stat').forEach(c => io.observe(c));
  qsa('.stat__n').forEach(el => { el.textContent = el.dataset.count + (el.dataset.suffix || ''); });
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

/* ── lenis (light & floaty) ────────────────────────────── */
const lenis = new Lenis({ duration: 1.05, smoothWheel: true, lerp: 0.09 });
lenis.on('scroll', ScrollTrigger.update);
gsap.ticker.add(t => lenis.raf(t * 1000));
gsap.ticker.lagSmoothing(0);

/* ── velocity skew (subtle) ────────────────────────────── */
(() => {
  const targets = qsa('.folio-title, .case, .fig, .summon__title');
  if (!targets.length) return;
  const setters = targets.map(el => gsap.quickTo(el, 'skewY', { duration: .5, ease: 'power3.out' }));
  let v = 0;
  lenis.on('scroll', ({ velocity }) => { v = velocity; });
  gsap.ticker.add(() => {
    const skew = gsap.utils.clamp(-1.1, 1.1, v * 0.045);
    setters.forEach(set => set(skew));
    v *= 0.92;
  });
})();

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
    rx += (x - rx) * .18; ry += (y - ry) * .18;
    ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
    requestAnimationFrame(follow);
  };
  follow();
  document.addEventListener('pointerover', e => {
    if (e.target.closest('a,button,.lrow,.seal,.clink')) cur.classList.add('is-link');
  });
  document.addEventListener('pointerout', e => {
    if (e.target.closest('a,button,.lrow,.seal,.clink')) cur.classList.remove('is-link');
  });
  const figs = qsa('.fig');
  figs.forEach(f => {
    const isLive = (f.querySelector('.fig__img')?.src || '').includes('.gif');
    f.addEventListener('pointerenter', () => { cur.classList.add('is-view'); label.textContent = isLive ? 'LIVE · حيّ' : 'FIG · شكل'; });
    f.addEventListener('pointerleave', () => { cur.classList.remove('is-view'); });
  });
  qsa('.case__media').forEach(m => {
    m.addEventListener('pointerenter', () => { cur.classList.add('is-view'); label.textContent = 'FILE · ملف'; });
    m.addEventListener('pointerleave', () => { cur.classList.remove('is-view'); });
  });
}

/* ── loader (fast) ─────────────────────────────────────── */
const runLoader = done => {
  const loader = qs('#loader');
  if (!loader) return done();
  const num = qs('.ld__num'), ar = qs('.ld__ar'), rule = qs('.ld__rule i');
  const st = { v: 0 };
  const tl = gsap.timeline({ onComplete: () => { loader.classList.add('is-done'); done(); } });
  tl.to(rule, { scaleX: 1, duration: 1.05, ease: 'power2.inOut' }, 0)
    .to(st, {
      v: 100, duration: 1.05, ease: 'power2.inOut',
      onUpdate: () => {
        const v = Math.round(st.v);
        num.textContent = String(v).padStart(2, '0');
        ar.textContent = arNum(v).padStart(2, '٠');
      }
    }, 0)
    .to({}, { duration: .18 });
  loader.addEventListener('click', () => tl.progress(1), { once: true });
  const skip = qs('#loaderSkip');
  if (skip) skip.addEventListener('click', () => tl.progress(1), { once: true });
};

/* ── hero intro ────────────────────────────────────────── */
const heroIntro = () => {
  const line = qs('#heroLine');
  if (line) {
    const len = line.getTotalLength();
    line.style.strokeDasharray = len;
    line.style.strokeDashoffset = len;
  }
  const tl = gsap.timeline({ defaults: { ease: 'power4.out' } });
  tl.fromTo('.hero__kicker', { y: -14, opacity: 0 }, { y: 0, opacity: 1, duration: .7 }, 0)
    .fromTo('.hero__name .ch', { y: 0, yPercent: 118, rotate: 5 }, { yPercent: 0, rotate: 0, duration: 1.05, stagger: .028 }, .12)
    .fromTo('.hero__paper', { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'power2.out' }, .3)
    .fromTo('.hc__target', { opacity: 0 }, { opacity: 1, duration: .6 }, .5)
    .fromTo('.hc__line', { strokeDashoffset: (i, t) => t.getTotalLength() }, { strokeDashoffset: 0, duration: 1.6, ease: 'power2.inOut' }, .55)
    .fromTo('.hc__area', { opacity: 0 }, { opacity: 1, duration: 1 }, 1.1)
    .fromTo('.hc__dot', { scale: 0, transformOrigin: 'center' }, { scale: 1, duration: .5, stagger: .07, ease: 'back.out(2.2)' }, .95)
    .fromTo('.hc__pulse', { opacity: 0 }, { opacity: 1, duration: .4 }, 1.9)
    .fromTo('.hc__note', { opacity: 0, y: 10 }, { opacity: 1, y: 0, duration: .6, stagger: .12, ease: 'power3.out' }, 1.25)
    .fromTo('.hero__subrow', { y: 26, opacity: 0 }, { y: 0, opacity: 1, duration: .9 }, .78)
    .fromTo('.hn-dot', { scale: 0 }, { scale: 1, duration: .5, ease: 'back.out(3)' }, 1.15)
    .fromTo('.hero__meta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, .92)
    .fromTo('.hero__cta', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: .8 }, 1.04)
    .fromTo('.hero__scroll', { opacity: 0 }, { opacity: 1, duration: .7 }, 1.3);
};

runLoader(heroIntro);

/* ── rosetta scramble ──────────────────────────────────── */
(() => {
  const el = qs('#rosettaText');
  if (!el) return;
  const phrases = [
    'I map the work before I model the data.',
    'أرسمُ العملَ قبل أن أنمذجَ البيانات.',
    'capture → clean → model → weigh → decide',
    'البياناتُ لا تكذب — لكنها تحتاجُ من يفكَّ رموزها.',
    '10,000+ orders. One decision.',
    'لا أُدخِلُ البيانات — أنا مَن يزِنُها ويُخزِّنُها ويُحلِّلُها.',
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
      if (reveal <= to.length) setTimeout(tick, 24);
      else el.textContent = to;
    };
    tick();
  };
  setInterval(() => { pi = (pi + 1) % phrases.length; scramble(phrases[pi]); }, 4300);
})();

/* ── generic reveals ───────────────────────────────────── */
qsa('.r-fade, .r-rise').forEach(el => {
  gsap.fromTo(el, { y: el.classList.contains('r-rise') ? 34 : 24, opacity: 0 }, {
    y: 0, opacity: 1, duration: .95, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 88%' }
  });
});

/* copy blocks reveal */
qsa([
  '.sec__intro',
  '.analyst__copy .lead',
  '.analyst__copy p:not(.lead)',
  '.plat__badge', '.plat__title', '.plat__ar', '.plat__desc', '.plat__chips',
  '.plat-notes > *', '.plat-side__x', '.plat-foot__x', '.plat-foot .btn',
  '.summon__ar', '.summon__x', '.summon__pin',
  '.seals__t', '.footer > *'
].join(', ')).forEach(el => {
  gsap.fromTo(el, { y: 26, opacity: 0 }, {
    y: 0, opacity: 1, duration: .9, ease: 'power3.out',
    scrollTrigger: { trigger: el, start: 'top 90%' }
  });
});

/* folio heads */
qsa('.folio-head').forEach(h => {
  ScrollTrigger.create({ trigger: h, start: 'top 82%', once: true, onEnter: () => h.classList.add('is-in') });
  gsap.fromTo(h.querySelectorAll('.fw'), { y: 0, yPercent: 112 }, {
    yPercent: 0, duration: 1, stagger: .07, ease: 'power4.out',
    scrollTrigger: { trigger: h, start: 'top 82%' }
  });
  gsap.fromTo(h.querySelector('.folio-no'), { y: 0, yPercent: 40, opacity: 0 }, {
    yPercent: 0, opacity: 1, duration: 1.1, ease: 'power3.out',
    scrollTrigger: { trigger: h, start: 'top 82%' }
  });
});

/* ── portrait ──────────────────────────────────────────── */
(() => {
  const cur = qs('.portrait__curtain'), img = qs('.portrait__img');
  if (!cur) return;
  const tl = gsap.timeline({ scrollTrigger: { trigger: '.portrait', start: 'top 78%', once: true } });
  tl.to(cur, { scaleY: 0, duration: 1.05, ease: 'power4.inOut' })
    .fromTo(img, { scale: 1.22 }, { scale: 1.06, duration: 1.5, ease: 'power3.out' }, .15);
  gsap.to('.portrait__frame', {
    y: -46, ease: 'none',
    scrollTrigger: { trigger: '.analyst', start: 'top bottom', end: 'bottom top', scrub: .6 }
  });
})();

/* ── stats ─────────────────────────────────────────────── */
qsa('.stat__n').forEach(el => {
  const target = +el.dataset.count, suf = el.dataset.suffix || '';
  ScrollTrigger.create({
    trigger: el, start: 'top 90%', once: true,
    onEnter: () => {
      const o = { v: 0 };
      gsap.to(o, { v: target, duration: 1.6, ease: 'power2.out', onUpdate: () => el.textContent = Math.round(o.v) + suf });
    }
  });
});
qsa('.stat').forEach(s => {
  ScrollTrigger.create({ trigger: s, start: 'top 90%', once: true, onEnter: () => s.classList.add('is-in') });
});

/* ── ledger rows ───────────────────────────────────────── */
qsa('.lrow').forEach((r, i) => {
  gsap.fromTo(r, { y: 22, opacity: 0 }, {
    y: 0, opacity: 1, duration: .7, ease: 'power3.out',
    scrollTrigger: { trigger: r, start: 'top 92%' }
  });
  ScrollTrigger.create({ trigger: r, start: 'top 90%', once: true, onEnter: () => r.classList.add('is-in') });
});

/* ── figures: curtain + parallax ───────────────────────── */
qsa('.fig').forEach(f => {
  const cur = f.querySelector('.fig__curtain'), img = f.querySelector('.fig__img');
  if (cur) {
    const tl = gsap.timeline({ scrollTrigger: { trigger: f, start: 'top 82%', once: true } });
    tl.to(cur, { scaleX: 0, duration: 1.1, ease: 'power4.inOut' })
      .fromTo(img, { scale: 1.14 }, { scale: 1.02, duration: 1.5, ease: 'power3.out' }, .1);
  }
  gsap.to(f, {
    y: -26, ease: 'none',
    scrollTrigger: { trigger: f, start: 'top bottom', end: 'bottom top', scrub: .8 }
  });
});

/* ── case stack ────────────────────────────────────────── */
(() => {
  const cases = qsa('.case');
  cases.forEach((c, i) => {
    const cur = c.querySelector('.case__curtain');
    if (cur) {
      gsap.to(cur, {
        scaleX: 0, duration: 1.05, ease: 'power4.inOut',
        scrollTrigger: { trigger: c, start: 'top 80%', once: true }
      });
    }
    const scale = c.querySelector('.case__scale');
    if (scale) {
      gsap.fromTo(scale, { yPercent: -4 }, {
        yPercent: 4, ease: 'none',
        scrollTrigger: { trigger: c, start: 'top bottom', end: 'bottom top', scrub: .7 }
      });
    }
    /* card shrink as next one covers it */
    const next = cases[i + 1];
    if (next) {
      gsap.to(c, {
        scale: .935, transformOrigin: 'center top', ease: 'none',
        scrollTrigger: { trigger: next, start: 'top bottom', end: 'top top+=120', scrub: true }
      });
    }
  });
  gsap.from('.case', {
    y: 60, opacity: 0, duration: .9, stagger: .08, ease: 'power3.out',
    scrollTrigger: { trigger: '.stack', start: 'top 74%' }
  });
})();

/* ── record ────────────────────────────────────────────── */
(() => {
  const fill = qs('.rec__margin');
  if (fill) {
    const st = { p: 0 };
    gsap.to(st, {
      p: 1, ease: 'none',
      scrollTrigger: { trigger: '.rec', start: 'top 72%', end: 'bottom 62%', scrub: .5 },
      onUpdate: () => fill.style.setProperty('--fy', st.p.toFixed(4))
    });
  }
  qsa('.rec__row').forEach(r => {
    gsap.fromTo(r, { y: 30, opacity: 0 }, {
      y: 0, opacity: 1, duration: .85, ease: 'power3.out',
      scrollTrigger: { trigger: r, start: 'top 88%' }
    });
  });
})();

/* ── seals ─────────────────────────────────────────────── */
qsa('.seal').forEach(s => {
  gsap.fromTo(s, { y: 24, opacity: 0 }, {
    y: 0, opacity: 1, duration: .8, ease: 'power3.out',
    scrollTrigger: { trigger: s, start: 'top 92%' }
  });
  const circ = s.querySelector('.seal__circ');
  if (circ) {
    const len = 2 * Math.PI * 56;
    gsap.fromTo(circ, { strokeDasharray: `${len}`, strokeDashoffset: len }, {
      strokeDashoffset: 0, duration: 1.4, ease: 'power2.inOut',
      scrollTrigger: { trigger: s, start: 'top 88%' }
    });
  }
});

/* ── contact ───────────────────────────────────────────── */
gsap.fromTo('.summon__title .ch, .summon__l2 .ch', { y: 0, yPercent: 115 }, {
  yPercent: 0, duration: 1.05, stagger: .03, ease: 'power4.out',
  scrollTrigger: { trigger: '.summon', start: 'top 74%' }
});
qsa('.clink').forEach((c, i) => {
  gsap.fromTo(c, { y: 26, opacity: 0 }, {
    y: 0, opacity: 1, duration: .8, delay: i * .05, ease: 'power3.out',
    scrollTrigger: { trigger: '.summon__grid', start: 'top 82%' }
  });
});

/* ── hero scroll behaviour ─────────────────────────────── */
gsap.to('.hero__inner', {
  y: -60, opacity: .25, ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .5 }
});
gsap.to('.hero__curve', {
  y: -60, ease: 'none',
  scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: .8 }
});
qsa('.hc__note').forEach(n => {
  const d = +(n.dataset.depth || .4);
  gsap.to(n, {
    y: () => -40 * d, opacity: .25, ease: 'none',
    scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 1 }
  });
});

/* ── rail ──────────────────────────────────────────────── */
ScrollTrigger.create({
  start: 0, end: 'max',
  onUpdate: self => { const p = qs('#railProg'); if (p) p.style.transform = `scaleY(${self.progress})`; }
});
(() => {
  const secs = ['#hero', '#analyst', '#instruments', '#platform', '#cases', '#record', '#contact'];
  const btns = qsa('.rail__btn');
  const io = new IntersectionObserver(es => es.forEach(x => {
    if (x.isIntersecting) {
      const i = secs.indexOf('#' + x.target.id);
      btns.forEach((b, j) => b.classList.toggle('is-on', j === i));
    }
  }), { rootMargin: '-45% 0px -45% 0px' });
  secs.forEach(s => { const el = qs(s); if (el) io.observe(el); });
})();

/* ── anchors ───────────────────────────────────────────── */
qsa('a[href^="#"], a[data-scroll]').forEach(a => {
  a.addEventListener('click', e => {
    const id = a.getAttribute('href');
    if (!id || !id.startsWith('#')) return;
    const el = qs(id);
    if (!el) return;
    e.preventDefault();
    lenis.scrollTo(el, { duration: 1.4 });
  });
});
qs('#toTop')?.addEventListener('click', () => lenis.scrollTo(0, { duration: 1.6 }));

/* ── basics in full mode too ───────────────────────────── */
initBasics();

/* ── refresh ───────────────────────────────────────────── */
if (document.fonts && document.fonts.ready) document.fonts.ready.then(() => ScrollTrigger.refresh());
addEventListener('load', () => ScrollTrigger.refresh());

})();
