import fs from 'node:fs';
fs.mkdirSync('shots/refs', { recursive: true });
const UA = { headers: { 'User-Agent': 'livsteinmetz-site-build/1.0 (https://livsteinmetz.com)' } };
for (const [name, file] of [['magdalen', 'The_Magdalen_Reading_Rogier_van_der_Weiden.jpg'], ['feminine', "L'Éternel_Féminin,_par_Paul_Cézanne.jpg"]]) {
  const r = await fetch(`https://commons.wikimedia.org/wiki/Special:FilePath/${encodeURIComponent(file)}?width=2400`, UA);
  console.log('peek', name, r.status);
  if (r.ok) fs.writeFileSync(`shots/refs/${name}.jpg`, Buffer.from(await r.arrayBuffer()));
}
