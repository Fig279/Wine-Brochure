import './style.css';

const PANEL_W = 352;
const PANEL_H = 816;
const TURN_MS = 1500;

// Each step: how many panels are visible, and how far to shift the book so they sit centred.
const STEPS = [
  { label: 'Cover',          panels: 1, shift: 0,   prev: null,              next: 'Open the cover' },
  { label: 'Inside flap',    panels: 2, shift: 176, prev: 'Close the cover', next: 'Open the flap' },
  { label: 'Inside spread',  panels: 3, shift: 0,   prev: 'Close the flap',  next: 'Turn it over' },
  { label: 'Outside spread', panels: 3, shift: 0,   prev: 'Turn it back',    next: null },
];

const root = document.documentElement;
const book = document.getElementById('book');
const viewport = document.getElementById('viewport');
const scaler = document.getElementById('scaler');
const prevBtn = document.getElementById('prev');
const nextBtn = document.getElementById('next');
const label = document.getElementById('label');
const dotsEl = document.getElementById('dots');
const leaf1 = book.querySelector('.leaf1');
const leaf3 = book.querySelector('.leaf3');

let step = 0;

// Wrap each turning leaf's faces so the page can bend while it turns.
[leaf1, leaf3].forEach((leaf) => {
  const bend = document.createElement('div');
  bend.className = 'bend';
  [...leaf.children].forEach((c) => bend.appendChild(c));
  leaf.appendChild(bend);
});

// Step indicators (also clickable)
const dots = STEPS.map((s, i) => {
  const d = document.createElement('button');
  d.type = 'button';
  d.className = 'dot';
  d.title = s.label;
  d.setAttribute('aria-label', s.label);
  d.addEventListener('click', () => go(i));
  dotsEl.appendChild(d);
  return d;
});

/* ---------- sizing ---------- */
function fit() {
  const s = STEPS[step];
  const availW = viewport.clientWidth - 48;
  const availH = viewport.clientHeight - 64;
  const k = Math.min(availW / (s.panels * PANEL_W), availH / PANEL_H, 1.6);
  root.style.setProperty('--k', k.toFixed(4));
  root.style.setProperty('--panels', s.panels);
  scaler.style.setProperty('--shift', s.shift);
}

/* If a panel's text would collide with its footer or bottom edge, shrink just that panel's type a touch. */
function fitText() {
  document.querySelectorAll('.face').forEach((face) => {
    face.style.setProperty('--fs', 1);
    const footer = face.querySelector('.footer');
    const padB = parseFloat(getComputedStyle(face).paddingBottom) || 0;
    const limit = footer ? footer.offsetTop - 8 : face.clientHeight - padB;
    const bottom = () => {
      let b = 0;
      for (const c of face.children) {
        if (c === footer || c.classList.contains('bend')) continue;
        if (getComputedStyle(c).position === 'absolute') continue;
        b = Math.max(b, c.offsetTop + c.offsetHeight);
      }
      return b;
    };
    let fs = 1;
    while (bottom() > limit && fs > 0.72) {
      fs -= 0.02;
      face.style.setProperty('--fs', fs.toFixed(2));
    }
  });
}

/* ---------- turning ---------- */
function retrigger(el, cls) {
  el.classList.remove(cls);
  void el.offsetWidth;
  el.classList.add(cls);
  clearTimeout(el._t);
  el._t = setTimeout(() => el.classList.remove(cls), TURN_MS + 200);
}

function animateBetween(from, to) {
  const lo = Math.min(from, to);
  if (lo === 0) retrigger(leaf1, 'turning');
  else if (lo === 1) retrigger(leaf3, 'turning');
  else if (lo === 2) retrigger(book, 'flipping');
}

function render(prev) {
  const s = STEPS[step];
  if (prev !== undefined && prev !== step) animateBetween(prev, step);
  book.dataset.step = step;
  label.textContent = s.label;
  prevBtn.textContent = s.prev ?? 'Close the cover';
  prevBtn.disabled = step === 0;
  nextBtn.textContent = s.next ?? 'All unfolded';
  nextBtn.disabled = step === STEPS.length - 1;
  dots.forEach((d, i) => {
    if (i === step) d.setAttribute('aria-current', 'step');
    else d.removeAttribute('aria-current');
  });
  fit();
}

// Move one fold at a time so the paper always animates in a physically sensible order.
let timer = null;
function go(target) {
  target = Math.max(0, Math.min(STEPS.length - 1, target));
  if (target === step) return;
  clearTimeout(timer);
  const dir = Math.sign(target - step);
  const advance = () => {
    const prev = step;
    step += dir;
    render(prev);
    if (step !== target) timer = setTimeout(advance, TURN_MS * 0.6);
  };
  advance();
}

prevBtn.addEventListener('click', () => go(step - 1));
nextBtn.addEventListener('click', () => go(step + 1));

// Click the paper itself, like a real brochure
scaler.addEventListener('click', (e) => {
  if (e.target.closest('a')) return;
  if (step === 0) go(1);
  else if (step === 1) {
    if (e.target.closest('.leaf3')) go(2);
    else if (e.target.closest('.leaf1')) go(0);
  }
});

// Keyboard
window.addEventListener('keydown', (e) => {
  if (e.key === 'ArrowRight') go(step + 1);
  else if (e.key === 'ArrowLeft') go(step - 1);
  else if (e.key === 'Home') go(0);
  else if (e.key === 'End') go(STEPS.length - 1);
});

// Swipe
let startX = null;
viewport.addEventListener('pointerdown', (e) => { startX = e.clientX; });
viewport.addEventListener('pointerup', (e) => {
  if (startX === null) return;
  const dx = e.clientX - startX;
  startX = null;
  if (Math.abs(dx) > 60) go(step + (dx < 0 ? 1 : -1));
});

window.addEventListener('resize', fit);
render();
(document.fonts?.ready ?? Promise.resolve()).then(fitText);
window.addEventListener('load', fitText);
