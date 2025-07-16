import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function isAdminOrOwner(user: any) {
  return user && (user.role === 'ADMIN' || user.role === 'OWNER');
}

export async function createAnnouncementHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { title, body, pinned, visible } = request.body as any;
  if (!title || !body) return reply.status(400).send({ error: 'Title and body are required' });
  const announcement = await prisma.announcement.create({
    data: { title, body, pinned: !!pinned, visible: visible !== false, createdById: user.id }
  });
  return reply.status(201).send(announcement);
}

export async function updateAnnouncementHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const { title, body, pinned, visible } = request.body as any;
  const updated = await prisma.announcement.update({
    where: { id },
    data: { title, body, pinned, visible }
  });
  return reply.send(updated);
}

export async function deleteAnnouncementHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  await prisma.announcement.delete({ where: { id } });
  return reply.send({ success: true });
}

export async function pinAnnouncementHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.announcement.update({ where: { id }, data: { pinned: true } });
  return reply.send(updated);
}

export async function unpinAnnouncementHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.announcement.update({ where: { id }, data: { pinned: false } });
  return reply.send(updated);
}

export async function showAnnouncementHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.announcement.update({ where: { id }, data: { visible: true } });
  return reply.send(updated);
}

export async function hideAnnouncementHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.announcement.update({ where: { id }, data: { visible: false } });
  return reply.send(updated);
} 