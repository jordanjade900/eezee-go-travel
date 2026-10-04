import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {writeFile,mkdir,readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const routes=['about','services','travel-services','group-trips','visa-assistance','passport-renewals','contact','privacy'];
const browser=await chromium.launch({channel:'chrome'});
const errors=[];const results=[];
try{
 const page=await browser.newPage();page.on('pageerror',e=>errors.push(e.message));
 await mkdir('docs/screenshots/premium',{recursive:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:960});
  for(const route of routes){
   await page.goto(`http://127.0.0.1:4173/${route}/`,{waitUntil:'networkidle'});
   await page.evaluate(()=>document.fonts.ready);
   for(const element of await page.locator('[data-enter]').all()){await element.scrollIntoViewIfNeeded();await page.waitForTimeout(110);}
   await page.waitForTimeout(950);
   assert.equal(await page.locator('[data-enter]:not(.entered)').count(),0,`${route} reveal`);
   assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`${route} overflow`);
   if(route==='contact')assert(await page.locator('#contact-form').evaluate(form=>[...form.querySelectorAll('input,select,textarea')].every(el=>{const a=el.getBoundingClientRect(),b=el.parentElement.getBoundingClientRect();return a.right<=b.right+1&&a.left>=b.left-1;})),'Form controls fit their fields');
   await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
   await page.screenshot({path:`docs/screenshots/premium/${route}-${width}.png`,fullPage:true});
   results.push({route,width,scrollReveal:true,noOverflow:true});
  }
 }
 await page.goto('http://127.0.0.1:4173/visa-assistance/',{waitUntil:'networkidle'});
 await page.locator('summary').first().click();assert(await page.locator('details').first().getAttribute('open')!==null,'FAQ opens');
 await page.emulateMedia({reducedMotion:'reduce'});
 for(const route of routes){await page.goto(`http://127.0.0.1:4173/${route}/`);assert(!await page.locator('.premium-main').evaluate(el=>el.classList.contains('motion-on')),'Reduced motion disables entrance transforms');}
 const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();
 for(const route of routes){await staticPage.goto(`http://127.0.0.1:4173/${route}/`);assert.equal(await staticPage.locator('h1').evaluate(el=>getComputedStyle(el).opacity),'1');assert(!await staticPage.locator('.premium-main').evaluate(el=>el.classList.contains('motion-on')));}
 await page.emulateMedia({reducedMotion:'no-preference'});await page.setViewportSize({width:1440,height:960});await page.goto('http://127.0.0.1:4173/',{waitUntil:'networkidle'});
 await page.locator('.service-entry').nth(1).focus();await page.waitForTimeout(450);assert((await page.locator('.photo-window img').getAttribute('src')).includes('visa-city'),'Keyboard image preview');
 const current=await readFile('index.html','utf8'), baseline=JSON.parse(await readFile('docs/hero-preservation.json','utf8'));
 const hero=s=>s.slice(s.indexOf('<section class="hero"'),s.indexOf('<div class="home-sections home-editorial"'));
 const hash=value=>createHash('sha256').update(value).digest('hex');
 assert.equal(hash(hero(current)),baseline.hero,'Approved hero markup preserved');assert.equal(hash(await readFile('styles.css','utf8')),baseline.stylesheet,'Hero stylesheet preserved');
 assert.deepEqual(errors,[]);await writeFile('docs/premium-checks.json',JSON.stringify({results,faq:true,reducedMotion:true,noJS:true,keyboardPreview:true,heroUnchanged:true,errors},null,2));
 console.log('Premium layout, motion, keyboard preview, FAQ, reduced-motion/no-JS and hero preservation checks passed.');
}finally{await browser.close();}
