import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
const browser=await chromium.launch({channel:'chrome'});
const base='http://127.0.0.1:4173';const results=[];
try{
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await mkdir('docs/screenshots/controls',{recursive:true});
 for(const [width,height]of [[1440,1000],[390,844],[320,568],[844,390]]){
  await page.setViewportSize({width,height});
  for(const [route,ids]of [['',['destination','service','travel-date']],['contact/',['c-service','c-destination','c-date']]]){
   await page.goto(`${base}/${route}`,{waitUntil:'networkidle'});
   if(route)await page.locator('#contact-form').scrollIntoViewIfNeeded();
   for(const id of ids){
    console.log(`Checking ${id} at ${width}x${height}`);
    await page.locator(`#${id}-trigger`).click();await page.waitForTimeout(300);
    const bounds=await page.locator('.control-popover').boundingBox();assert(bounds.x>=0&&bounds.x+bounds.width<=width+1&&bounds.y>=0&&bounds.y+bounds.height<=height+1,`${id} contained ${width}x${height}`);
    if(width===1440||width===390)await page.screenshot({path:`docs/screenshots/controls/${id}-${width}.png`});
    await page.keyboard.press('Escape');assert.equal(await page.locator('.control-popover').count(),0);assert.equal(await page.locator(`#${id}-trigger`).getAttribute('aria-expanded'),'false');
   }
  }
  results.push({width,height,popovers:6,contained:true});
 }
 await page.setViewportSize({width:1440,height:1000});await page.goto(base,{waitUntil:'networkidle'});
 await page.locator('#destination-trigger').focus();await page.keyboard.press('ArrowDown');await page.keyboard.type('Pan');await page.keyboard.press('Enter');assert.equal(await page.locator('#destination').inputValue(),'Panama');
 await page.locator('#service-trigger').click();await page.getByRole('option',{name:'Group trips',exact:true}).click();assert.equal(await page.locator('#service').inputValue(),'Group trips');
 await page.locator('#travel-date-trigger').click();const minimum=await page.locator('#travel-date').getAttribute('min');
 await page.locator(`.calendar-day[data-date="${minimum}"]`).click();assert.equal(await page.locator('#travel-date').inputValue(),minimum);
 await page.locator('.search-button').click();assert(await page.locator('#enquiry-dialog').isVisible());assert.equal(await page.locator('#summary-destination').innerText(),'Panama');assert.equal(await page.locator('#summary-service').innerText(),'Group trips');await page.keyboard.press('Escape');
 await page.locator('#travel-date-trigger').click();assert(await page.getByRole('button',{name:'Previous month',exact:true}).isDisabled());await page.getByRole('button',{name:'Next month',exact:true}).click();assert.equal(await page.locator('.calendar-day:focus').count(),1);await page.keyboard.press('ArrowRight');await page.keyboard.press('Enter');assert((await page.locator('#travel-date').inputValue())>minimum);
 await page.locator('#travel-date-trigger').click();await page.getByRole('button',{name:'Keep dates flexible',exact:true}).click();assert.equal(await page.locator('#travel-date').inputValue(),'');
 await page.locator('#destination-trigger').click();await page.locator('.hero-copy').click();assert.equal(await page.locator('.control-popover').count(),0);
 await page.goto(`${base}/contact/?service=Corporate+travel&destination=Dubai`,{waitUntil:'networkidle'});assert((await page.locator('#c-service-trigger').innerText()).includes('Corporate travel'));assert((await page.locator('#c-destination-trigger').innerText()).includes('Dubai'));
 await page.locator('#c-service-trigger').click();await page.getByRole('option',{name:'Choose a service',exact:true}).click();await page.locator('#contact-form button[type=submit]').click();assert(await page.locator('#enquiry-ready').isHidden());await page.waitForTimeout(100);assert.equal(await page.locator('#c-service-trigger').getAttribute('aria-invalid'),'true');assert.equal(await page.locator('#c-service-trigger').evaluate(el=>document.activeElement===el),true);
 await page.locator('#c-service-trigger').click();await page.getByRole('option',{name:'Flight itinerary',exact:true}).click();await page.locator('#c-date-trigger').click();await page.getByRole('button',{name:'Today',exact:true}).click();await page.locator('#contact-form button[type=submit]').click();assert(await page.locator('#enquiry-ready').isVisible());assert(decodeURIComponent(await page.locator('#ready-whatsapp').getAttribute('href')).includes('Flight itinerary'));
 await page.emulateMedia({reducedMotion:'reduce'});await page.locator('#c-destination-trigger').click();assert.equal(await page.locator('.control-popover').evaluate(el=>getComputedStyle(el).animationName),'none');
 const nojs=await browser.newContext({javaScriptEnabled:false});const plain=await nojs.newPage();await plain.goto(base);assert(await plain.locator('#destination').isVisible());assert.equal(await plain.locator('.control-trigger').count(),0);await nojs.close();
 assert.deepEqual(errors,[]);await writeFile('docs/control-checks.json',JSON.stringify({passed:true,results,keyboard:true,dateSelectionAndClear:true,enquiryDrafts:true,validationFocus:true,noJSFallback:true,reducedMotion:true,errors},null,2));console.log('Custom dropdowns/calendar: viewport, keyboard, date, validation, enquiry and fallback checks passed.');
}finally{await browser.close();}
