import {chromium} from 'playwright';
import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
const trips=JSON.parse(await readFile('data/local-trips.json','utf8'));
const browser=await chromium.launch({channel:'chrome'});
const base='http://127.0.0.1:4173';
try {
 const page=await browser.newPage({reducedMotion:'reduce'});
 const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const route of ['','about/','services/','travel-services/','group-trips/','visa-assistance/','passport-renewals/','contact/','privacy/']){
  await page.goto(`${base}/${route}`);
  assert.equal(await page.locator('.instagram-link').getAttribute('href'),'https://www.instagram.com/eezeegotravelja/');
 }
 await page.goto(`${base}/services/`);assert.equal(await page.locator('.service-directory h3').count(),8);
 await page.goto(`${base}/visa-assistance/`);
 for(const place of ['Dubai','Japan','China'])assert(await page.locator('main').innerText().then(t=>t.includes(place)));
 await mkdir('docs/screenshots/instagram',{recursive:true});
 for(const width of [1440,390]){
  await page.setViewportSize({width,height:1000});
  for(const route of ['services','group-trips']){
   await page.goto(`${base}/${route}/`,{waitUntil:'networkidle'});
   await page.evaluate(async()=>{for(const el of document.querySelectorAll('[data-enter]')){el.scrollIntoView();await new Promise(r=>setTimeout(r,25));}scrollTo(0,0);});
   await page.screenshot({path:`docs/screenshots/instagram/${route}-${width}.png`,fullPage:true});
  }
 }
 for(const trip of trips){
  await page.goto(`${base}/group-trips/`);
  const card=page.locator(`article[data-trip-date="${trip.date}"]`);
  assert((await card.innerText()).includes(trip.advertisedPrice));
  await card.locator('a').click();
  assert.equal(await page.locator('#c-service').inputValue(),'Group trips');
  assert.equal(await page.locator('#c-destination').inputValue(),trip.name);
  const minimum=await page.locator('#c-date').getAttribute('min');
  assert.equal(await page.locator('#c-date').inputValue(),trip.date>=minimum?trip.date:'');
  await page.locator('#contact-form button[type="submit"]').click();
  for(const id of ['ready-whatsapp','ready-email']){
   const href=decodeURIComponent(await page.locator(`#${id}`).getAttribute('href'));
   assert(href.includes(trip.name)&&href.includes(trip.displayDate)&&href.includes(trip.advertisedPrice));
  }
 }
 await page.goto(`${base}/contact/?trip=unpublished`);assert.equal(await page.locator('#c-message').inputValue(),'');
 for(const service of ['Flight itinerary','Corporate travel','Trip planning consultation']){
  await page.goto(`${base}/contact/?service=${encodeURIComponent(service)}`);assert.equal(await page.locator('#c-service').inputValue(),service);
 }
 await page.clock.install({time:new Date('2027-01-02T12:00:00')});
 await page.goto(`${base}/group-trips/`);
 assert.equal(await page.getByText('Past advertised departure',{exact:true}).count(),3);
 await page.locator('.local-trip a').first().click();
 assert.equal(await page.locator('#c-date').inputValue(),'');
 assert((await page.locator('#c-message').inputValue()).includes('17 October 2026'));
 assert.deepEqual(errors,[]);
 await writeFile('docs/instagram-checks.json',JSON.stringify({passed:true,services:8,trips:3,instagramRoutes:9,enquiryDrafts:'Verified; none sent'},null,2));
 console.log('Instagram service coverage, trip prefill and enquiry drafts passed.');
} finally {await browser.close();}
