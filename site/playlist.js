// A playlist as a slowly turning funnel of song titles over a changing color. Tap one to hear its clip.
const $ = (id) => document.getElementById(id);
const room = $('room');
const songs = JSON.parse($('songs').textContent);
const quiet = matchMedia('(prefers-reduced-motion: reduce)');

// Seeded random, so each playlist keeps the same order between visits.
let seed = [...room.dataset.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// Short playlists go around twice so the funnel has some height.
const want = songs.length < 16 ? Math.min(24, songs.length * 2) : songs.length;
const order = Array.from({ length: want }, (_, i) => i).sort(() => rnd() - 0.5);
const items = [];
const cloud = $('cloud');
for (const i of order) {
  const s = songs[i % songs.length];
  const b = document.createElement('button');
  b.type = 'button';
  b.className = `t ${s.t.length > 24 ? 's' : 'm'}`;
  b.textContent = s.t;
  b.setAttribute('aria-label', `${s.t}, ${s.a}`);
  if (i >= songs.length) { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
  b.addEventListener('click', () => { if (!dragged) pick(i % songs.length); });
  cloud.append(b);
  items.push({ b, w: 0, h: 0, y: 0, angle: 0 });
}

// The funnel stays put on screen and the titles rise through it, looping back in at the bottom.
// Each title keeps its own row, at least one title tall, so titles never overlap.
const BIG = 1.18, SMALL = 0.74;
let upper = 0, lower = 0, area = 0, step = 0, L = 0, fade = 0, offset = 0;
const mod = (v, m) => ((v % m) + m) % m;
function layout() {
  upper = $('room-title').getBoundingClientRect().bottom + 12;
  lower = Math.max(upper + 120, document.querySelector('.room-bar').getBoundingClientRect().top - 64);
  area = lower - upper;
  let row = 0;
  items.forEach((it, k) => {
    it.w = it.b.offsetWidth; it.h = it.b.offsetHeight;
    it.angle = k * 2.39996;
    row = Math.max(row, it.h * BIG + 6);
  });
  step = Math.max(row, area / items.length);
  L = step * items.length;
  fade = Math.min(row, area / 4);
  draw();
}

// The funnel turns slowly and sways a little. Drag sideways to spin it, up and down or scroll to move the titles along.
let moving = !quiet.matches, turn = rnd() * Math.PI * 2, last = performance.now(), drag = null, dragged = false;
function draw() {
  if (room.classList.contains('as-list')) return;
  const W = room.clientWidth;
  items.forEach((it, k) => {
    const y = upper + mod(k * step - offset, L);
    const t = Math.min(1, Math.max(0, (y - upper) / area));
    const a = it.angle + turn;
    const d = (Math.cos(a) + 1) / 2;
    const sc = Math.min(SMALL + (BIG - SMALL) * d, (W - 24) / it.w);
    const half = (it.w * sc) / 2;
    const cx = W / 2 + W * 0.05 * Math.sin(t * 4 + turn * 0.8);
    const reach = Math.max(0, W / 2 - 12 - half - W * 0.05);
    const mid = Math.min(W - 12 - half, Math.max(12 + half, cx + Math.sin(a) * reach * (1 - 0.6 * t)));
    const x = mid - it.w / 2;
    const o = Math.min(1, Math.max(0, Math.min(y - upper, lower - y - it.h * sc) / fade));
    it.b.style.transform = `translate(${x.toFixed(1)}px, ${y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    it.b.style.zIndex = Math.round(d * 100);
    it.b.style.opacity = o.toFixed(2);
    it.b.style.visibility = o > 0 ? 'visible' : 'hidden';
  });
}
// Bring a title into the middle of the funnel when it gets keyboard focus.
items.forEach((it, k) => it.b.addEventListener('focus', () => {
  if (room.classList.contains('as-list')) return;
  offset = k * step - area / 2;
  draw();
}));
room.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.player, .menu, .room-bar') || room.classList.contains('as-list')) return;
  drag = { x: e.clientX, y: e.clientY, turn, offset, axis: null };
  dragged = false;
});
addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x, dy = e.clientY - drag.y;
  if (!drag.axis && Math.hypot(dx, dy) > 6) { drag.axis = Math.abs(dx) > Math.abs(dy) ? 'x' : 'y'; dragged = true; }
  if (drag.axis === 'x') $('hint').classList.add('gone');
  if (drag.axis === 'x') turn = drag.turn + (dx / innerWidth) * Math.PI;
  if (drag.axis === 'y') offset = drag.offset - dy;
  if (drag.axis) draw();
});
addEventListener('pointerup', () => { drag = null; setTimeout(() => { dragged = false; }, 0); });
addEventListener('pointercancel', () => { drag = null; dragged = false; });
room.addEventListener('wheel', (e) => {
  if (room.classList.contains('as-list') || e.target.closest('.menu')) return;
  e.preventDefault();
  offset += e.deltaY;
  turn += e.deltaX * 0.004;
  draw();
}, { passive: false });
const tick = (now) => {
  const dt = Math.min(64, now - last); last = now;
  if (moving && !drag && !document.hidden) { turn += dt * 0.00018; offset += dt * 0.018; draw(); }
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);
const still = $('still');
const setMotion = (on) => {
  moving = on;
  still.setAttribute('aria-pressed', String(!on));
  still.textContent = on ? 'Pause motion' : 'Play motion';
  room.classList.toggle('paused', !on);
  draw();
};
still.addEventListener('click', () => setMotion(!moving));
setMotion(moving);

document.fonts.ready.then(layout);
let rt;
addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(layout, 150); });

// The player bar.
const audio = new Audio();
audio.volume = 0.6;
const bar = $('player'), name = $('now'), time = $('time'), fill = $('fill'), toggle = $('toggle'), out = $('out');
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let current = -1;
const mark = (i) => items.forEach((it, j) => it.b.classList.toggle('on', j % songs.length === i));
function pick(i) {
  const s = songs[i];
  if (i === current && s.clip) { audio.paused ? audio.play() : audio.pause(); return; }
  current = i;
  $('hint').classList.add('gone');
  mark(i);
  bar.hidden = false;
  name.textContent = `${s.a} – ${s.t}`;
  out.href = s.apple || s.sp;
  out.textContent = s.apple ? 'Apple Music' : 'Spotify';
  fill.style.width = '0';
  if (s.clip) {
    audio.src = s.clip;
    audio.play().catch(() => {});
    toggle.hidden = false;
    time.textContent = '0:00';
  } else {
    audio.pause();
    toggle.hidden = true;
    time.textContent = 'No clip';
  }
}
audio.addEventListener('timeupdate', () => {
  time.textContent = `${mmss(audio.currentTime)} / ${mmss(audio.duration || 30)}`;
  fill.style.width = `${(audio.currentTime / (audio.duration || 30)) * 100}%`;
});
audio.addEventListener('play', () => { toggle.setAttribute('aria-label', 'Pause'); toggle.dataset.state = 'pause'; });
audio.addEventListener('pause', () => { toggle.setAttribute('aria-label', 'Play'); toggle.dataset.state = 'play'; });
audio.addEventListener('ended', () => {
  // Carry on to the next song that has a clip, the way a playlist would.
  for (let k = 1; k <= songs.length; k++) {
    const j = (current + k) % songs.length;
    if (songs[j].clip) { pick(j); return; }
  }
});
toggle.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
$('close').addEventListener('click', () => { audio.pause(); bar.hidden = true; current = -1; mark(-1); });

// The menu, and the plain list view.
const menu = $('menu'), menuBtn = $('menu-btn');
const closeMenu = () => { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); };
menuBtn.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', String(open));
});
const listBtn = $('show-list');
listBtn.addEventListener('click', () => {
  const on = room.classList.toggle('as-list');
  listBtn.setAttribute('aria-pressed', String(on));
  listBtn.textContent = on ? 'Show as a field' : 'Show as a list';
  if (!on) layout();
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { closeMenu(); menuBtn.focus(); } });
