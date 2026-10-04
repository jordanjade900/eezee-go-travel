import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const base=process.env.TEST_URL||'https://eezee-go-travel.netlify.app/';
const routes=['','about/','services/','travel-services/','group-trips/','visa-assistance/','passport-renewals/','contact/','privacy/'];
const results=[],errors=[];
await mkdir('docs/screenshots/deployment',{recursive:true});
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage({reducedMotion:'reduce',viewport:{width:390,height:844}});
 page.on('pageerror',e=>errors.push(e.message));
 for(const route of routes){
  const response=await page.goto(new URL(route,base).href,{waitUntil:'networkidle'});assert.equal(response.status(),200,route+' route status');
  await page.evaluate(async()=>{for(const img of document.querySelectorAll('img[loading="lazy"]')){img.scrollIntoView();await img.decode();}for(const reel of document.querySelectorAll('.destination-track'))reel.scrollLeft=0;await document.fonts.ready;scrollTo({top:0,behavior:'instant'});});
  const result=await page.evaluate(()=>({canonical:document.querySelector('link[rel="canonical"]').href,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,broken:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src)}));
  assert.equal(result.canonical,new URL(route,base).href);assert.equal(result.overflow,false);assert.equal(result.h1,1);assert.deepEqual(result.broken,[]);results.push({route:route||'home',...result});
 }
 await page.goto(new URL('contact/?service=Group+trips&destination=Jamaica&trip=benta-river-falls',base).href,{waitUntil:'networkidle'});assert((await page.locator('#c-service-trigger').innerText()).includes('Group trips'));
 await page.goto(base,{waitUntil:'networkidle'});assert((await page.locator('.hero').evaluate(e=>getComputedStyle(e).backgroundImage)).includes('hero-realistic-v2-960.webp'));await page.locator('#service-trigger').click();await page.getByRole('option',{name:'Corporate travel',exact:true}).click();await page.locator('.search-button').click();assert.equal(await page.locator('#summary-service').innerText(),'Corporate travel');await page.keyboard.press('Escape');
 await page.locator('.hero').screenshot({path:'docs/screenshots/deployment/hero-mobile.png'});await page.setViewportSize({width:1440,height:1000});await page.goto(base,{waitUntil:'networkidle'});await page.locator('.hero').screenshot({path:'docs/screenshots/deployment/hero-desktop.png'});
 const missing=await page.goto(new URL('missing/nested-page/',base).href,{waitUntil:'networkidle'});assert.equal(missing.status(),404);const css=await page.locator('link[rel="stylesheet"]').getAttribute('href');assert(css.startsWith('/'),'nested 404 uses a root stylesheet');assert.equal((await page.request.get(new URL(css,base).href)).status(),200);
 assert.equal((await page.request.get(new URL('sitemap.xml',base).href)).status(),200);assert.equal((await page.request.get(new URL('robots.txt',base).href)).status(),200);
 assert.deepEqual(errors,[]);await writeFile('docs/deployment-checks.json',JSON.stringify({passed:true,base,results,contactPrefill:true,heroEnquiry:true,nested404:true,errors},null,2));console.log('Live deployment passed: nine routes, images, metadata, responsive hero, enquiry controls, contact prefill and nested 404.');
}finally{await browser.close();}
