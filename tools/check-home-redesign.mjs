import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import fs from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
try{
 const page=await browser.newPage();
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:900});
  await page.goto('http://127.0.0.1:4173',{waitUntil:'networkidle'});
  for(const element of await page.locator('.home-editorial [data-reveal]').all()){
   await element.scrollIntoViewIfNeeded();await page.waitForTimeout(130);
  }
  await page.waitForTimeout(1000);
  assert.equal(await page.locator('.home-editorial [data-reveal]:not(.is-visible)').count(),0,'All sections reveal on scroll');
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No horizontal overflow');
  await page.evaluate(()=>window.scrollTo({top:0,behavior:'instant'}));
  await page.screenshot({path:`docs/screenshots/home-redesign-${width}.png`,fullPage:true});
 }
 await page.emulateMedia({reducedMotion:'reduce'});
 await page.reload({waitUntil:'networkidle'});
 assert(!await page.locator('.home-editorial').evaluate(el=>el.classList.contains('motion-ready')),'Reduced-motion content remains visible');
 const nojs=await browser.newContext({javaScriptEnabled:false});const staticPage=await nojs.newPage();await staticPage.goto('http://127.0.0.1:4173');
 assert.equal(await staticPage.locator('#featured-title').evaluate(el=>getComputedStyle(el).opacity),'1','Content visible without JS');
 assert.deepEqual(errors,[]);
 await fs.writeFile('docs/home-redesign-checks.json',JSON.stringify({scrollReveals:true,reducedMotion:true,noJavaScript:true,mobileNoOverflow:true,errors},null,2));
 console.log('Homepage motion, mobile layout and no-JS fallback passed.');
}finally{await browser.close();}
