import sharp from 'sharp';
import {stat} from 'node:fs/promises';
const records=[];
for(const name of ['about-hills','travel-window','journey-street','services-retreat','visa-city','passport-desk']){
 for(const width of [1536,768]){
  const file=`assets/${name}${width===768?'-768':''}.webp`;const before=(await stat(file)).size;
  await sharp(`references/generated/${name}.png`).resize({width,withoutEnlargement:true}).webp({quality:width===768?76:80,effort:6}).toFile(file);
  records.push({file,before,after:(await stat(file)).size});
 }
}
console.log(JSON.stringify(records,null,2));
