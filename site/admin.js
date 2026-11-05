// /admin: sign in with Google, then choose what shows on the home page. The
// Firestore rules decide who can save, so nothing here is a secret.
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-app.js';
import { getAuth, GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js';
import { doc, getDoc, getFirestore, setDoc } from 'https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js';

const app = initializeApp({
  apiKey: 'AIzaSyAuAgrSYSQl90t335zyZAWSAHY7FyqYPZs',
  authDomain: 'livsteinmetz-bb868.firebaseapp.com',
  projectId: 'livsteinmetz-bb868',
  appId: '1:823349684883:web:7057865e07bc2fb0cebb66',
});
const auth = getAuth(app);
const ref = doc(getFirestore(app), 'site', 'settings');
const $ = (id) => document.getElementById(id);
const sections = JSON.parse($('items').textContent);
const status = (text) => { $('status').textContent = text; };
const idFrom = (link) => link.trim().match(/playlist\/([A-Za-z0-9]+)/)?.[1] || link.trim();

const addPlaylistRow = (p = { title: '', id: '' }) => {
  const row = document.createElement('p');
  row.className = 'row';
  row.innerHTML = '<input aria-label="Playlist name" placeholder="Name"><input aria-label="Spotify link" placeholder="Spotify link"><button type="button">Remove</button>';
  const [title, link, remove] = row.children;
  title.value = p.title;
  link.value = p.id;
  remove.onclick = () => row.remove();
  $('playlists').append(row);
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
  $('listening').value = settings.listening;
  $('playlists').replaceChildren();
  settings.playlists.forEach(addPlaylistRow);
};

$('add').onclick = () => addPlaylistRow();
$('in').onclick = () => signInWithPopup(auth, new GoogleAuthProvider()).catch((e) => status(`Sign-in failed: ${e.code}`));
$('out').onclick = () => signOut(auth);

$('save').onclick = async () => {
  const settings = {
    hidden: [...document.querySelectorAll('[data-key]')].filter((b) => !b.checked).map((b) => b.dataset.key),
    listening: idFrom($('listening').value),
    playlists: [...$('playlists').children].map((r) => ({ title: r.children[0].value.trim(), id: idFrom(r.children[1].value) })).filter((p) => p.id),
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
});
