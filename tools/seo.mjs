/* Static metadata for ordinary crawlers and AI retrieval. Re-run with
   PUBLIC_SITE_URL when the launch domain differs from the client's current one. */
import {readFile,writeFile,copyFile} from 'node:fs/promises';
const origin=new URL(process.env.PUBLIC_SITE_URL||'https://eezeegotravelja.com/');
if(origin.protocol!=='https:' || origin.pathname!=='/' || origin.search || origin.hash)throw Error('PUBLIC_SITE_URL must be an HTTPS site origin, e.g. https://example.com/');
const base=origin.href;const url=path=>new URL(path,base).href;
const info={
 '':{name:'Travel Made EE-Zee',type:'WebPage',image:'hero-realistic-v2.webp'},
 'about':{name:'About EE-Zee Go Travel',label:'About us',type:'AboutPage',image:'jamaican-highlands.webp'},
 'services':{name:'Travel services in Mandeville',label:'Services',type:'CollectionPage',image:'planning-flatlay.webp'},
 'travel-services':{name:'Travel planning',label:'Travel planning',type:'WebPage',service:'Travel planning',image:'city-night.webp'},
 'group-trips':{name:'Group trips',label:'Group trips',type:'CollectionPage',service:'Group trips',image:'river-canopy.webp'},
 'visa-assistance':{name:'Visa assistance',label:'Visa assistance',type:'FAQPage',service:'Visa assistance',image:'visa-japan.webp'},
 'passport-renewals':{name:'Adult Jamaican passport renewals',label:'Passport renewals',type:'WebPage',service:'Adult Jamaican passport renewal assistance',image:'passport-stilllife.webp'},
 'contact':{name:'Contact EE-Zee Go Travel',label:'Contact',type:'ContactPage',image:'contact-palm.webp'},
 'privacy':{name:'Website privacy',label:'Privacy',type:'WebPage',image:'logo-social.webp'}
};
const strip=s=>s.replace(/<[^>]+>/g,' ').replace(/&amp;/g,'&').replace(/\s+/g,' ').trim();
const esc=s=>s.replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;');
const company={'@type':'TravelAgency','@id':url('#agency'),name:'EE-Zee Go Travel Limited',url:base,description:'Travel planning, visa assistance, adult Jamaican passport renewal assistance and group trips from Mandeville since 1996.',foundingDate:'1996',email:'eezeegoltd@gmail.com',logo:url('assets/logo-web.webp'),telephone:'+1-876-450-3415',address:{'@type':'PostalAddress',streetAddress:'32 Mandeville Plaza',addressLocality:'Mandeville',addressCountry:'JM'},openingHoursSpecification:{'@type':'OpeningHoursSpecification',dayOfWeek:['Monday','Tuesday','Wednesday','Thursday','Friday'],opens:'08:00',closes:'17:00'},sameAs:['https://www.instagram.com/eezeegotravelja/']};
for(const [route,meta]of Object.entries(info)){
 const file=route?`${route}/index.html`:'index.html';let html=await readFile(file,'utf8');
 const title=strip(html.match(/<title>(.*?)<\/title>/s)[1]);const description=html.match(/<meta name="description" content="([^"]*)"/)[1];
 const pageURL=url(route?route+'/':'');const image=url('assets/'+meta.image);
 const page={'@type':meta.type,'@id':pageURL+'#page',url:pageURL,name:title,description,inLanguage:'en-JM',isPartOf:{'@id':url('#website')},about:{'@id':url('#agency')}};
 const graph=[company,{'@type':'WebSite','@id':url('#website'),url:base,name:'EE-Zee Go Travel Limited',inLanguage:'en-JM',publisher:{'@id':url('#agency')}},page];
 if(route==='services'){
  const services=[...html.matchAll(/<a href="([^"]*)" data-enter><span>\d\d<\/span>(?:<div>)?<h3>(.*?)<\/h3>/gs)].map(([,href,name])=>({'@type':'Service',name:strip(name),url:new URL(href,pageURL).href,provider:{'@id':url('#agency')}}));
  const catalog={'@type':'ItemList','@id':pageURL+'#services',name:'Advertised travel services',itemListElement:services.map((service,i)=>({'@type':'ListItem',position:i+1,item:service}))};graph.push(catalog);page.mainEntity={'@id':catalog['@id']};
 }
 if(meta.service){const service={'@type':'Service','@id':pageURL+'#service',name:meta.service,description,url:pageURL,provider:{'@id':url('#agency')}};graph.push(service);page.about={'@id':service['@id']};}
 if(meta.type==='FAQPage')page.mainEntity=[...html.matchAll(/<details><summary>(.*?)<\/summary><div>(.*?)<\/div><\/details>/gs)].map(([,question,answer])=>({'@type':'Question',name:strip(question),acceptedAnswer:{'@type':'Answer',text:strip(answer)}}));
 if(route){
  const parts=[{name:'Home',path:''}];if(['travel-services','visa-assistance','passport-renewals'].includes(route))parts.push({name:'Services',path:'services/'});parts.push({name:meta.label,path:route+'/'});
  const crumb={'@type':'BreadcrumbList','@id':pageURL+'#breadcrumbs',itemListElement:parts.map((p,i)=>({'@type':'ListItem',position:i+1,name:p.name,item:url(p.path)}))};graph.push(crumb);page.breadcrumb={'@id':crumb['@id']};
  if(!html.includes('class="discovery-breadcrumb"')){const visible=`<nav class="discovery-breadcrumb" aria-label="Breadcrumb"><ol>${parts.map((p,i)=>`<li>${i===parts.length-1?`<span aria-current="page">${p.name}</span>`:`<a href="${p.path?'../'+p.path:'../'}">${p.name}</a>`}</li>`).join('')}</ol></nav>`;html=html.replace(/(<main[^>]*>)/,`$1\n${visible}`);}
 }
 const metadata=`<!-- BEGIN SEARCH METADATA -->
  <link rel="canonical" href="${pageURL}">
  <meta name="robots" content="index,follow,max-image-preview:large">
  <meta property="og:type" content="website">
  <meta property="og:site_name" content="EE-Zee Go Travel Limited">
  <meta property="og:locale" content="en_JM">
  <meta property="og:title" content="${esc(title)}">
  <meta property="og:description" content="${esc(description)}">
  <meta property="og:url" content="${pageURL}">
  <meta property="og:image" content="${image}">
  <meta property="og:image:alt" content="${meta.image==='logo-social.webp'?'EE-Zee Go Travel Limited logo':'Illustrative travel imagery for '+meta.name}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${esc(title)}">
  <meta name="twitter:description" content="${esc(description)}">
  <meta name="twitter:image" content="${image}">
  <script type="application/ld+json">${JSON.stringify({'@context':'https://schema.org','@graph':graph}).replace(/</g,'\\u003c')}</script>
  <!-- END SEARCH METADATA -->`;
 html=html.replace(/\s*<!-- BEGIN SEARCH METADATA -->[\s\S]*?<!-- END SEARCH METADATA -->/,'');
 html=html.replace('</head>',metadata+'\n</head>');await writeFile(file,html);
}
await writeFile('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${Object.keys(info).map(route=>`  <url><loc>${url(route?route+'/':'')}</loc></url>`).join('\n')}\n</urlset>\n`);
await writeFile('robots.txt',`User-agent: *\nAllow: /\nDisallow: /docs/\nDisallow: /references/\nDisallow: /tools/\nDisallow: /node_modules/\nDisallow: /dist/\nDisallow: /.claude/\n\nSitemap: ${url('sitemap.xml')}\n`);
console.log('Metadata, business/service/FAQ/breadcrumb schema and crawl files generated for '+base);
