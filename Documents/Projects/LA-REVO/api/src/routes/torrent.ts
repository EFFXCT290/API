import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadTorrentHandler, listTorrentsHandler, getTorrentHandler, getNfoHandler, approveTorrentHandler, rejectTorrentHandler } from '../controllers/torrentController.js';
import { downloadTorrentHandler } from '../controllers/torrentController.js';
import { requireAuthIfNotOpen } from '../middleware/authOrOpenMiddleware.js';

export async function registerTorrentRoutes(app: FastifyInstance) {
  app.post('/torrent/upload', { preHandler: requireAuth }, uploadTorrentHandler);
  app.get('/torrent/:id/download', { preHandler: requireAuth }, downloadTorrentHandler);
  app.get('/torrent/list', { preHandler: requireAuthIfNotOpen }, listTorrentsHandler);
  app.get('/torrent/:id', { preHandler: requireAuthIfNotOpen }, getTorrentHandler);
  app.get('/torrent/:id/nfo', { preHandler: requireAuthIfNotOpen }, getNfoHandler);
  app.post('/admin/torrent/:id/approve', { preHandler: requireAuth }, approveTorrentHandler);
  app.post('/admin/torrent/:id/reject', { preHandler: requireAuth }, rejectTorrentHandler);
} 