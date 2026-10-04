import {build} from 'esbuild';
await build({entryPoints:['tools/globe-source.js'],outfile:'assets/vendor/globe.js',bundle:true,minify:true,format:'esm',target:'es2022',legalComments:'eof'});
console.log('Local Three.js illustration bundle built.');
