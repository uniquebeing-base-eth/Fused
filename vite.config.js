import { defineConfig } from 'vite';

const empireBaseUrl = 'https://www.empirebuilder.world';
const baseTokenPattern = /^0x[\da-f]{40}$/i;

function empireReadProxy() {
  function register(server) {
    server.middlewares.use('/api/empire', async (request, response) => {
      if (request.method !== 'GET') {
        response.writeHead(405, { 'Content-Type': 'application/json', Allow: 'GET' });
        response.end(JSON.stringify({ error: 'Only read-only GET requests are supported.' }));
        return;
      }

      try {
        const requestUrl = new URL(request.url || '/', 'http://relay.local');
        const empireId = requestUrl.pathname === '/leaderboards'
          ? requestUrl.searchParams.get('tokenAddress')
          : requestUrl.pathname.match(/^\/empires\/(0x[\da-f]{40})$/i)?.[1];

        if (!empireId || !baseTokenPattern.test(empireId)) {
          response.writeHead(400, { 'Content-Type': 'application/json' });
          response.end(JSON.stringify({ error: 'Provide a valid Base token Empire ID.' }));
          return;
        }

        const endpoint = requestUrl.pathname === '/leaderboards'
          ? new URL('/api/leaderboards', empireBaseUrl)
          : new URL(`/api/empires/${empireId}`, empireBaseUrl);
        if (requestUrl.pathname === '/leaderboards') endpoint.searchParams.set('tokenAddress', empireId);

        const upstream = await fetch(endpoint, {
          headers: { Accept: 'application/json' },
          signal: AbortSignal.timeout(12000),
        });
        response.writeHead(upstream.status, {
          'Cache-Control': 'no-store',
          'Content-Type': upstream.headers.get('content-type') || 'application/json',
        });
        response.end(await upstream.text());
      } catch {
        response.writeHead(502, { 'Content-Type': 'application/json' });
        response.end(JSON.stringify({ error: 'Empire Builder read request failed. Try again shortly.' }));
      }
    });
  }

  return {
    name: 'relay-empire-read-proxy',
    configureServer: register,
    configurePreviewServer: register,
  };
}

export default defineConfig({ plugins: [empireReadProxy()] });