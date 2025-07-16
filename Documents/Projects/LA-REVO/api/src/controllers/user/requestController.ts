import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listRequestsHandler(request: FastifyRequest, reply: FastifyReply) {
  const { status, categoryId, q, page = 1, limit = 20 } = (request.query as any) || {};
  const skip = (Number(page) - 1) * Number(limit);
  const where: any = {};
  if (status) where.status = status;
  if (categoryId) where.categoryId = categoryId;
  if (q) where.title = { contains: q, mode: 'insensitive' };
  const [requests, total] = await Promise.all([
    prisma.request.findMany({
      where,
      skip,
      take: Number(limit),
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { id: true, username: true } }, filledBy: { select: { id: true, username: true } }, filledTorrent: { select: { id: true, name: true } }, category: true }
    }),
    prisma.request.count({ where })
  ]);
  return reply.send({ requests, total, page: Number(page), limit: Number(limit) });
}

export async function createRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });
  const { title, description, categoryId } = request.body as any;
  if (!title) return reply.status(400).send({ error: 'Title is required' });
  const req = await prisma.request.create({
    data: { userId: user.id, title, description, categoryId }
  });
  return reply.status(201).send(req);
}

export async function getRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any;
  const req = await prisma.request.findUnique({
    where: { id },
    include: { user: { select: { id: true, username: true } }, filledBy: { select: { id: true, username: true } }, filledTorrent: { select: { id: true, name: true } }, category: true }
  });
  if (!req) return reply.status(404).send({ error: 'Request not found' });
  return reply.send(req);
}

export async function fillRequestHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });
  const { id } = request.params as any;
  const { torrentId } = request.body as any;
  const req = await prisma.request.findUnique({ where: { id } });
  if (!req) return reply.status(404).send({ error: 'Request not found' });
  if (req.status !== 'OPEN') return reply.status(400).send({ error: 'Request is not open' });
  // Optionally: check if torrent exists and is approved
  const torrent = await prisma.torrent.findUnique({ where: { id: torrentId, isApproved: true } });
  if (!torrent) return reply.status(400).send({ error: 'Invalid or unapproved torrent' });
  const updated = await prisma.request.update({
    where: { id },
    data: { status: 'FILLED', filledById: user.id, filledTorrentId: torrent.id }
  });
  // TODO: Notify requestor
  return reply.send(updated);
} 