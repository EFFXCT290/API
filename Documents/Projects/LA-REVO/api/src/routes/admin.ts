import { FastifyInstance } from 'fastify';
import { requireAuth } from '../middleware/authMiddleware.js';
import {
  banUserHandler, unbanUserHandler, promoteUserHandler, demoteUserHandler,
  listPeerBans, getPeerBan, addPeerBan, removePeerBan,
  adminSetRssEnabledHandler, adminResetRssTokenHandler
} from '../controllers/admin/adminUserController.js';
import {
  listCategoriesHandler, createCategoryHandler, updateCategoryHandler, deleteCategoryHandler
} from '../controllers/admin/adminCategoryController.js';
import {
  createAnnouncementHandler, updateAnnouncementHandler, deleteAnnouncementHandler, pinAnnouncementHandler, unpinAnnouncementHandler, showAnnouncementHandler, hideAnnouncementHandler
} from '../controllers/admin/adminAnnouncementController.js';
import {
  createWikiPageHandler, updateWikiPageHandler, deleteWikiPageHandler, lockWikiPageHandler, unlockWikiPageHandler, showWikiPageHandler, hideWikiPageHandler
} from '../controllers/admin/adminWikiController.js';
import {
  closeRequestHandler, rejectRequestHandler
} from '../controllers/admin/adminRequestController.js';
import { getSmtpConfigHandler, updateSmtpConfigHandler, testSmtpHandler } from '../controllers/configController.js';

export async function registerAdminRoutes(app: FastifyInstance) {
  app.post('/admin/user/:id/ban', { preHandler: requireAuth }, banUserHandler);
  app.post('/admin/user/:id/unban', { preHandler: requireAuth }, unbanUserHandler);
  app.post('/admin/user/:id/promote', { preHandler: requireAuth }, promoteUserHandler);
  app.post('/admin/user/:id/demote', { preHandler: requireAuth }, demoteUserHandler);
  app.get('/admin/peerban', { preHandler: requireAuth }, listPeerBans);
  app.get('/admin/peerban/:id', { preHandler: requireAuth }, getPeerBan);
  app.post('/admin/peerban', { preHandler: requireAuth }, addPeerBan);
  app.delete('/admin/peerban/:id', { preHandler: requireAuth }, removePeerBan);
  app.get('/admin/smtp', { preHandler: requireAuth }, getSmtpConfigHandler);
  app.post('/admin/smtp', { preHandler: requireAuth }, updateSmtpConfigHandler);
  app.post('/admin/smtp/test', { preHandler: requireAuth }, testSmtpHandler);
  app.get('/admin/category', { preHandler: requireAuth }, listCategoriesHandler);
  app.post('/admin/category', { preHandler: requireAuth }, createCategoryHandler);
  app.put('/admin/category/:id', { preHandler: requireAuth }, updateCategoryHandler);
  app.delete('/admin/category/:id', { preHandler: requireAuth }, deleteCategoryHandler);
  app.post('/admin/request/:id/close', { preHandler: requireAuth }, closeRequestHandler);
  app.post('/admin/request/:id/reject', { preHandler: requireAuth }, rejectRequestHandler);
  app.post('/admin/announcement', { preHandler: requireAuth }, createAnnouncementHandler);
  app.put('/admin/announcement/:id', { preHandler: requireAuth }, updateAnnouncementHandler);
  app.delete('/admin/announcement/:id', { preHandler: requireAuth }, deleteAnnouncementHandler);
  app.post('/admin/announcement/:id/pin', { preHandler: requireAuth }, pinAnnouncementHandler);
  app.post('/admin/announcement/:id/unpin', { preHandler: requireAuth }, unpinAnnouncementHandler);
  app.post('/admin/announcement/:id/show', { preHandler: requireAuth }, showAnnouncementHandler);
  app.post('/admin/announcement/:id/hide', { preHandler: requireAuth }, hideAnnouncementHandler);
  app.post('/admin/wiki', { preHandler: requireAuth }, createWikiPageHandler);
  app.put('/admin/wiki/:id', { preHandler: requireAuth }, updateWikiPageHandler);
  app.delete('/admin/wiki/:id', { preHandler: requireAuth }, deleteWikiPageHandler);
  app.post('/admin/wiki/:id/lock', { preHandler: requireAuth }, lockWikiPageHandler);
  app.post('/admin/wiki/:id/unlock', { preHandler: requireAuth }, unlockWikiPageHandler);
  app.post('/admin/wiki/:id/show', { preHandler: requireAuth }, showWikiPageHandler);
  app.post('/admin/wiki/:id/hide', { preHandler: requireAuth }, hideWikiPageHandler);
  app.post('/admin/user/:id/rss-enabled', { preHandler: requireAuth }, adminSetRssEnabledHandler);
  app.post('/admin/user/:id/rss-token', { preHandler: requireAuth }, adminResetRssTokenHandler);
} 