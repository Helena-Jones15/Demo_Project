// server.js
const http = require('http');
const { URL } = require('url');

const PORT = 3000;

function sendJSON(res, statusCode, payload) {
  const body = JSON.stringify(payload);
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(body)
  });
  res.end(body);
}

const server = http.createServer((req, res) => {
  // parse pathname safely
  const reqUrl = new URL(req.url, `http://${req.headers.host}`);
  const path = reqUrl.pathname;
  const method = req.method;

  if (path === '/' && method === 'GET') {
    sendJSON(res, 200, { message: 'Hello from HTTP server' });
    return;
  }

  if (path === '/echo' && method === 'POST') {
    // request is a stream: collect chunks
    const chunks = [];
    req.on('data', chunk => chunks.push(chunk));
    req.on('end', () => {
      const raw = Buffer.concat(chunks).toString() || '';
      try {
        const json = raw ? JSON.parse(raw) : {};
        sendJSON(res, 200, { received: json });
      } catch (err) {
        sendJSON(res, 400, { error: 'Invalid JSON' });
      }
    });
    return;
  }

  sendJSON(res, 404, { error: 'Not found' });
});

server.listen(PORT, () => console.log(`HTTP: http://localhost:${PORT}`));