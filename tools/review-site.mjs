import {chromium} from 'playwright';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const routes=['','about','services','travel-services','group-trips','visa-assistance','passport-renewals','contact','privacy'];
const results=[],errors=[];
try{
 const page=await browser.newPage({reducedMotion:'reduce'});page.on('pageerror',e=>errors.push(e.message));
 await mkdir('docs/screenshots/self-review',{recursive:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:960});
  for(const route of routes){
   await page.goto(`http://127.0.0.1:4173/${route?route+'/':''}`,{waitUntil:'networkidle'});
   await page.evaluate(async()=>{for(const image of document.querySelectorAll('img[loading="lazy"]')){image.scrollIntoView();await image.decode();}await document.fonts.ready;scrollTo({top:0,behavior:'instant'});});
   results.push(await page.evaluate(({width,route})=>({route:route||'home',width,height:document.documentElement.scrollHeight,overflow:document.documentElement.scrollWidth>innerWidth+1,h1:document.querySelectorAll('h1').length,headings:[...document.querySelectorAll('h2')].map(e=>e.innerText),brokenImages:[...document.images].filter(i=>!i.complete||!i.naturalWidth).map(i=>i.src),enquiryOptions:[...document.querySelectorAll('select')].map(e=>({id:e.id,options:[...e.options].map(o=>o.textContent)})),instagram:Boolean(document.querySelector('.instagram-link'))}),{width,route}));
   await page.screenshot({path:`docs/screenshots/self-review/${route||'home'}-${width}.png`,fullPage:true});
  }
 }
 await writeFile('docs/self-review-checks.json',JSON.stringify({results,errors},null,2));console.log(JSON.stringify({pages:routes.length,viewports:2,overflow:results.filter(r=>r.overflow),brokenImages:results.flatMap(r=>r.brokenImages),errors,mobileHeights:results.filter(r=>r.width===390).map(r=>({route:r.route,height:r.height}))},null,2));
}finally{await browser.close();}
