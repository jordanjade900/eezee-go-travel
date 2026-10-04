import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const errors=[];
try{
 const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:1440,height:1000}});page.on('pageerror',e=>errors.push(e.message));
 await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 const choices=await page.evaluate(()=>Object.fromEntries([...document.querySelectorAll('select')].map(s=>[s.id,[...s.options].map(o=>o.value)])));
 assert.equal(await page.locator('.featured-trip').count(),3);
 assert(await page.locator('.featured-trips').evaluate(e=>e.compareDocumentPosition(document.querySelector('.editorial-services'))&Node.DOCUMENT_POSITION_FOLLOWING));
 await page.goto('http://127.0.0.1:4173/contact/',{waitUntil:'networkidle'});
 for(const [hero,id]of [['service','c-service'],['destination','c-destination']])assert.deepEqual(await page.locator(`#${id}`).evaluate(s=>[...s.options].map(o=>o.value)),choices[hero]);
 await page.goto('http://127.0.0.1:4173/services/',{waitUntil:'networkidle'});
 const graph=await page.locator('script[type="application/ld+json"]').evaluate(s=>JSON.parse(s.textContent)['@graph']);assert.equal(graph.find(n=>n['@type']==='ItemList').itemListElement.length,8);assert.equal(await page.locator('.service-directory h3').count(),8);
 await page.goto('http://127.0.0.1:4173/group-trips/');assert.equal(await page.locator('.local-trip .trip-thumbnail').count(),3);assert((await page.locator('.departure-ribbon').innerText()).includes('Manchester Shopping Centre'));
 await mkdir('docs/screenshots/refinement',{recursive:true});
 const comparisons=[];
 for(const route of ['','about/','services/','group-trips/','travel-services/','visa-assistance/','passport-renewals/','contact/','privacy/']){
  await page.goto(`http://127.0.0.1:4173/${route}`,{waitUntil:'networkidle'});
  const source=await page.locator('h1').evaluate(e=>({font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize,color:getComputedStyle(e).color}));
  await page.goto(`http://127.0.0.1:4184/${route}`,{waitUntil:'networkidle'});
  const built=await page.locator('h1').evaluate(e=>({font:getComputedStyle(e).fontFamily,size:getComputedStyle(e).fontSize,color:getComputedStyle(e).color}));assert.deepEqual(built,source,`${route} production cascade`);assert.equal(await page.locator('link[rel="stylesheet"]').count(),1);
  comparisons.push({route:route||'home',sameCascade:true,bundledStylesheet:true});
 }
 await page.goto('http://127.0.0.1:4184/contact/?service=Corporate+travel&destination=Jamaica');assert((await page.locator('#c-service-trigger').innerText()).includes('Corporate travel'));await page.locator('#c-date-trigger').click();assert(await page.locator('.calendar-popover').isVisible());await page.keyboard.press('Escape');
 await page.goto('http://127.0.0.1:4184/',{waitUntil:'networkidle'});await page.locator('#service-trigger').click();await page.getByRole('option',{name:'Corporate travel',exact:true}).click();await page.locator('.search-button').click();assert.equal(await page.locator('#summary-service').innerText(),'Corporate travel');await page.keyboard.press('Escape');
 for(const route of ['','about/','services/','group-trips/']){
  await page.setViewportSize({width:390,height:844});await page.goto(`http://127.0.0.1:4173/${route}`,{waitUntil:'networkidle'});
  await page.evaluate(async()=>{for(const image of document.querySelectorAll('img[loading="lazy"]')){image.scrollIntoView();await image.decode();}await document.fonts.ready;scrollTo({top:0,behavior:'instant'});});
  await page.screenshot({path:`docs/screenshots/refinement/${route.replace('/','')||'home'}-390.png`,fullPage:true});
 }
 assert.deepEqual(errors,[]);await writeFile('docs/refinement-checks.json',JSON.stringify({passed:true,sharedOptions:true,threeFeaturedTrips:true,serviceSchemaCount:8,comparisons,builtEnquiry:true,errors},null,2));console.log('Shared catalog, trip prominence, service schema and production bundle checks passed.');
}finally{await browser.close();}
