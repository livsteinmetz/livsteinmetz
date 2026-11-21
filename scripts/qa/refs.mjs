// Saves full views of Barnes paintings to refs/ so crops can be chosen from real pixels.
import fs from 'fs';
fs.mkdirSync('refs', { recursive: true });
for (const id of process.argv.slice(2)) {
  const r = await fetch(`https://d2r83x5xt28klo.cloudfront.net/tiles/${id}/full/1600,/0/color.jpg`);
  console.log(id, r.status);
  if (r.ok) fs.writeFileSync(`refs/${id}.jpg`, Buffer.from(await r.arrayBuffer()));
}
