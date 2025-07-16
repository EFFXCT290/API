import Fastify from 'fastify';
import { registerAuthRoutes } from './routes/auth.js';
import multipart from '@fastify/multipart';
import { registerTorrentRoutes } from './routes/torrent.js';
import { registerUserRoutes } from './routes/user.js';
import { registerAnnounceRoutes } from './routes/announce.js';
import { registerRssRoutes } from './routes/rss.js';
import { registerAdminRoutes } from './routes/admin.js';

const app = Fastify({ logger: true });

app.get('/health', async (request, reply) => {
  return { status: 'ok' };
});

// Import plugins and routes (to be implemented)
// import { registerAuthRoutes } from './routes/auth';
// import { registerUserRoutes } from './routes/user';
// import { registerTorrentRoutes } from './routes/torrent';
// import { registerAnnounceRoutes } from './routes/announce';
// import { registerAdminRoutes } from './routes/admin';

// Example usage (to be implemented):
await registerAuthRoutes(app);
await app.register(multipart);
await registerTorrentRoutes(app);
await registerUserRoutes(app);
await registerAnnounceRoutes(app);
await registerRssRoutes(app);
await registerAdminRoutes(app);
// registerUserRoutes(app);
// registerTorrentRoutes(app);
// registerAnnounceRoutes(app);
// registerAdminRoutes(app);

const start = async () => {
  try {
    await app.listen({ port: 3001, host: '0.0.0.0' });
    console.log('API server running on http://localhost:3001');
  } catch (err) {
    app.log.error(err);
    process.exit(1);
  }
};

start(); 