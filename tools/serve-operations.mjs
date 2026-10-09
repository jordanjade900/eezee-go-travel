import http from 'node:http';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createOperationsHandler } from '../backend/api.mjs';
import { hashPassword } from '../backend/security.mjs';

const project = path.resolve(fileURLToPath(new URL('../', import.meta.url)));
const root = process.env.SITE_ROOT ? path.resolve(process.env.SITE_ROOT) : project;
const port = Number(process.env.PORT || 4191);
const origin = `http://127.0.0.1:${port}`;
const envFile = path.join(project, '.env.local');
let contents;
try { contents = await readFile(envFile, 'utf8'); }
catch (error) {
  if (error.code !== 'ENOENT') throw error;
  const password = randomBytes(20).toString('base64url');
  contents = `OPS_STORE=sqlite\nOPS_ORIGIN=${origin}\nOPS_ADMIN_EMAIL=owner@eezeego.local\nOPS_ADMIN_NAME=EE-Zee Go owner\nOPS_ENCRYPTION_KEY=${randomBytes(32).toString('hex')}\nOPS_SESSION_SECRET=${randomBytes(32).toString('hex')}\nOPS_ADMIN_PASSWORD_HASH=${hashPassword(password)}\n`;
  await writeFile(envFile, contents, { flag: 'wx', mode: 0o600 });
  await mkdir(path.join(project, 'work'), { recursive: true });
  await writeFile(path.join(project, 'work/operations-access.md'), `# Local-only operations access\n\nStaff workspace: ${origin}/manage/\n\nEmail: owner@eezeego.local\n\nPassword: ${password}\n\nThis password is for local development only. The .env.local secrets and SQLite database must never be published.\n`, { flag: 'wx', mode: 0o600 });
  console.log('Local-only credentials created in work/operations-access.md (ignored by Git).');
}
const env = { ...process.env };
for (const line of contents.split(/\r?\n/)) { const match = /^([A-Z][A-Z0-9_]*)=(.*)$/.exec(line); if (match) env[match[1]] ||= match[2]; }
env.OPS_ORIGIN = origin;
const handle = await createOperationsHandler({ env });
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.woff2': 'font/woff2', '.xml': 'application/xml; charset=utf-8', '.txt': 'text/plain; charset=utf-8' };

const server = http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, origin);
    if (url.pathname.startsWith('/api/operations')) {
      if (req.headers.host !== `127.0.0.1:${port}`) { res.writeHead(403); return res.end('Use the loopback URL.'); }
      const chunks = []; let bytes = 0;
      for await (const chunk of req) { bytes += chunk.length; if (bytes > 32768) { res.writeHead(413); return res.end('Request too large'); } chunks.push(chunk); }
      const headers = new Headers();
      for (const [key, value] of Object.entries(req.headers)) if (value && !['x-nf-client-connection-ip', 'x-ops-local-ip', 'x-forwarded-for'].includes(key)) headers.set(key, Array.isArray(value) ? value.join(', ') : value);
      headers.set('x-ops-local-ip', req.socket.remoteAddress || 'loopback');
      const request = new Request(url, { method: req.method, headers, ...(!['GET', 'HEAD'].includes(req.method) ? { body: Buffer.concat(chunks) } : {}) });
      const result = await handle(request);
      res.writeHead(result.status, Object.fromEntries(result.headers)); return res.end(Buffer.from(await result.arrayBuffer()));
    }
    if (!['GET', 'HEAD'].includes(req.method)) { res.writeHead(405); return res.end(); }
    let pathname = decodeURIComponent(url.pathname);
    if (pathname.endsWith('/')) pathname += 'index.html';
    else if (!path.extname(pathname)) { res.writeHead(301, { Location: pathname + '/' + url.search }); return res.end(); }
    const target = path.resolve(root, '.' + pathname);
    if (!target.startsWith(root + path.sep) || /(^|[/\\])(?:\.[^/\\]*|node_modules|docs|references|tools|dist|backend|netlify|work|data)([/\\]|$)/.test(pathname) || !mime[path.extname(target)]) { res.writeHead(403); return res.end('Forbidden'); }
    const data = await readFile(target);
    res.writeHead(200, { 'Content-Type': mime[path.extname(target)], 'Cache-Control': 'no-store', 'X-Content-Type-Options': 'nosniff', 'Referrer-Policy': 'strict-origin-when-cross-origin' });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); try { res.end(await readFile(path.join(root, '404.html'))); } catch { res.end('Not found'); } }
});
server.listen(port, '127.0.0.1', () => console.log(`EE-Zee Go operations: ${origin} (source: ${root})`));
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => server.close(() => { handle.close(); process.exit(0); }));
