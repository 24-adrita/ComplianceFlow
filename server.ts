import express from 'express';
import path from 'path';
import net from 'node:net';
import { createServer as createViteServer } from 'vite';
import apiRouter from './src/server/api';

async function findFreePort(startPort: number, maxPort: number) {
  for (let port = startPort; port <= maxPort; port += 1) {
    const isFree = await new Promise<boolean>((resolve) => {
      const server = net.createServer();
      server.once('error', (err: any) => {
        server.close();
        resolve(false);
      });
      server.once('listening', () => {
        server.close();
        resolve(true);
      });
      server.listen(port, '0.0.0.0');
    });

    if (isFree) {
      return port;
    }
  }

  throw new Error(`No free ports available between ${startPort} and ${maxPort}`);
}

async function startServer() {
  const app = express();
  const basePort = Number(process.env.PORT) || 3000;
  const hmrBasePort = Number(process.env.VITE_HMR_PORT) || 24678;
  const PORT = await findFreePort(basePort, basePort + 10);
  const HMR_PORT = await findFreePort(hmrBasePort, hmrBasePort + 10);

  app.use(express.json());

  // API Router Mount
  app.use('/api/v1', apiRouter);
  app.use('/api', apiRouter);

  // Vite development middleware or production static files
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true, hmr: { port: HMR_PORT } },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '127.0.0.1', () => {
    console.log(`ComplianceFlow Server listening on http://localhost:${PORT}`);
    if (PORT !== basePort) {
      console.log(`Requested port ${basePort} was busy; using ${PORT} instead.`);
    }
    if (HMR_PORT !== hmrBasePort) {
      console.log(`Requested HMR port ${hmrBasePort} was busy; using ${HMR_PORT} instead.`);
    }
  });
}

startServer();
