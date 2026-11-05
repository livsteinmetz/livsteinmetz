import { chromium } from 'playwright';
import http from 'node:http'; import fs from 'node:fs'; import path from 'node:path';
const t={'.html':'text/html','.css':'text/css','.js':'text/javascript','.svg':'image/svg+xml','.webp':'image/webp','.json':'application/json'};
http.createServer((q,r)=>{let p=decodeURIComponent(q.url.split('?')[0]);if(p=='/')p='/index';let f='build'+p;if(!path.extname(f))f+='.html';if(!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':t[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)}).listen(4177);
const b=await chromium.launch(); fs.mkdirSync('shots',{recursive:true});
for (const [n,w,h] of [['d',1440,900],['m',390,844]]) { const g=await b.newPage({viewport:{width:w,height:h}}); g.on('pageerror',e=>console.log('ERR',e.message));
 for (const [k,u] of [['home','/'],['vxp','/work/visual-experience-platform'],['note','/notes'],['bass','/bass']]) { await g.goto('http://localhost:4177'+u); await g.evaluate(()=>document.querySelectorAll('.shelf').forEach(s=>s.scrollLeft=0)); await g.mouse.wheel(0,600); await g.waitForTimeout(2500); await g.evaluate(()=>document.querySelector('[data-viewer]')?.scrollIntoView()); await g.waitForTimeout(3500); await g.evaluate(()=>scrollTo(0,0)); await g.screenshot({path:`shots/${n}-${k}.png`,fullPage:true}); console.log(n,k,await g.evaluate(()=>document.documentElement.scrollWidth-innerWidth)); }
 if(n=='d'){await g.goto('http://localhost:4177/'); await g.waitForTimeout(800); const s=await g.$$('.shelf'); let i=0; for(const sh of s){ for(const x of [0,1000]){ await sh.evaluate((e,x)=>e.scrollLeft=x,x); await sh.scrollIntoViewIfNeeded(); await g.waitForTimeout(2500); await sh.screenshot({path:`shots/shelf${i}-${x}.png`}); } i++; } }
}
{ const g=await b.newPage({viewport:{width:1440,height:900}}); await g.goto('http://localhost:4177/'); await g.addStyleTag({content:'.ctitle,.ctag{color:transparent!important}'}); const cs=await g.$$('.shelf .cover'); const meta=[]; let i=0;
 for(const c of cs){ await c.scrollIntoViewIfNeeded(); await g.waitForTimeout(1600); await c.screenshot({path:`shots/cov${i}.png`}); meta.push(await c.evaluate(e=>{const o=e.getBoundingClientRect();const r=x=>{const b=x.getBoundingClientRect();return [b.left-o.left,b.top-o.top,b.width,b.height]};const cs=[...e.querySelectorAll('.ctitle,.ctag')];return {label:e.getAttribute('aria-label').slice(0,30),art:e.classList.contains('has-art'),t:cs.map(r),s:[o.width,o.height]}})); i++; }
 fs.writeFileSync('shots/covers.json',JSON.stringify(meta)); }
await b.close(); process.exit(0);
