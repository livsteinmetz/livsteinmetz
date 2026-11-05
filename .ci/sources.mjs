import { chromium } from 'playwright';
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
const b=await chromium.launch();const g=await b.newPage();
for(const u of ['https://www.artic.edu/iiif/2/50034c7f-ce51-00f1-430e-a6f7efc233fc/1000,1000,1200,1600/600,/0/default.jpg','https://images.metmuseum.org/CRDImages/ep/original/DP346474.jpg','https://openaccess-cdn.clevelandart.org/1942.647/1942.647_full.jpg']){const r=await g.goto(u).catch(e=>({status:()=>e.message.slice(0,50),headers:()=>({})}));console.log('BROWSER',r.status(),r.headers()['content-type'],u.slice(0,70))}
await b.close();process.exit(0);
