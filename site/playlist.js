// A playlist as a slowly turning cloud of song titles. Tap one to hear its clip.
const $ = (id) => document.getElementById(id);
const room = $('room');
const songs = JSON.parse($('songs').textContent);
const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

// Seeded random, so each playlist keeps the same arrangement between visits.
let seed = [...room.dataset.id].reduce((h, c) => (h * 31 + c.charCodeAt(0)) >>> 0, 7);
const rnd = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 2 ** 32);

// Short playlists repeat a few titles so the field never looks empty.
const want = Math.max(songs.length, Math.min(60, songs.length * 3));
const items = [];
const cloud = $('cloud');
for (let i = 0; i < want; i++) {
  const s = songs[i % songs.length];
  const b = document.createElement('button');
  b.type = 'button';
  b.className = 't';
  b.textContent = s.t;
  b.setAttribute('aria-label', `${s.t}, ${s.a}`);
  if (i >= songs.length) { b.tabIndex = -1; b.setAttribute('aria-hidden', 'true'); }
  b.addEventListener('click', () => pick(i % songs.length, b));
  cloud.append(b);
  items.push({ b, x: rnd() * 2 - 1, y: rnd() * 2 - 1, z: rnd() * 2 - 1 });
}

let turn = rnd() * Math.PI * 2, last = performance.now(), drag = null;
const place = () => {
  const W = innerWidth, H = innerHeight, c = Math.cos(turn), s = Math.sin(turn);
  for (const it of items) {
    const X = it.x * c + it.z * s, Z = -it.x * s + it.z * c, d = (Z + 1) / 2;
    const k = 0.42 + 0.78 * d;
    it.b.style.transform = `translate(${W / 2 + X * W * 0.5}px, ${H * 0.5 + it.y * H * 0.3}px) translate(-50%, -50%) scale(${k.toFixed(3)})`;
    it.b.style.zIndex = Math.round(d * 100);
    it.b.style.opacity = (0.62 + 0.38 * d).toFixed(2);
  }
};
const tick = (now) => {
  const dt = Math.min(64, now - last); last = now;
  if (!drag && !document.hidden) turn += dt * 0.00005;
  place();
  requestAnimationFrame(tick);
};
if (still) place(); else requestAnimationFrame(tick);
addEventListener('resize', place);

// Drag sideways to turn the cloud by hand.
room.addEventListener('pointerdown', (e) => { if (e.target.closest('.player, .menu, .menu-btn')) return; drag = { x: e.clientX, t: turn, moved: false }; });
addEventListener('pointermove', (e) => {
  if (!drag) return;
  const dx = e.clientX - drag.x;
  if (Math.abs(dx) > 4) drag.moved = true;
  turn = drag.t + dx / innerWidth * Math.PI;
  if (still) place();
});
addEventListener('pointerup', () => { setTimeout(() => { drag = null; }, 0); });
cloud.addEventListener('click', (e) => { if (drag?.moved) { e.stopPropagation(); e.preventDefault(); } }, true);

// The player bar.
const audio = new Audio();
audio.volume = 0.6;
const bar = $('player'), name = $('now'), time = $('time'), fill = $('fill'), toggle = $('toggle'), out = $('out');
const mmss = (t) => `${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, '0')}`;
let current = -1;
const mark = (i) => items.forEach((it, j) => it.b.classList.toggle('on', j % songs.length === i));
function pick(i, b) {
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
  b.blur();
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
    if (songs[j].clip) { pick(j, items[j].b); return; }
  }
});
toggle.addEventListener('click', () => (audio.paused ? audio.play() : audio.pause()));
$('close').addEventListener('click', () => { audio.pause(); bar.hidden = true; current = -1; mark(-1); });

// The menu: other ways in and out of the playlist.
const menu = $('menu'), menuBtn = $('menu-btn');
menuBtn.addEventListener('click', () => {
  const open = menu.hidden;
  menu.hidden = !open;
  menuBtn.setAttribute('aria-expanded', open);
});
$('show-list').addEventListener('click', () => {
  room.classList.toggle('as-list');
  $('show-list').textContent = room.classList.contains('as-list') ? 'Show the cloud' : 'Show as a list';
  menu.hidden = true;
  menuBtn.setAttribute('aria-expanded', 'false');
});
addEventListener('keydown', (e) => { if (e.key === 'Escape' && !menu.hidden) { menu.hidden = true; menuBtn.setAttribute('aria-expanded', 'false'); menuBtn.focus(); } });
