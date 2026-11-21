// Saves the quarter-size tiles of Barnes paintings to refs/ so crops can be chosen from real pixels.
import fs from 'fs';
const B = 'https://d2r83x5xt28klo.cloudfront.net/tiles';
for (const id of process.argv.slice(2)) {
  const info = await (await fetch(`${B}/${id}/info.json`)).json();
  const { width: W, height: H } = info, s = 1024;
  fs.mkdirSync(`refs/${id}`, { recursive: true });
  fs.writeFileSync(`refs/${id}/info.json`, JSON.stringify(info));
  for (let y = 0; y < H; y += s) for (let x = 0; x < W; x += s) {
    const w = Math.min(s, W - x), h = Math.min(s, H - y);
    const r = await fetch(`${B}/${id}/${x},${y},${w},${h}/${Math.ceil(w / 4)},/0/color.jpg`);
    if (r.ok) fs.writeFileSync(`refs/${id}/${x}_${y}.jpg`, Buffer.from(await r.arrayBuffer())); else console.log(id, x, y, r.status);
  }
}
