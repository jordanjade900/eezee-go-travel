import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const base='http://127.0.0.1:4173';
const routes=['','about/','services/','travel-services/','group-trips/','visa-assistance/','passport-renewals/','contact/','privacy/'];
const browser=await chromium.launch({channel:'chrome'});const errors=[],results=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await mkdir('docs/screenshots/polish',{recursive:true});
 const titles=new Set(),canonical=new Set();
 for(const route of routes){
  await page.goto(base+'/'+route,{waitUntil:'networkidle'});
  const metadata=await page.evaluate(()=>({title:document.title,description:document.querySelector('meta[name="description"]')?.content,url:document.querySelector('link[rel="canonical"]')?.href,og:document.querySelector('meta[property="og:image"]')?.content,graph:JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent)['@graph']}));
  assert(metadata.description&&metadata.og);assert(!titles.has(metadata.title));titles.add(metadata.title);assert(!canonical.has(metadata.url));canonical.add(metadata.url);
  assert(metadata.graph.some(n=>n['@type']==='TravelAgency'));assert.equal(await page.locator('h1').count(),1);
  if(route==='visa-assistance/')assert.equal(metadata.graph.find(n=>n['@type']==='FAQPage').mainEntity.length,await page.locator('details').count());
  assert(await page.locator('.back-to-top').isHidden());
  await page.evaluate(()=>scrollTo({top:document.documentElement.scrollHeight,behavior:'instant'}));
  await page.waitForTimeout(300);assert(await page.locator('.back-to-top').isVisible());
  await page.locator('.back-to-top').click();await page.waitForFunction(()=>scrollY<2);assert(await page.locator('.back-to-top').isHidden());
 }
 const crawler=await page.request.get(base+'/robots.txt');assert.equal(crawler.status(),200);assert((await crawler.text()).includes('Sitemap: https://eezeegotravelja.com/sitemap.xml'));
 const sitemap=await page.request.get(base+'/sitemap.xml');assert.equal(sitemap.status(),200);assert.equal((await sitemap.text()).match(/<loc>/g).length,routes.length);
 await page.emulateMedia({reducedMotion:'reduce'});
 const sizes=[[320,568],[360,740],[390,844],[430,932],[600,960],[768,1024],[820,1180],[1024,768],[1440,900],[1920,1080],[2560,1440],[844,390]];
 for(const [width,height]of sizes){
  await page.setViewportSize({width,height});
  for(const route of routes){
   await page.goto(base+'/'+route,{waitUntil:'networkidle'});
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),`${route||'home'} overflow ${width}`);
   if(route===''){
    assert.equal(await page.locator('.flight-decoration').count(),0);
    const boxes=await page.locator('.hero').evaluate(hero=>[...hero.querySelectorAll('h1,.trip-search,.book-button,.menu-toggle')].filter(el=>getComputedStyle(el).display!=='none').map(el=>{const b=el.getBoundingClientRect();return {left:b.left,right:b.right};}));
    assert(boxes.every(b=>b.left>=-1&&b.right<=width+1),`Hero control/headline containment ${width}`);
    assert.equal(await page.locator('.hero-copy h1 span').first().evaluate(el=>getComputedStyle(el).animationName),'none');
   }
   if(route==='contact/')assert(await page.locator('#contact-form').evaluate(form=>[...form.querySelectorAll('input,select,textarea')].every(el=>el.getBoundingClientRect().right<=el.parentElement.getBoundingClientRect().right+1)),'Form controls fit');
  }
  results.push({width,height,routes:routes.length,noOverflow:true});
 }
 await page.setViewportSize({width:390,height:844});await page.goto(base,{waitUntil:'networkidle'});await page.screenshot({path:'docs/screenshots/polish/hero-390.png'});
 await page.evaluate(()=>scrollTo({top:1800,behavior:'instant'}));await page.waitForTimeout(400);await page.locator('.back-to-top').focus();assert.equal(await page.locator('.back-to-top').evaluate(el=>el.getBoundingClientRect().width),48);await page.keyboard.press('Enter');assert(await page.evaluate(()=>scrollY<2));
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1672,height:941});await page.goto(base,{waitUntil:'networkidle'});await page.waitForTimeout(900);await page.screenshot({path:'docs/screenshots/polish/hero-1672.png'});
 await page.locator('[data-book]').click();assert(await page.locator('dialog').isVisible());assert(await page.locator('.back-to-top').isHidden());await page.keyboard.press('Escape');
 assert.deepEqual(errors,[]);await writeFile('docs/polish-checks.json',JSON.stringify({results,uniqueMetadata:true,structuredData:true,crawlFiles:true,backToTopAllPages:true,keyboard:true,reducedMotion:true,heroMotifRemoved:true,errors},null,2));
 console.log('Wide/narrow/landscape layouts, SEO data, crawler endpoints, back-to-top, keyboard and motion checks passed.');
}finally{await browser.close();}
