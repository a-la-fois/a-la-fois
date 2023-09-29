import { createServer } from 'http';

export const healthServer = createServer(async (req, res) => {
    if (req.url === '/health/readiness' && req.method === 'GET') {
        res.writeHead(200, { 'Content-Type': 'text/plain' });
        res.write('ok');
        res.end();
    } else {
        res.writeHead(404, { 'Content-Type': 'text/plain' });
        res.end();
    }
});
