// Leonida Platinum — tiny static server for local previews.
//
// Serves app/ on http://localhost:8080 (or $PORT). Development convenience
// only: the entry itself is plain static files and never needs a server.
// Node 22+, standard library only.
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = fileURLToPath(new URL('app', import.meta.url));
const PORT = Number(process.env.PORT ?? 8080);

const TYPES: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
};

const server = createServer((req, res) => {
  const raw = decodeURIComponent(new URL(req.url ?? '/', 'http://localhost').pathname);
  const rel = normalize(raw).replace(/^(\.\.[/\\])+/, '').replace(/^[/\\]+/, '');
  let target = join(ROOT, rel === '' ? 'index.html' : rel);
  if (!target.startsWith(ROOT + sep) && target !== ROOT) {
    res.writeHead(400, { 'content-type': 'text/plain' });
    res.end('bad path');
    return;
  }
  if (existsSync(target) && statSync(target).isDirectory()) target = join(target, 'index.html');
  if (!existsSync(target) || !statSync(target).isFile()) {
    res.writeHead(404, { 'content-type': 'text/plain' });
    res.end('not found');
    return;
  }
  const body = readFileSync(target);
  res.writeHead(200, {
    'content-type': TYPES[extname(target).toLowerCase()] ?? 'application/octet-stream',
    'content-length': body.length,
  });
  res.end(body);
});

server.listen(PORT, () => {
  console.log(`Leonida Platinum preview at http://localhost:${PORT}`);
});
