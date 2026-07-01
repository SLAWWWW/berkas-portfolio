// ---------- reveal: content scrolls up when its section enters ----------
const io = new IntersectionObserver((entries) => {
  entries.forEach((e) => {
    if (e.isIntersecting) {
      e.target.classList.add('visible');
      io.unobserve(e.target);
    }
  });
}, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });

// stagger gallery tiles so they cascade in
document.querySelectorAll('.grid').forEach((grid) => {
  Array.from(grid.children).forEach((child, i) => {
    child.classList.add('reveal');
    child.style.transitionDelay = (i % 4) * 80 + 'ms';
  });
});

document.querySelectorAll('.reveal').forEach((el) => io.observe(el));

// ---------- accordion (home only) ----------
document.querySelectorAll('.acc-head').forEach((head) => {
  head.addEventListener('click', () => {
    const item = head.parentElement;
    const wasOpen = item.classList.contains('open');
    document.querySelectorAll('.acc-item').forEach((i) => i.classList.remove('open'));
    if (!wasOpen) item.classList.add('open');
  });
});

// ---------- buttery inertia smooth scroll (desktop pointer only) ----------
(function () {
  const reduce = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const coarse = matchMedia('(pointer: coarse)').matches;
  if (reduce || coarse) return; // native scrolling on touch / reduced-motion

  // let our rAF loop own the scroll position — turn off the browser's own smoothing
  document.documentElement.style.scrollBehavior = 'auto';

  const EASE = 0.075; // lower = smoother & longer glide
  let target = window.scrollY;
  let current = window.scrollY;
  let rafId = null;

  const maxScroll = () => document.documentElement.scrollHeight - window.innerHeight;
  const clamp = (v) => Math.max(0, Math.min(v, maxScroll()));

  function frame() {
    current += (target - current) * EASE;
    if (Math.abs(target - current) < 0.4) {
      current = target;
      window.scrollTo(0, current);
      rafId = null;
      return;
    }
    window.scrollTo(0, current);
    rafId = requestAnimationFrame(frame);
  }
  function run() { if (rafId === null) rafId = requestAnimationFrame(frame); }

  // intercept vertical wheel; leave horizontal scrollers (the work rail) alone
  window.addEventListener('wheel', (e) => {
    if (e.ctrlKey) return; // pinch-zoom
    let el = e.target;
    while (el && el !== document.body) {
      if (el.scrollWidth > el.clientWidth &&
          getComputedStyle(el).overflowX !== 'visible' &&
          Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        return; // horizontal gesture inside a horizontal scroller
      }
      el = el.parentElement;
    }
    e.preventDefault();
    target = clamp(target + e.deltaY);
    run();
  }, { passive: false });

  // resync when the user scrolls some other way (scrollbar drag, keyboard)
  window.addEventListener('scroll', () => {
    if (rafId === null) { current = target = window.scrollY; }
  }, { passive: true });

  window.addEventListener('resize', () => { target = current = clamp(window.scrollY); });

  // glide to in-page anchors (menu / footer links)
  document.querySelectorAll('a[href^="#"]').forEach((a) => {
    a.addEventListener('click', (e) => {
      const id = a.getAttribute('href');
      if (!id || id.length < 2) return;
      const node = document.querySelector(id);
      if (!node) return;
      e.preventDefault();
      target = clamp(node.getBoundingClientRect().top + window.scrollY);
      run();
    });
  });
})();
