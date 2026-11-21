// A playlist as a slowly turning funnel of song titles over a changing color. Tap one to hear its clip.
// Each title has its own row, so titles never overlap however the funnel turns.
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

// Rows from the top of the funnel to its tip. Each row is tall enough for its title at full size.
const BIG = 1.18, SMALL = 0.74;
function layout() {
  const top = $('room-title').getBoundingClientRect().bottom + room.scrollTop + 20;
  let y = top;
  items.forEach((it, k) => {
    it.w = it.b.offsetWidth; it.h = it.b.offsetHeight;
    it.y = y;
    it.angle = k * 2.39996;
    y += it.h * BIG + 4;
  });
  cloud.style.height = `${y + 170}px`;
  draw(performance.now());
}

// The funnel turns slowly and sways a little. Drag sideways to spin it. Pausable, and still for reduced motion.
let moving = !quiet.matches, turn = rnd() * Math.PI * 2, last = performance.now(), drag = null, dragged = false;
function draw(now) {
  const W = room.clientWidth, n = items.length;
  items.forEach((it, k) => {
    const t = n > 1 ? k / (n - 1) : 0;
    const a = it.angle + turn;
    const d = (Math.cos(a) + 1) / 2;
    const sc = SMALL + (BIG - SMALL) * d;
    const cx = W / 2 + W * 0.05 * Math.sin(t * 4 + turn * 0.8);
    const reach = Math.max(0, W / 2 - 12 - (it.w * sc) / 2 - W * 0.05);
    const x = cx + Math.sin(a) * reach * (1 - 0.6 * t) - it.w / 2;
    it.b.style.transform = `translate(${x.toFixed(1)}px, ${it.y.toFixed(1)}px) scale(${sc.toFixed(3)})`;
    it.b.style.zIndex = Math.round(d * 100);
  });
}
room.addEventListener('pointerdown', (e) => {
  if (e.target.closest('.player, .menu, .room-bar')) return;
  drag = { x: e.clientX, turn };
  dragged = false;
});
addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 6) dragged = true;
  if (dragged) { turn = drag.turn + (dx / innerWidth) * Math.PI; draw(performance.now()); }
});
addEventListener('pointerup', () => { drag = null; setTimeout(() => { dragged = false; }, 0); });
addEventListener('pointercancel', () => { drag = null; dragged = false; });
const tick = (now) => {
  const dt = Math.min(64, now - last); last = now;
  if (moving && !drag && !document.hidden) { turn += dt * 0.00018; draw(now); }
  requestAnimationFrame(tick);
};
requestAnimationFrame(tick);
const still = $('still');
const setMotion = (on) => {
  moving = on;
  still.setAttribute('aria-pressed', String(!on));
  still.textContent = on ? 'Pause motion' : 'Play motion';
  room.classList.toggle('paused', !on);
  draw(performance.now());
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
