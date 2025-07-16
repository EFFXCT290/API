import { FastifyRequest, FastifyReply } from 'fastify';
import argon2 from 'argon2';
import { PrismaClient, UserRole } from '../../generated/prisma/index.js';
import { getConfig, isFirstUser } from '../services/configService.js';
import jwt from 'jsonwebtoken';
import { randomUUID } from 'crypto';

const prisma = new PrismaClient();

const JWT_SECRET = process.env.JWT_SECRET || 'changeme-in-production';

export async function registerHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, username, password, inviteCode } = request.body as any;
  const config = await getConfig();

  // Enforce registration mode
  if (config.registrationMode === 'CLOSED') {
    return reply.status(403).send({ error: 'Registration is closed.' });
  }
  if (config.registrationMode === 'INVITE' && !inviteCode) {
    return reply.status(400).send({ error: 'Invite code required.' });
  }
  // TODO: Validate invite code if needed

  // Check if user/email already exists
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });
  if (existing) {
    return reply.status(400).send({ error: 'Email or username already in use.' });
  }

  // Hash password
  const passwordHash = await argon2.hash(password);

  // Assign OWNER role to first user, USER otherwise
  const first = await isFirstUser();
  const role = first ? UserRole.OWNER : UserRole.USER;

  // Generate unique passkey
  const passkey = randomUUID().replace(/-/g, '');

  const user = await prisma.user.create({
    data: {
      email,
      username,
      passwordHash,
      role,
      emailVerified: false,
      status: 'ACTIVE',
      passkey,
    }
  });

  // TODO: Send verification email

  return reply.status(201).send({ id: user.id, email: user.email, username: user.username, role: user.role, passkey: user.passkey });
}

export async function loginHandler(request: FastifyRequest, reply: FastifyReply) {
  const { email, username, password } = request.body as any;
  if (!password || (!email && !username)) {
    return reply.status(400).send({ error: 'Email/username and password required.' });
  }
  const user = await prisma.user.findFirst({
    where: email ? { email } : { username }
  });
  if (!user) {
    return reply.status(401).send({ error: 'Invalid credentials.' });
  }
  const valid = await argon2.verify(user.passwordHash, password);
  if (!valid) {
    return reply.status(401).send({ error: 'Invalid credentials.' });
  }
  // Only allow login if user is active
  if (user.status !== 'ACTIVE') {
    return reply.status(403).send({ error: 'Account is not active.' });
  }
  // Issue JWT
  const token = jwt.sign(
    { id: user.id, email: user.email, username: user.username, role: user.role },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
  return reply.send({ token, user: { id: user.id, email: user.email, username: user.username, role: user.role } });
}

export async function requestEmailVerificationHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Email verification not implemented yet.' });
}

export async function verifyEmailHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Email verification not implemented yet.' });
}

export async function requestPasswordResetHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Password reset not implemented yet.' });
}

export async function resetPasswordHandler(request: FastifyRequest, reply: FastifyReply) {
  return reply.status(501).send({ error: 'Password reset not implemented yet.' });
}

export async function getProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });
  // Fetch fresh user info from DB
  const prismaUser = await prisma.user.findUnique({ where: { id: user.id } });
  if (!prismaUser) return reply.status(404).send({ error: 'User not found' });
  return reply.send({ id: prismaUser.id, email: prismaUser.email, username: prismaUser.username, role: prismaUser.role, status: prismaUser.status });
}

export async function updateProfileHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });
  const { email, username, password } = request.body as any;
  const data: any = {};
  if (email) data.email = email;
  if (username) data.username = username;
  if (password) data.passwordHash = await argon2.hash(password);
  if (Object.keys(data).length === 0) return reply.status(400).send({ error: 'No data to update' });
  try {
    const updated = await prisma.user.update({ where: { id: user.id }, data });
    return reply.send({ id: updated.id, email: updated.email, username: updated.username, role: updated.role, status: updated.status });
  } catch (err) {
    return reply.status(400).send({ error: 'Update failed', details: err });
  }
}

export async function rotatePasskeyHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });
  const newPasskey = randomUUID().replace(/-/g, '');
  const updated = await prisma.user.update({ where: { id: user.id }, data: { passkey: newPasskey } });
  return reply.send({ passkey: updated.passkey });
} 