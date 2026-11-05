// Temporary source check. Removed before launch.
const j = async (u, o) => { try { const r = await fetch(u, { headers: { 'User-Agent': 'livsteinmetz-site-build', 'content-type': 'application/json' }, ...o }); const t = await r.text(); console.log('HTTP', r.status, r.headers.get('access-control-allow-origin'), u.slice(0, 90)); try { return JSON.parse(t); } catch { console.log(t.slice(0, 200)); return null; } } catch (e) { console.log('FAIL', u.slice(0, 90), e.message); return null; } };
const B = 'https://collection.barnesfoundation.org';
const P = new Set(['4','7','8','10']);
for (const q of ['Postman Van Gogh','The Bedroom Van Gogh','Red Madras Headdress','Card Players Cezanne','The Models Seurat','Le Bonheur de vivre','Rousseau','Soutine','Modigliani','Pippin','Prendergast','Renoir bathers','Cezanne still life','Picasso','Glackens','Courbet','Corot','El Greco','Titian','Daumier']) {
  const body = { from: 0, size: 10, _source: ['id','title','people','invno','objRightsTypeId','imageSecret','imageOriginalSecret'], query: { bool: { must: [{ multi_match: { query: q, fields: ['title^3','people^2'] } }, { exists: { field: 'imageSecret' } }] } } };
  const r = await j(`${B}/api/search`, { method: 'POST', body: JSON.stringify({ body }) });
  for (const h of r?.hits?.hits || []) { const s = h._source; console.log('B', P.has(String(s.objRightsTypeId)) ? 'PD' : 'NO', s.id, s.invno, s.objRightsTypeId, s.people, '|', s.title?.slice(0,50)); }
}
for (const u of ['0,0,1024,1024/256,/0/color.jpg','0,0,4668,6704/400,/0/color.jpg','1000,2000,800,800/400,/0/color.jpg','full/400,/0/color.jpg','full/full/0/color.jpg']) { const r = await fetch('https://d2r83x5xt28klo.cloudfront.net/tiles/6072/'+u); console.log('TILE', r.status, r.headers.get('content-type'), r.headers.get('content-length'), r.headers.get('access-control-allow-origin'), u); }
const info = await j('https://d2r83x5xt28klo.cloudfront.net/tiles/6072/info.json'); console.log(JSON.stringify(info)?.slice(0, 400));
for (const q of ['dark garden night', 'bouquet flowers dark', 'portrait woman red', 'still life', 'nocturne', 'moonlight']) {
  const r = await j(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(q)}&query[term][is_public_domain]=true&limit=6&fields=id,title,artist_title,image_id,thumbnail,date_display`);
  for (const a of r?.data || []) console.log('A', a.id, a.image_id, a.artist_title, '|', a.title, a.date_display, a.thumbnail?.width, a.thumbnail?.height);
}
const c = await j('https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size&titles=File:John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg|File:Amedeo_Modigliani_-_The_Little_Peasant.jpg|File:Sir_John_Everett_Millais_(1829-1896)_-_Ophelia_-_N01506_-_Tate.jpg');
console.log(JSON.stringify(c?.query?.pages)?.slice(0, 900));
const i = await j('https://www.artic.edu/iiif/2/25c31d8d-21a4-9ea1-1d73-6a2eca4dda7e/info.json'); console.log(JSON.stringify(i)?.slice(0, 200));
