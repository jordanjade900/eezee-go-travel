import sharp from 'sharp';
import {readFile,mkdir,copyFile,writeFile} from 'node:fs/promises';
const assets=[...JSON.parse(await readFile('work/assets-oct3.json','utf8')),...JSON.parse(await readFile('work/assets-extra-oct3.json','utf8'))];
await mkdir('references/generated/oct3',{recursive:true});
for(const asset of assets){await copyFile(asset.source,`references/generated/oct3/${asset.name}.png`);for(const width of [1536,768])await sharp(asset.source).resize({width,withoutEnlargement:true}).webp({quality:width===1536?83:79}).toFile(`assets/${asset.name}${width===768?'-768':''}.webp`);}
await writeFile('docs/ASSET-PROMPTS-OCT3.json',JSON.stringify(assets.map(({name,prompt})=>({name,prompt,tool:'built-in imagegen',original:`references/generated/oct3/${name}.png`,delivery:`assets/${name}.webp`})),null,2));
await mkdir('assets/vendor',{recursive:true});
for(const [source,target]of [['node_modules/gsap/dist/gsap.min.js','gsap.min.js'],['node_modules/gsap/dist/ScrollTrigger.min.js','ScrollTrigger.min.js']])await copyFile(source,`assets/vendor/${target}`);
console.log(`Encoded ${assets.length} unique new image families; motion libraries copied locally.`);
