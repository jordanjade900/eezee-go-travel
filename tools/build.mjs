import { mkdir, copyFile, cp, rm, readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import {createHash} from 'node:crypto';
import {transform} from 'esbuild';
await import('./catalog.mjs');
await import('./seo.mjs');
export const pages = ['group-trips','services','travel-services','visa-assistance','passport-renewals','about','contact','privacy'];
const destination=resolve('dist');
const project=JSON.parse(await readFile('package.json','utf8'));
if(dirname(destination)!==process.cwd() || project.name!=='eezee-go-approved-hero') throw new Error('Build must run from the website project root.');
await rm('dist',{recursive:true,force:true});
await mkdir('dist',{recursive:true});
for(const file of ['index.html','404.html','styles.css','site.css','home.css','premium.css','enhancements.css','atelier.css','atelier.js','app.js','site.js','home.js','premium.js','enhancements.js','robots.txt','sitemap.xml']) await copyFile(file,`dist/${file}`);
for(const page of pages){await mkdir(`dist/${page}`,{recursive:true});await copyFile(`${page}/index.html`,`dist/${page}/index.html`);}
await cp('assets','dist/assets',{recursive:true});
for(const file of ['controls.css','controls.js'])await copyFile(file,`dist/${file}`);
// Bundle in the same cascade order. Source styles remain separate for editing;
// the delivered pages need one stylesheet request, with root-relative assets intact.
const bundles=new Map();
for(const file of ['index.html','404.html',...pages.map(page=>`${page}/index.html`)]){
 let html=await readFile(`dist/${file}`,'utf8');
 const styles=[...html.matchAll(/<link rel="stylesheet" href="([^"]+)"\s*\/?\s*>/g)].map(m=>m[1].replace(/^(\.\.\/|\/)+/,''));
 const key=styles.join('|');let bundle=bundles.get(key);
 if(!bundle){const combined=(await Promise.all(styles.map(style=>readFile(style,'utf8')))).join('\n');const {code:css}=await transform(combined,{loader:'css',minify:true,legalComments:'inline'});bundle=`bundle-${createHash('sha256').update(css).digest('hex').slice(0,10)}.css`;bundles.set(key,bundle);await writeFile(`dist/${bundle}`,css);}
 let first=true;html=html.replace(/<link rel="stylesheet" href="([^"]+)"\s*\/?\s*>/g,()=>{if(!first)return '';first=false;const prefix=file==='404.html'?'/':file.includes('/')?'../':'';return `<link rel="stylesheet" href="${prefix}${bundle}">`;});
 await writeFile(`dist/${file}`,html);
}
console.log('Static build ready in dist/. No publication performed.');
