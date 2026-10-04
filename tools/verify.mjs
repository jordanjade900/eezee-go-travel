import { chromium } from 'playwright';
import { mkdir, writeFile } from 'node:fs/promises';
import assert from 'node:assert/strict';
const base = process.env.TEST_URL || 'http://127.0.0.1:4173';
const browser = await chromium.launch({channel:process.env.BROWSER_CHANNEL || 'chrome',headless:true});
await mkdir('docs/screenshots',{recursive:true});
const results=[];
try {
  const page=await browser.newPage();
  const cdp=await page.context().newCDPSession(page);
  await cdp.send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-transparency',value:'no-preference'}]});
  const errors=[];
  page.on('pageerror',e=>errors.push(e.message));
  page.on('response',r=>{if(r.status()>=400) errors.push(`${r.status()} ${r.url()}`);});
  for(const [width,height] of [[1672,941],[1440,900],[1024,768],[768,1024],[390,844],[320,740]]) {
    await page.setViewportSize({width,height});
    await page.goto(base,{waitUntil:'networkidle'});
    await page.evaluate(()=>document.fonts.ready);
    // Load deferred supporting images by browsing the page, then verify them.
    for(const picture of await page.locator('img[loading="lazy"]').all()){
      await picture.scrollIntoViewIfNeeded();await picture.evaluate(img=>img.decode());
    }
    await page.evaluate(()=>scrollTo({top:0,behavior:'instant'}));
    assert(await page.locator('h1').isVisible(),'Heading visible');
    assert.equal(await page.evaluate(()=>[...document.querySelectorAll('#main-navigation a')].filter(a=>a.host!==location.host).length),0,'Hero nav is local');
    const layout=await page.evaluate(()=>({width:document.documentElement.clientWidth,scrollWidth:document.documentElement.scrollWidth,images:[...document.images].every(i=>i.complete&&i.naturalWidth>0),heading:document.querySelector('h1').innerText}));
    assert(layout.scrollWidth<=width+1,`No horizontal overflow at ${width}`);
    assert(layout.images,`All images load at ${width}`);
    if(width===1672||width===390) await page.screenshot({path:`docs/screenshots/hero-${width}.png`,fullPage:true});
    results.push({viewport:`${width}x${height}`,noOverflow:true,imagesLoaded:true});
  }
  await page.setViewportSize({width:1672,height:941});
  await page.goto(base,{waitUntil:'networkidle'});
  await page.selectOption('#destination','Panama');
  await page.selectOption('#service','Group trips');
  const tomorrow=new Date();tomorrow.setDate(tomorrow.getDate()+1);
  const iso=`${tomorrow.getFullYear()}-${String(tomorrow.getMonth()+1).padStart(2,'0')}-${String(tomorrow.getDate()).padStart(2,'0')}`;
  await page.fill('#travel-date',iso);
  await page.locator('.search-button').click();
  assert(await page.locator('dialog').isVisible(),'Search opens enquiry');
  assert.equal(await page.locator('#summary-destination').innerText(),'Panama');
  assert.equal(await page.locator('#summary-service').innerText(),'Group trips');
  const whatsapp=new URL(await page.locator('#whatsapp-link').getAttribute('href'));
  assert.equal(whatsapp.hostname,'wa.me');assert.equal(whatsapp.pathname,'/18764503415');
  assert(whatsapp.searchParams.get('text').includes('Panama'));
  await page.screenshot({path:'docs/screenshots/enquiry.png',fullPage:true});
  await page.keyboard.press('Escape');
  assert(!(await page.locator('dialog').isVisible()),'Escape closes modal');
  await page.locator('[data-book]').click();assert(await page.locator('dialog').isVisible(),'Book Now works');
  await page.locator('.dialog-close').click();
  await page.fill('#travel-date','2020-01-01');
  await page.locator('.search-button').click();assert(!(await page.locator('dialog').isVisible()),'Past date rejected');
  await page.setViewportSize({width:390,height:844});await page.reload({waitUntil:'networkidle'});
  await page.locator('.menu-toggle').click();assert(await page.locator('#main-navigation').isVisible(),'Mobile menu opens');
  await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
  await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});
  assert.equal(await page.evaluate(()=>getComputedStyle(document.documentElement).colorScheme),'light','Approved light design preserved');

  // Interior pages: layout, resources, single h1, local navigation.
  const routes=['group-trips/','services/','travel-services/','visa-assistance/','passport-renewals/','about/','contact/','privacy/'];
  for(const [width,height] of [[1440,900],[768,1024],[390,844],[320,740]]){
    await page.setViewportSize({width,height});
    for(const r of routes){
      await page.goto(base+'/'+r,{waitUntil:'networkidle'});
      await page.evaluate(async()=>{for(const image of document.querySelectorAll('img[loading="lazy"]')){image.scrollIntoView();await image.decode();}for(const track of document.querySelectorAll('.destination-track'))track.scrollLeft=0;scrollTo({top:0,behavior:'instant'});});
      const info=await page.evaluate(()=>({sw:document.documentElement.scrollWidth,h1:document.querySelectorAll('h1').length,img:[...document.images].every(i=>i.complete&&i.naturalWidth>0),external:[...document.querySelectorAll('#site-nav a')].filter(a=>a.host!==location.host).length}));
      assert(info.sw<=width+1,`No horizontal overflow on ${r} at ${width}`);
      assert.equal(info.h1,1,`Single h1 on ${r}`);assert(info.img,`Images load on ${r}`);assert.equal(info.external,0,`Local nav on ${r}`);
      if(width===1440||width===390) await page.screenshot({path:`docs/screenshots/${r.replace('/','')}-${width}.png`,fullPage:true});
    }
    results.push({viewport:`${width}x${height}`,interiorPages:routes.length,noOverflow:true});
  }
  // Contact form: prefill from query, required service, draft links, nothing sent.
  await page.setViewportSize({width:1440,height:900});
  await page.goto(base+'/contact/?service=Group+trips&destination=Peru',{waitUntil:'networkidle'});
  assert.equal(await page.inputValue('#c-service'),'Group trips');assert.equal(await page.inputValue('#c-destination'),'Peru');
  await page.selectOption('#c-service','');await page.locator('#contact-form button[type=submit]').click();
  assert(await page.locator('#enquiry-ready').isHidden(),'Missing service blocks draft');
  assert.equal(await page.locator('#c-service').getAttribute('aria-invalid'),'true');
  await page.selectOption('#c-service','Visa assistance');await page.fill('#c-travellers','3');await page.fill('#c-message','Family trip in summer');
  await page.locator('#contact-form button[type=submit]').click();
  assert(await page.locator('#enquiry-ready').isVisible(),'Draft panel shown');
  const wa=new URL(await page.locator('#ready-whatsapp').getAttribute('href'));
  assert.equal(wa.pathname,'/18764503415');assert(wa.searchParams.get('text').includes('Visa assistance')&&wa.searchParams.get('text').includes('Travellers: 3'));
  assert((await page.locator('#ready-email').getAttribute('href')).startsWith('mailto:eezeegoltd@gmail.com?subject='));
  await page.screenshot({path:'docs/screenshots/contact-ready.png'});
  await page.setViewportSize({width:390,height:844});await page.goto(base+'/services/',{waitUntil:'networkidle'});
  await page.locator('.page-menu-toggle').click();assert(await page.locator('#site-nav').isVisible(),'Interior mobile menu opens');
  await page.keyboard.press('Escape');assert.equal(await page.locator('.page-menu-toggle').getAttribute('aria-expanded'),'false');
  const missing=await page.goto(base+'/no-such-page/');assert.equal(missing.status(),404);
  errors.splice(errors.findIndex(e=>e.includes('no-such-page')),1);
  results.push({contactPrefill:true,contactValidation:true,contactDrafts:true,interiorMobileMenu:true,notFoundPage:true});
  assert.deepEqual(errors,[],'No browser errors or failed resources');
  results.push({searchDialog:true,selectionTransfer:true,whatsappDraft:true,escapeClose:true,bookNow:true,pastDateValidation:true,mobileMenu:true,approvedTheme:true,errors});
  await writeFile('docs/verification.json',JSON.stringify(results,null,2));
  console.log(JSON.stringify(results,null,2));
} finally {await browser.close();}
