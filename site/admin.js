// /admin: sign in with Google, then choose what shows on the home page. The
// Firestore rules decide who can save, so nothing here is a secret.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { collection, doc, getDoc, getDocs, getFirestore, limit, orderBy, query, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyAuAgrSYSQl90t335zyZAWSAHY7FyqYPZs',
  authDomain: 'livsteinmetz-bb868.firebaseapp.com',
  projectId: 'livsteinmetz-bb868',
  appId: '1:823349684883:web:7057865e07bc2fb0cebb66',
});
const auth = getAuth(app);
const db = getFirestore(app), ref = doc(db, 'site', 'settings');
const $ = (id) => document.getElementById(id);
const sections = JSON.parse($('items').textContent);
const status = (text) => { $('status').textContent = text; };
const mine = JSON.parse($('mine').textContent);

const renderPlaylists = (settings) => {
  const chosen = new Set(settings.playlists.map((p) => p.id || p));
  $('playlists').replaceChildren(...mine.map((p) => {
    const row = document.createElement('div');
    row.className = 'pl';
    row.dataset.title = p.title.toLowerCase();
    row.innerHTML = '<input type="checkbox"><img alt=""><span></span>';
    const [box, img, name] = row.children;
    box.dataset.playlist = p.id;
    box.checked = chosen.has(p.id);
    box.setAttribute('aria-label', `Show ${p.title}`);
    if (p.image) img.src = p.image;
    name.textContent = p.title;
    return row;
  }));
};
$('filter').oninput = (e) => {
  const q = e.target.value.toLowerCase();
  [...$('playlists').children].forEach((r) => { r.hidden = !r.dataset.title.includes(q); });
};

const render = (settings) => {
  const hidden = new Set(settings.hidden);
  $('sections').replaceChildren(...sections.map(({ name, items }) => {
    const set = document.createElement('fieldset');
    const legend = document.createElement('legend');
    legend.textContent = name;
    set.append(legend);
    items.forEach(({ key, label }) => {
      const row = document.createElement('label');
      const box = document.createElement('input');
      box.type = 'checkbox';
      box.dataset.key = key;
      box.checked = !hidden.has(key);
      row.append(box, ` ${label}`);
      set.append(row);
    });
    return set;
  }));
  renderPlaylists(settings);
};

$('in').onclick = () => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => status(`Sign-in failed: ${e.code}`));
$('out').onclick = () => signOut(auth);

$('save').onclick = async () => {
  const settings = {
    hidden: [...document.querySelectorAll('[data-key]')].filter((b) => !b.checked).map((b) => b.dataset.key),
    playlists: [...document.querySelectorAll('[data-playlist]')].filter((b) => b.checked).map((b) => b.dataset.playlist),
  };
  status('Saving');
  try {
    await setDoc(ref, { json: JSON.stringify(settings) });
    status('Saved. Hidden items disappear now. Playlist changes appear after the next morning rebuild.');
  } catch (e) {
    status(e.code === 'permission-denied' ? 'This account can\'t make changes.' : `Couldn't save: ${e.code}`);
  }
};

onAuthStateChanged(auth, async (user) => {
  $('signed-out').hidden = Boolean(user);
  $('panel').hidden = !user;
  if (!user) return;
  const snap = await getDoc(ref).catch(() => null);
  render({ hidden: [], listening: '', playlists: [], ...(snap?.exists() ? JSON.parse(snap.data().json) : {}) });
  try {
    const seen = await getDocs(query(collection(db, 'views'), orderBy('at', 'desc'), limit(200)));
    $('views').innerHTML = seen.docs.map((d) => { const v = d.data(); const li = document.createElement('li'); li.textContent = `${v.email}, ${v.at?.toDate?.().toLocaleString() || ''}`; return li.outerHTML; }).join('') || '<li>No one yet.</li>';
  } catch (e) { $('views').innerHTML = `<li>Couldn't load the list (${e.code}). Check the Firestore rule for views.</li>`; }
});
