const http = require('node:http');
const { readFile } = require('node:fs/promises');
const { join } = require('node:path');

const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']]
]);

const server = http.createServer(async (request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const file = files.get(pathname);

  if (!file) {
    response.writeHead(404).end('Not found');
    return;
  }

  try {
    const content = await readFile(join(__dirname, file[0]));
    response.writeHead(200, { 'Content-Type': file[1] }).end(content);
  } catch {
    response.writeHead(500).end('Could not load the frontend.');
  }
});

server.listen(4173, '0.0.0.0', () => {
  console.log('Frontend listening on port 4173');
});
