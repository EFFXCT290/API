import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

export async function listAllCategoriesHandler(request: FastifyRequest, reply: FastifyReply) {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    include: { children: true }
  });
  return reply.send(categories);
}

export async function listTorrentsByCategoryHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any;
  const { page = 1, limit = 20 } = (request.query as any) || {};
  const skip = (Number(page) - 1) * Number(limit);
  const torrents = await prisma.torrent.findMany({
    where: { categoryId: id, isApproved: true },
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });
  const total = await prisma.torrent.count({ where: { categoryId: id, isApproved: true } });
  return reply.send({ torrents, total, page: Number(page), limit: Number(limit) });
}

export async function listTorrentsByCategoryTitleHandler(request: FastifyRequest, reply: FastifyReply) {
  const { title } = request.params as any;
  const { page = 1, limit = 20 } = (request.query as any) || {};
  const skip = (Number(page) - 1) * Number(limit);

  // Find the category by name
  const category = await prisma.category.findUnique({ where: { name: title } });
  if (!category) return reply.status(404).send({ error: 'Category not found' });

  const torrents = await prisma.torrent.findMany({
    where: { categoryId: category.id, isApproved: true },
    skip,
    take: Number(limit),
    orderBy: { createdAt: 'desc' }
  });
  const total = await prisma.torrent.count({ where: { categoryId: category.id, isApproved: true } });
  return reply.send({
    torrents: torrents.map(t => ({
      ...t,
      size: t.size?.toString?.() ?? "0",
    })),
    total,
    page: Number(page),
    limit: Number(limit)
  });
} 