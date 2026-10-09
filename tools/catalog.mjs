import {readFile,writeFile} from 'node:fs/promises';
const catalog=JSON.parse(await readFile('data/enquiry-catalog.json','utf8'));
const trips=JSON.parse(await readFile('data/local-trips.json','utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll('<','&lt;');
const arrow=prefix=>`<img src="${prefix}assets/icons/arrow-right.svg" alt="" width="24" height="24">`;
const cards=(prefix,home)=>trips.map(trip=>`<article class="${home?'featured-trip':'local-trip'}" ${home?'data-reveal':'data-enter'} data-trip-date="${trip.date}"><div class="trip-card-top">${home?'':`<img class="trip-thumbnail" src="${prefix}assets/trip-${trip.id}.webp" alt="${esc(trip.name)} photograph from the agency flyer" width="137" height="137">`}<div><time datetime="${trip.date}">${trip.displayDate}</time><span class="local-trip-status">Advertised departure</span><h3>${trip.name}</h3></div></div><strong class="local-trip-price">${trip.advertisedPrice}<span>Advertised price</span></strong>${home?`<p>${trip.includes.slice(0,2).join(' · ')}</p>`:`<ul class="trip-inclusions">${trip.includes.map(item=>`<li>${esc(item)}</li>`).join('')}</ul>`}<a class="p-text-link" href="${prefix}contact/?service=Group+trips&amp;trip=${trip.id}">Enquire about this trip ${arrow(prefix)}</a><a class="p-text-link trip-register" href="${prefix}registration/?trip=${trip.id}">Register interest ${arrow(prefix)}</a></article>`).join('');
for(const [file,hero]of [['index.html',true],['contact/index.html',false]]){
 let html=await readFile(file,'utf8');
 for(const [name,options]of Object.entries(catalog)){
  const id=hero?(name==='services'?'service':'destination'):(name==='services'?'c-service':'c-destination');
  const placeholder=hero?(name==='services'?'Service':'Destination'):(name==='services'?'Choose a service':'Open to suggestions');
  html=html.replace(new RegExp(`(<select id="${id}"[^>]*>)[\\s\\S]*?(</select>)`),`$1<option value="">${placeholder}</option>${options.map(o=>`<option value="${esc(o.value)}">${esc(o.label)}</option>`).join('')}$2`);
 }
 if(hero)html=html.replace(/<!-- BEGIN FEATURED TRIPS -->[\s\S]*?<!-- END FEATURED TRIPS -->/,`<!-- BEGIN FEATURED TRIPS --><section class="featured-trips" aria-labelledby="featured-title"><div class="featured-heading" data-reveal><div><p class="home-kicker">Upcoming group departures</p><h2 id="featured-title">A little closer.<br><em>A great escape.</em></h2></div><a class="contact-chat" href="group-trips/">All group journeys ${arrow('')}</a></div><div class="featured-grid">${cards('',true)}</div><p class="trip-source-note">Check each departure’s pickup point. Confirm price, currency and availability with the team.</p></section><!-- END FEATURED TRIPS -->`);
 else html=html.replace(/(<script id="local-trip-data" type="application\/json">)[\s\S]*?(<\/script>)/,(_,open,close)=>`${open}${JSON.stringify(trips).replaceAll('<','\\u003c')}${close}`);
 await writeFile(file,html);
}
let group=await readFile('group-trips/index.html','utf8');
group=group.replace(/<!-- BEGIN LOCAL TRIPS -->[\s\S]*?<!-- END LOCAL TRIPS -->/,`<!-- BEGIN LOCAL TRIPS --><section class="p-wrap local-trips" id="local-trips"><div class="local-trip-intro" data-enter><div><p class="p-label">Agency-advertised departures</p><h2>Your next departure.<br><em>Good company comes with it.</em></h2></div><a href="../assets/local-trips-flyer.webp" target="_blank" rel="noopener" class="p-text-link">View the original flyer ${arrow('../')}</a></div><div class="local-trip-list">${cards('../',false)}</div><p class="trip-source-note">Dates, prices and inclusions are advertised information. Check your departure’s pickup point and confirm availability, currency and final details before booking.</p></section><!-- END LOCAL TRIPS -->`);
await writeFile('group-trips/index.html',group);
console.log('Shared enquiry options and dated trip content generated.');
