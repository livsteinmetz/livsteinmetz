// Temporary source check. Removed before launch.
const j = async (u, o) => { try { const r = await fetch(u, { headers: { 'User-Agent': 'livsteinmetz-site-build', 'content-type': 'application/json' }, ...o }); const t = await r.text(); console.log('HTTP', r.status, r.headers.get('access-control-allow-origin'), u.slice(0, 90)); try { return JSON.parse(t); } catch { console.log(t.slice(0, 200)); return null; } } catch (e) { console.log('FAIL', u.slice(0, 90), e.message); return null; } };
const B = 'https://collection.barnesfoundation.org';
for (const q of ['Postman', 'Bedroom', 'Red Madras', 'Card Players', 'Models', 'Bathers', 'Henri Rousseau', 'Soutine']) {
  const body = { from: 0, size: 6, _source: ['id','title','people','invno','objRightsTypeId','imageSecret','imageOriginalSecret','width','height'], query: { bool: { must: [{ multi_match: { query: q, fields: ['title^3','people'] } }, { exists: { field: 'imageSecret' } }] } } };
  const r = await j(`${B}/api/search`, { method: 'POST', body: JSON.stringify(body) });
  for (const h of r?.hits?.hits || r?.hits || []) { const s = h._source || h; console.log('B', s.id, s.invno, s.objRightsTypeId, s.people, '|', s.title, '|', s.imageSecret, s.imageOriginalSecret); }
}
const info = await j('https://d2r83x5xt28klo.cloudfront.net/tiles/6072/info.json'); console.log(JSON.stringify(info)?.slice(0, 400));
for (const q of ['dark garden night', 'bouquet flowers dark', 'portrait woman red', 'still life', 'nocturne', 'moonlight']) {
  const r = await j(`https://api.artic.edu/api/v1/artworks/search?q=${encodeURIComponent(q)}&query[term][is_public_domain]=true&limit=6&fields=id,title,artist_title,image_id,thumbnail,date_display`);
  for (const a of r?.data || []) console.log('A', a.id, a.image_id, a.artist_title, '|', a.title, a.date_display, a.thumbnail?.width, a.thumbnail?.height);
}
const c = await j('https://commons.wikimedia.org/w/api.php?action=query&format=json&prop=imageinfo&iiprop=url|size&titles=File:John_Everett_Millais_-_Ophelia_-_Google_Art_Project.jpg|File:Amedeo_Modigliani_-_The_Little_Peasant.jpg|File:Sir_John_Everett_Millais_(1829-1896)_-_Ophelia_-_N01506_-_Tate.jpg');
console.log(JSON.stringify(c?.query?.pages)?.slice(0, 900));
const i = await j('https://www.artic.edu/iiif/2/25c31d8d-21a4-9ea1-1d73-6a2eca4dda7e/info.json'); console.log(JSON.stringify(i)?.slice(0, 200));
