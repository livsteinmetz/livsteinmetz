// Private data lives in content/private as sealed files. Anyone can seal with the public key;
// only the deploy can open them, with a key derived from a secret it already has.
import { generateKeyPairSync, publicEncrypt, privateDecrypt, randomBytes, createCipheriv, createDecipheriv, createHash, constants } from 'node:crypto';
import { readFileSync, writeFileSync, mkdirSync, readdirSync, existsSync } from 'node:fs';
import { dirname } from 'node:path';

const DIR = 'content/private', PUB = `${DIR}/seal.pub`, KEY = `${DIR}/key.enc`;
const OAEP = { padding: constants.RSA_PKCS1_OAEP_PADDING, oaepHash: 'sha256' };
const seedKey = () => {
  const s = process.env.PRIVATE_SEED;
  if (!s) throw new Error('PRIVATE_SEED is not set');
  return createHash('sha256').update(`livsteinmetz private key:${s}`).digest();
};
const enc = (key, buf) => {
  const iv = randomBytes(12), c = createCipheriv('aes-256-gcm', key, iv);
  const data = Buffer.concat([c.update(buf), c.final()]);
  return { iv: iv.toString('base64'), tag: c.getAuthTag().toString('base64'), data: data.toString('base64') };
};
const dec = (key, o) => {
  const c = createDecipheriv('aes-256-gcm', key, Buffer.from(o.iv, 'base64'));
  c.setAuthTag(Buffer.from(o.tag, 'base64'));
  return Buffer.concat([c.update(Buffer.from(o.data, 'base64')), c.final()]);
};
const seal = (name, buf) => {
  const k = randomBytes(32);
  const body = enc(k, Buffer.from(JSON.stringify({ name, data: buf.toString('base64') })));
  return JSON.stringify({ k: publicEncrypt({ key: readFileSync(PUB, 'utf8'), ...OAEP }, k).toString('base64'), ...body });
};
let pk;
const privateKey = () => (pk ||= dec(seedKey(), JSON.parse(readFileSync(KEY, 'utf8'))).toString());
const open = (text) => {
  const o = JSON.parse(text);
  const k = privateDecrypt({ key: privateKey(), ...OAEP }, Buffer.from(o.k, 'base64'));
  return JSON.parse(dec(k, o).toString());
};
const id = (name) => createHash('sha256').update(name).digest('hex').slice(0, 16);
const out = ({ name, data }) => { mkdirSync(dirname(name), { recursive: true }); writeFileSync(name, Buffer.from(data, 'base64')); };

const [cmd, ...args] = process.argv.slice(2);
if (cmd === 'init') {
  if (existsSync(PUB)) { console.log('keys already exist'); process.exit(0); }
  mkdirSync(DIR, { recursive: true });
  const { publicKey, privateKey: priv } = generateKeyPairSync('rsa', { modulusLength: 3072, publicKeyEncoding: { type: 'spki', format: 'pem' }, privateKeyEncoding: { type: 'pkcs8', format: 'pem' } });
  writeFileSync(PUB, publicKey);
  writeFileSync(KEY, JSON.stringify(enc(seedKey(), Buffer.from(priv))));
} else if (cmd === 'seal') {
  for (const f of args) writeFileSync(`${DIR}/${id(f)}.enc`, seal(f, readFileSync(f)));
} else if (cmd === 'seal-to') {
  const [src, dest, name] = args;
  writeFileSync(dest, seal(name || src, readFileSync(src)));
} else if (cmd === 'open') {
  if (!process.env.PRIVATE_SEED) { console.log('no PRIVATE_SEED, private data stays sealed'); process.exit(0); }
  for (const f of readdirSync(DIR).filter((f) => f.endsWith('.enc') && f !== 'key.enc')) out(open(readFileSync(`${DIR}/${f}`, 'utf8')));
} else if (cmd === 'open-file') {
  out(open(readFileSync(args[0], 'utf8')));
} else {
  console.log('usage: private.mjs init | seal <files> | seal-to <src> <dest> [name] | open | open-file <file>');
}
