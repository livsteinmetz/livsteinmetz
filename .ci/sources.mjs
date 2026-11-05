const j=async u=>{try{const r=await fetch(u,{headers:{'User-Agent':'livsteinmetz-site-build'}});console.log('HTTP',r.status,u.slice(0,80));return await r.json()}catch(e){console.log('FAIL',u.slice(0,80),e.message)}};
for(const q of ['Odilon Redon flowers','Whistler nocturne','Turner sunset','Gustave Moreau','Bonnard','Vuillard','Ensor','Rossetti','Sargent portrait','Van Gogh irises','Manet','Toulouse-Lautrec','Klimt','Gauguin','Degas dancers','Cassatt','Ryder moonlight','Friedrich']){
 const r=await j(`https://collectionapi.metmuseum.org/public/collection/v1/search?q=${encodeURIComponent(q)}&isPublicDomain=true&hasImages=true&medium=Paintings`);
 for(const id of (r?.objectIDs||[]).slice(0,4)){const o=await j(`https://collectionapi.metmuseum.org/public/collection/v1/objects/${id}`);if(o?.primaryImage)console.log('MET',id,o.isPublicDomain,o.artistDisplayName,'|',o.title.slice(0,50),'|',o.objectDate,'|',o.primaryImage)}
 await new Promise(r=>setTimeout(r,300));
}
for(const q of ['Turner','Redon','Whistler','Van Gogh','Gauguin','Monet','Burne-Jones','Klimt','Hodler','Ensor']){
 const r=await j(`https://openaccess-api.clevelandart.org/api/artworks/?q=${encodeURIComponent(q)}&cc0=1&has_image=1&type=Painting&limit=4`);
 for(const a of r?.data||[]) console.log('CMA',a.id,a.share_license_status,a.creators?.[0]?.description?.slice(0,30),'|',a.title?.slice(0,50),'|',a.images?.full?.width,a.images?.full?.height,a.images?.full?.url);
}
for(const u of ['https://www.artic.edu/iiif/2/50034c7f-ce51-00f1-430e-a6f7efc233fc/1000,1000,1200,1600/600,/0/default.jpg']){const r=await fetch(u,{headers:{'User-Agent':'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/130 Safari/537.36','Accept':'image/avif,image/webp,*/*'}});console.log('BROWSER',r.status,u.slice(0,70))}
process.exit(0);
