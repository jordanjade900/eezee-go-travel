import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile,readFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const routes=['','about','services','travel-services','group-trips','visa-assistance','passport-renewals','contact','privacy'];
const errors=[],results=[],art=new Map();
await mkdir('docs/screenshots/atelier',{recursive:true});
try{
 const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 for(const width of [320,390,768,820,1024,1440]){await page.setViewportSize({width,height:900});for(const route of routes){
  await page.goto(`http://127.0.0.1:4173/${route?route+'/':''}`,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{for(const image of document.querySelectorAll('img[loading="lazy"]')){image.scrollIntoView();await image.decode();}for(const track of document.querySelectorAll('.destination-track'))track.scrollLeft=0;await document.fonts.ready;scrollTo({top:0,behavior:'instant'});});
  const result=await page.evaluate(({width,route})=>({route:route||'home',width,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),height:document.documentElement.scrollHeight,assets:[...document.querySelectorAll('main img')].filter(i=>!i.src.includes('/icons/')).map(i=>i.getAttribute('src')?.split('/').pop())}),{width,route});
  results.push(result);assert.equal(result.overflow,false,`${route} overflow at ${width}`);assert.equal(result.h1,1);assert.deepEqual(result.broken,[]);
  if(width===1440)for(const asset of result.assets){if(!asset||asset.includes('hero-background')||asset.includes('logo'))continue;const other=art.get(asset);assert(!other||other===route,`${asset} reused on ${other} and ${route}`);art.set(asset,route);}
  if([390,1440].includes(width))await page.screenshot({path:`docs/screenshots/atelier/${route||'home'}-${width}.png`,fullPage:true});
 }}
 await page.goto('http://127.0.0.1:4173/about/');const active=page.locator('.page-nav a[aria-current="page"]');await active.hover();assert.equal(await active.evaluate(e=>getComputedStyle(e).textDecorationLine),'none');assert.equal(await active.evaluate(e=>getComputedStyle(e,'::after').backgroundColor),'rgb(255, 98, 103)');
 await page.goto('http://127.0.0.1:4173/group-trips/');const track=page.locator('.destination-track');const before=await track.evaluate(e=>e.scrollLeft);await page.getByRole('button',{name:'Next destinations'}).click();await page.waitForTimeout(300);assert(await track.evaluate(e=>e.scrollLeft)>before);assert.equal(await page.locator('.local-trip').count(),3);
 await page.goto('http://127.0.0.1:4173/services/');assert.equal(await page.locator('.service-directory h3').count(),8);const graph=await page.locator('script[type="application/ld+json"]').evaluate(e=>JSON.parse(e.textContent)['@graph']);assert.equal(graph.find(e=>e['@type']==='ItemList').itemListElement.length,8);
 const normal=await browser.newPage({viewport:{width:1440,height:1000}});normal.on('pageerror',e=>errors.push(e.message));await normal.goto('http://127.0.0.1:4173/services/',{waitUntil:'networkidle'});await normal.bringToFront();await normal.waitForTimeout(1800);assert(await normal.evaluate(()=>Boolean(window.gsap&&window.ScrollTrigger)));await normal.locator('[data-globe]').scrollIntoViewIfNeeded();await normal.waitForTimeout(1600);const globe=await normal.locator('[data-globe]').evaluate(e=>({canvas:!!e.querySelector('canvas'),ready:e.classList.contains('globe-ready'),fallback:e.dataset.fallback||false,drawCalls:Number(e.dataset.draws||0)}));assert(globe.canvas&&globe.ready&&!globe.fallback&&globe.drawCalls>0,'Three.js illustration actually renders');await normal.screenshot({path:'docs/screenshots/atelier/services-motion-1440.png'});
 await normal.goto('http://127.0.0.1:4173/about/');await normal.waitForTimeout(2100);assert(await normal.locator('.type-word').count()>3);await normal.screenshot({path:'docs/screenshots/atelier/about-motion-1440.png'});
 const nojs=await browser.newPage({javaScriptEnabled:false,viewport:{width:390,height:844}});await nojs.goto('http://127.0.0.1:4173/services/');assert(await nojs.locator('h1').isVisible());assert.equal(await nojs.locator('.service-directory h3').count(),8);assert(await nojs.locator('.globe-fallback').isVisible());
 const baseline=JSON.parse(await readFile('docs/hero-preservation.json','utf8'));const {createHash}=await import('node:crypto');const stylesheet=await readFile('styles.css');assert.equal(createHash('sha256').update(stylesheet).digest('hex'),baseline.stylesheet);
 assert.deepEqual(errors,[]);await writeFile('docs/atelier-checks.json',JSON.stringify({passed:true,results,uniqueMainAssetFamilies:art.size,globe,navRedOnly:true,carousel:true,noJavaScript:true,errors},null,2));console.log(`Atelier checks passed: ${routes.length} pages × 6 widths, unique imagery, motion, WebGL, red navigation, carousel and no-JS.`);
}finally{await browser.close();}
