import { FastifyInstance } from 'fastify';
import { registerHandler } from '../controllers/authController.js';
import { loginHandler } from '../controllers/authController.js';
import {
  requestEmailVerificationHandler,
  verifyEmailHandler,
  requestPasswordResetHandler,
  resetPasswordHandler,
  getProfileHandler,
  updateProfileHandler,
  rotatePasskeyHandler
} from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

export async function registerAuthRoutes(app: FastifyInstance) {
  app.post('/auth/register', registerHandler);
  app.post('/auth/login', loginHandler);
  app.post('/auth/request-email-verification', requestEmailVerificationHandler);
  app.post('/auth/verify-email', verifyEmailHandler);
  app.post('/auth/request-password-reset', requestPasswordResetHandler);
  app.post('/auth/reset-password', resetPasswordHandler);
  app.post('/auth/rotate-passkey', { preHandler: requireAuth }, rotatePasskeyHandler);
  app.get('/auth/profile', { preHandler: requireAuth }, getProfileHandler);
  app.patch('/auth/profile', { preHandler: requireAuth }, updateProfileHandler);
} 