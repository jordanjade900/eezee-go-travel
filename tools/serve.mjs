import http from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { brotliCompress, gzip } from 'node:zlib';
import { promisify } from 'node:util';
const compressBrotli=promisify(brotliCompress),compressGzip=promisify(gzip);
const root = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : fileURLToPath(new URL('../', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {'.html':'text/html; charset=utf-8','.css':'text/css; charset=utf-8','.js':'text/javascript; charset=utf-8','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.woff2':'font/woff2','.xml':'application/xml; charset=utf-8','.txt':'text/plain; charset=utf-8'};
const headers = type => ({'Content-Type':type,'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'});
async function respond(req,res,status,type,data){
  const responseHeaders=headers(type);
  if(/^(text\/|application\/(javascript|xml))/.test(type)&&data.length>1024){
    responseHeaders.Vary='Accept-Encoding';
    const accepts=req.headers['accept-encoding']||'';
    if(/\bbr\b/.test(accepts)){data=await compressBrotli(data);responseHeaders['Content-Encoding']='br';}
    else if(/\bgzip\b/.test(accepts)){data=await compressGzip(data);responseHeaders['Content-Encoding']='gzip';}
  }
  responseHeaders['Content-Length']=data.length;
  res.writeHead(status,responseHeaders);res.end(req.method==='HEAD'?undefined:data);
}
const server = http.createServer(async(req,res)=>{
  if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);return res.end();}
  try {
    const url = new URL(req.url,'http://localhost');
    let pathname = decodeURIComponent(url.pathname);
    // Directory routes such as /group-trips/ serve their index.html; /group-trips redirects to the slash form.
    if(pathname.endsWith('/')) pathname += 'index.html';
    else if(!path.extname(pathname)){res.writeHead(301,{Location:pathname+'/'+url.search});return res.end();}
    const target = path.resolve(root,'.'+pathname);
    if(!(target===root||target.startsWith(root.endsWith(path.sep)?root:root+path.sep))||/[/\\](node_modules|docs|references|tools|dist|backend|netlify|work|data|\.operations|\.git|\.claude)([/\\]|$)/.test(pathname)){res.writeHead(403);return res.end();}
    if(!mime[path.extname(target)]) throw new Error('type');
    const data=await readFile(target);
    await respond(req,res,200,mime[path.extname(target)],data);
  }catch{
    try{const page=await readFile(path.join(root,'404.html'));await respond(req,res,404,mime['.html'],page);}
    catch{res.writeHead(404);res.end('Not found');}
  }
});
server.listen(port,'127.0.0.1',()=>console.log(`EE-Zee Go site: http://127.0.0.1:${port}`));
