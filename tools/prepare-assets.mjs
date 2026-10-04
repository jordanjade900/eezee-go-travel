// Web-delivery encoding only; preserve the original approved logo and PNG source.
import sharp from 'sharp';
await sharp('assets/hero-background.png').webp({quality:90,effort:6}).toFile('assets/hero-background.webp');
await sharp('assets/logo-original.png').resize({width:512}).webp({lossless:true,effort:6}).toFile('assets/logo-web.webp');
await sharp('assets/logo-original.png').resize({width:64}).png().toFile('assets/favicon.png');
console.log('Encoded web assets. Original PNGs are unchanged.');
// Smaller delivery copy for interior-page banners and mobile.
await sharp('assets/hero-background.png').resize({width:960}).webp({quality:80,effort:6}).toFile('assets/hero-background-960.webp');
