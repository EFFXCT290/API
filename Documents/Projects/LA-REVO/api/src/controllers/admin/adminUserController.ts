import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { createNotification } from '../../services/notificationService.js';
import crypto from 'crypto';
const prisma = new PrismaClient();

function isAdminOrOwner(user: any) {
  return user && (user.role === 'ADMIN' || user.role === 'OWNER');
}

export async function banUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.user.update({ where: { id }, data: { status: 'BANNED' } });
  return reply.send({ success: true, user: updated });
}

export async function unbanUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.user.update({ where: { id }, data: { status: 'ACTIVE' } });
  return reply.send({ success: true, user: updated });
}

export async function promoteUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const { role } = request.body as any;
  if (!role || !['MOD', 'ADMIN'].includes(role)) return reply.status(400).send({ error: 'Invalid role' });
  const updated = await prisma.user.update({ where: { id }, data: { role } });
  return reply.send({ success: true, user: updated });
}

export async function demoteUserHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const target = await prisma.user.findUnique({ where: { id } });
  if (!target) return reply.status(404).send({ error: 'User not found' });
  if (target.role === 'OWNER') return reply.status(400).send({ error: 'Cannot demote OWNER' });
  const updated = await prisma.user.update({ where: { id }, data: { role: 'USER' } });
  return reply.send({ success: true, user: updated });
}

export async function listPeerBans(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { active, type, value } = (request.query as any) || {};
  const where: any = {};
  if (active === 'true') where['OR'] = [{ expiresAt: null }, { expiresAt: { gt: new Date() } }];
  if (active === 'false') where['expiresAt'] = { lte: new Date() };
  if (type && ['userId', 'passkey', 'peerId', 'ip'].includes(type as string) && value) {
    where[type as string] = value;
  }
  const bans = await prisma.peerBan.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    include: { bannedBy: { select: { id: true, username: true, role: true } } }
  });
  return reply.send(bans);
}

export async function getPeerBan(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const ban = await prisma.peerBan.findUnique({
    where: { id },
    include: { bannedBy: { select: { id: true, username: true, role: true } } }
  });
  if (!ban) return reply.status(404).send({ error: 'Ban not found' });
  return reply.send(ban);
}

export async function addPeerBan(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { userId, passkey, peerId, ip, reason, expiresAt } = (request.body as any) || {};
  if (!reason || (!userId && !passkey && !peerId && !ip)) {
    return reply.status(400).send({ error: 'Must provide reason and at least one of userId, passkey, peerId, or ip' });
  }
  const ban = await prisma.peerBan.create({
    data: {
      userId,
      passkey,
      peerId,
      ip,
      reason,
      expiresAt: expiresAt ? new Date(expiresAt) : null,
      bannedById: user.id
    }
  });
  // Notify affected user (if userId is present)
  if (userId) {
    const bannedUser = await prisma.user.findUnique({ where: { id: userId } });
    if (bannedUser) {
      await createNotification({
        userId: bannedUser.id,
        type: 'ban',
        message: `You have been banned: ${reason}${expiresAt ? ", expires at " + new Date(expiresAt).toLocaleString() : ''}`,
        adminId: user.id,
        relatedBanId: ban.id,
        sendEmail: true,
        email: bannedUser.email
      });
    }
  }
  return reply.status(201).send(ban);
}

export async function removePeerBan(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const ban = await prisma.peerBan.findUnique({ where: { id } });
  if (!ban) return reply.status(404).send({ error: 'Ban not found' });
  await prisma.peerBan.delete({ where: { id } });
  // Notify affected user (if userId is present)
  if (ban.userId) {
    const bannedUser = await prisma.user.findUnique({ where: { id: ban.userId } });
    if (bannedUser) {
      await createNotification({
        userId: bannedUser.id,
        type: 'unban',
        message: `You have been unbanned by admin ${user.username}.`,
        adminId: user.id,
        relatedBanId: ban.id,
        sendEmail: true,
        email: bannedUser.email
      });
    }
  }
  return reply.send({ success: true });
}

export async function adminSetRssEnabledHandler(request: FastifyRequest, reply: FastifyReply) {
  const admin = (request as any).user;
  if (!isAdminOrOwner(admin)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const { enabled } = request.body as any;
  if (typeof enabled !== 'boolean') return reply.status(400).send({ error: 'enabled must be boolean' });
  const updated = await prisma.user.update({ where: { id }, data: { rssEnabled: enabled } });
  return reply.send({ success: true, user: updated });
}

export async function adminResetRssTokenHandler(request: FastifyRequest, reply: FastifyReply) {
  const admin = (request as any).user;
  if (!isAdminOrOwner(admin)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const newToken = crypto.randomBytes(32).toString('hex');
  const updated = await prisma.user.update({ where: { id }, data: { rssToken: newToken } });
  return reply.send({ success: true, user: updated });
} 