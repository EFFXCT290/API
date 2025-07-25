import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/authMiddleware.js';
import { uploadTorrentHandler, listTorrentsHandler, getTorrentHandler, getNfoHandler, approveTorrentHandler, rejectTorrentHandler, listAllTorrentsHandler, getTorrentStatsHandler } from '../controllers/torrentController.js';
import { downloadTorrentHandler } from '../controllers/torrentController.js';
import { requireAuthIfNotOpen } from '../middleware/authOrOpenMiddleware.js';
import {
  listCommentsForTorrentHandler,
  createCommentForTorrentHandler,
  editCommentHandler,
  deleteCommentHandler,
  voteCommentHandler,
  getCommentThreadHandler
} from '../controllers/commentController.js';

export async function registerTorrentRoutes(app: FastifyInstance) {
  app.post('/torrent/upload', { preHandler: requireAuth }, uploadTorrentHandler); //DONE
  app.get('/torrent/:id/download', { preHandler: requireAuth }, downloadTorrentHandler);
  app.get('/torrent/list', { preHandler: requireAuthIfNotOpen }, listTorrentsHandler); //DONE
  app.get('/torrent/:id', { preHandler: requireAuthIfNotOpen }, getTorrentHandler); //DONE
  app.get('/torrent/:id/nfo', { preHandler: requireAuthIfNotOpen }, getNfoHandler); //DONE
  app.post('/admin/torrent/:id/approve', { preHandler: requireAuth }, approveTorrentHandler); //DONE
  app.post('/admin/torrent/:id/reject', { preHandler: requireAuth }, rejectTorrentHandler); //DONE
  app.get('/admin/torrents', { preHandler: requireAuth }, listAllTorrentsHandler); //DONE
  app.get('/admin/torrents/stats', { preHandler: requireAuth }, getTorrentStatsHandler); //DONE
  app.get('/torrent/:id/comments', listCommentsForTorrentHandler);
  app.post('/torrent/:id/comments', { preHandler: requireAuth }, createCommentForTorrentHandler);
  app.put('/comments/:commentId', { preHandler: requireAuth }, editCommentHandler);
  app.delete('/comments/:commentId', { preHandler: requireAuth }, deleteCommentHandler);
  app.post('/comments/:commentId/vote', { preHandler: requireAuth }, voteCommentHandler);
} 