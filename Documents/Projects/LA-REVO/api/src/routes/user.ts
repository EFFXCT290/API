import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/authMiddleware.js';
import { getUserNotificationsHandler, markNotificationReadHandler, markAllNotificationsReadHandler, clearNotificationsHandler } from '../controllers/user/notificationController.js';
import { listAllCategoriesHandler, listTorrentsByCategoryHandler } from '../controllers/user/categoryController.js';
import { listRequestsHandler, createRequestHandler, getRequestHandler, fillRequestHandler } from '../controllers/user/requestController.js';
import { listAnnouncementsHandler, getAnnouncementHandler } from '../controllers/user/announcementController.js';
import { listWikiPagesHandler, getWikiPageHandler } from '../controllers/user/wikiController.js';
import { listBookmarksHandler, addBookmarkHandler, removeBookmarkHandler, updateBookmarkNoteHandler } from '../controllers/user/bookmarkController.js';
import { getRssTokenHandler, regenerateRssTokenHandler } from '../controllers/user/rssController.js';
import { getActiveTorrentsHandler } from '../controllers/user/userActiveTorrentController.js';

export async function registerUserRoutes(app: FastifyInstance) {
  app.get('/notifications', { preHandler: requireAuth }, getUserNotificationsHandler);
  app.post('/notifications/:id/read', { preHandler: requireAuth }, markNotificationReadHandler);
  app.post('/notifications/read-all', { preHandler: requireAuth }, markAllNotificationsReadHandler);
  app.delete('/notifications/clear', { preHandler: requireAuth }, clearNotificationsHandler);
  app.get('/categories', listAllCategoriesHandler);
  app.get('/category/:id/torrents', listTorrentsByCategoryHandler);
  app.get('/requests', listRequestsHandler);
  app.post('/requests', { preHandler: requireAuth }, createRequestHandler);
  app.get('/requests/:id', getRequestHandler);
  app.post('/requests/:id/fill', { preHandler: requireAuth }, fillRequestHandler);
  app.get('/announcements', listAnnouncementsHandler);
  app.get('/announcements/:id', getAnnouncementHandler);
  app.get('/wiki', listWikiPagesHandler);
  app.get('/wiki/:slug', getWikiPageHandler);
  app.get('/bookmarks', { preHandler: requireAuth }, listBookmarksHandler);
  app.post('/bookmarks', { preHandler: requireAuth }, addBookmarkHandler);
  app.delete('/bookmarks/:torrentId', { preHandler: requireAuth }, removeBookmarkHandler);
  app.put('/bookmarks/:torrentId', { preHandler: requireAuth }, updateBookmarkNoteHandler);
  app.get('/user/rss-token', { preHandler: requireAuth }, getRssTokenHandler);
  app.post('/user/rss-token', { preHandler: requireAuth }, regenerateRssTokenHandler);
  app.get('/user/active-torrents', { preHandler: requireAuth }, getActiveTorrentsHandler);
} 