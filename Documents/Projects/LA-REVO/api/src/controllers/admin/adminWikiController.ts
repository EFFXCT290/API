import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

function isAdminOrOwner(user: any) {
  return user && (user.role === 'ADMIN' || user.role === 'OWNER');
}

export async function createWikiPageHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { slug, title, content, parentId, visible, locked } = request.body as any;
  if (!slug || !title || !content) return reply.status(400).send({ error: 'slug, title, and content are required' });
  const page = await prisma.wikiPage.create({
    data: { slug, title, content, parentId, visible: visible !== false, locked: !!locked, createdById: user.id, updatedById: user.id }
  });
  return reply.status(201).send(page);
}

export async function updateWikiPageHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const { title, content, parentId, visible, locked } = request.body as any;
  const updated = await prisma.wikiPage.update({
    where: { id },
    data: { title, content, parentId, visible, locked, updatedById: user.id }
  });
  return reply.send(updated);
}

export async function deleteWikiPageHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  await prisma.wikiPage.delete({ where: { id } });
  return reply.send({ success: true });
}

export async function lockWikiPageHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.wikiPage.update({ where: { id }, data: { locked: true } });
  return reply.send(updated);
}

export async function unlockWikiPageHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.wikiPage.update({ where: { id }, data: { locked: false } });
  return reply.send(updated);
}

export async function showWikiPageHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.wikiPage.update({ where: { id }, data: { visible: true } });
  return reply.send(updated);
}

export async function hideWikiPageHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!isAdminOrOwner(user)) return reply.status(403).send({ error: 'Forbidden' });
  const { id } = request.params as any;
  const updated = await prisma.wikiPage.update({ where: { id }, data: { visible: false } });
  return reply.send(updated);
} 