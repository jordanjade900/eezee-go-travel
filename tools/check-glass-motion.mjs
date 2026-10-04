import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const base='http://127.0.0.1:4173';
try{
 const page=await browser.newPage({viewport:{width:1440,height:1000}});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await mkdir('docs/screenshots/glass',{recursive:true});
 await page.goto(base,{waitUntil:'domcontentloaded'});
 const sequence=()=>page.evaluate(()=>['.hero','.site-header','.hero-copy h1 span','.trip-search'].map(selector=>({selector,name:getComputedStyle(document.querySelector(selector)).animationName,animations:document.querySelector(selector).getAnimations().length})));
 for(const item of await sequence()){assert.notEqual(item.name,'none');assert(item.animations>0);}
 await page.waitForTimeout(1600);
 assert.equal(await page.locator('.hero').evaluate(el=>getComputedStyle(el).opacity),'1');
 assert.equal(await page.locator('.trip-search').evaluate(el=>getComputedStyle(el).translate),'0px');
 await page.reload({waitUntil:'domcontentloaded'});
 for(const item of await sequence())assert(item.animations>0,'Reload starts a new intro');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const item of await sequence())assert.equal(item.name,'none');
 const media=await page.context().newCDPSession(page);
 await media.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'},{name:'prefers-reduced-transparency',value:'no-preference'}]});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const [route,selector]of [['services','.service-directory'],['group-trips','.local-trips']]){
   await page.goto(`${base}/${route}/`,{waitUntil:'networkidle'});
   await page.locator(selector).scrollIntoViewIfNeeded();
   const surface=page.locator(route==='services'?'.service-directory>div>a':'.local-trip').first();
   assert((await surface.evaluate(el=>getComputedStyle(el).backdropFilter)).includes('blur'));
   await page.locator(selector).screenshot({path:`docs/screenshots/glass/${route}-${width}.png`});
  }
 }
 await media.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'},{name:'prefers-reduced-transparency',value:'reduce'}]});
 assert.equal(await page.locator('.local-trip').first().evaluate(el=>getComputedStyle(el).backdropFilter),'none');
 const fallback=await browser.newContext({javaScriptEnabled:false,reducedMotion:'reduce'});
 const staticPage=await fallback.newPage();await staticPage.goto(base);
 assert(await staticPage.locator('.trip-search').isVisible());assert.equal(await staticPage.locator('.hero').evaluate(el=>getComputedStyle(el).animationName),'none');await fallback.close();
 assert.deepEqual(errors,[]);
 await writeFile('docs/glass-motion-checks.json',JSON.stringify({passed:true,loadAndReloadIntro:true,reducedMotion:true,noJavaScript:true,glassSurfaces:true,errors},null,2));
 console.log('Glass panels, load/reload intro, reduced motion and no-JS checks passed.');
}finally{await browser.close();}
