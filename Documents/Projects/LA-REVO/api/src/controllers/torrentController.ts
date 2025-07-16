import { FastifyRequest, FastifyReply } from 'fastify';
import parseTorrent from 'parse-torrent';
import { PrismaClient } from '../../generated/prisma/index.js';
import { randomUUID } from 'crypto';
import fs from 'fs/promises';
import path from 'path';
import { requireTorrentApproval } from '../services/configService.js';

const prisma = new PrismaClient();
const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';

export async function uploadTorrentHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });

  const parts = request.parts();
  let torrentFile, nfoFile, name, description, categoryId;

  for await (const part of parts) {
    if (part.type === 'file') {
      if (part.fieldname === 'torrent') torrentFile = part;
      if (part.fieldname === 'nfo') nfoFile = part;
    } else if (part.type === 'field') {
      if (part.fieldname === 'name') name = part.value;
      if (part.fieldname === 'description') description = part.value;
      if (part.fieldname === 'categoryId') categoryId = String(part.value);
    }
  }

  if (!torrentFile) return reply.status(400).send({ error: '.torrent file is required' });
  if (!name) return reply.status(400).send({ error: 'Torrent name is required' });
  if (!categoryId) return reply.status(400).send({ error: 'Category is required' });
  // Validate category exists
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) return reply.status(400).send({ error: 'Invalid category' });

  // Save .torrent file to disk (stub for pluggable storage)
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  const torrentPath = path.join(UPLOAD_DIR, randomUUID() + '.torrent');
  await fs.writeFile(torrentPath, await torrentFile.toBuffer());

  // Parse .torrent file
  let parsed;
  try {
    parsed = parseTorrent(await fs.readFile(torrentPath));
  } catch (err) {
    return reply.status(400).send({ error: 'Invalid .torrent file' });
  }
  if (!parsed.infoHash) {
    return reply.status(400).send({ error: 'Could not extract infoHash from .torrent file' });
  }

  // Save .nfo file if provided
  let nfoPath: string | null = null;
  if (nfoFile) {
    nfoPath = path.join(UPLOAD_DIR, randomUUID() + '.nfo');
    await fs.writeFile(nfoPath, await nfoFile.toBuffer());
  }

  // Create DB record
  const isApproved = !(await requireTorrentApproval()) ? true : false;
  const torrent = await prisma.torrent.create({
    data: {
      infoHash: parsed.infoHash,
      name: String(name),
      description: description ? String(description) : null,
      uploaderId: user.id,
      filePath: torrentPath,
      nfoPath: nfoPath ?? undefined,
      size: typeof parsed === 'object' && 'length' in parsed && typeof parsed.length === 'number' ? parsed.length : 0,
      isApproved,
      categoryId: category.id
    }
  });

  return reply.status(201).send({ id: torrent.id, infoHash: torrent.infoHash, name: torrent.name });
}

export async function downloadTorrentHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });
  const { id } = request.params as any;
  const torrent = await prisma.torrent.findUnique({ where: { id } });
  if (!torrent) return reply.status(404).send({ error: 'Torrent not found' });
  // Optionally: check if user is allowed to download (e.g., approved, ratio, etc.)
  try {
    const fileBuffer = await fs.readFile(torrent.filePath);
    reply.header('Content-Type', 'application/x-bittorrent');
    reply.header('Content-Disposition', `attachment; filename="${torrent.name}.torrent"`);
    return reply.send(fileBuffer);
  } catch (err) {
    return reply.status(500).send({ error: 'Could not read torrent file' });
  }
}

export async function listTorrentsHandler(request: FastifyRequest, reply: FastifyReply) {
  const { page = 1, limit = 20, q } = request.query as any;
  const take = Math.min(Number(limit) || 20, 100);
  const skip = (Number(page) - 1) * take;
  const where: any = { isApproved: true };
  if (q) {
    where.OR = [
      { name: { contains: q, mode: 'insensitive' } },
      { description: { contains: q, mode: 'insensitive' } }
    ];
  }
  const [torrents, total] = await Promise.all([
    prisma.torrent.findMany({
      where,
      skip,
      take,
      orderBy: { createdAt: 'desc' },
      select: { id: true, name: true, description: true, infoHash: true, size: true, createdAt: true, uploaderId: true }
    }),
    prisma.torrent.count({ where })
  ]);
  return reply.send({ torrents, total, page: Number(page), limit: take });
}

export async function getTorrentHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any;
  const torrent = await prisma.torrent.findUnique({ where: { id } });
  if (!torrent || !torrent.isApproved) return reply.status(404).send({ error: 'Torrent not found' });
  return reply.send(torrent);
}

export async function getNfoHandler(request: FastifyRequest, reply: FastifyReply) {
  const { id } = request.params as any;
  const torrent = await prisma.torrent.findUnique({ where: { id } });
  if (!torrent || !torrent.isApproved || !torrent.nfoPath) {
    return reply.status(404).send({ error: 'NFO not found' });
  }
  try {
    const nfoBuffer = await fs.readFile(torrent.nfoPath);
    reply.header('Content-Type', 'text/plain; charset=utf-8');
    reply.header('Content-Disposition', `inline; filename="${torrent.name}.nfo"`);
    return reply.send(nfoBuffer);
  } catch (err) {
    return reply.status(500).send({ error: 'Could not read NFO file' });
  }
}

export async function approveTorrentHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    return reply.status(403).send({ error: 'Forbidden' });
  }
  const { id } = request.params as any;
  const torrent = await prisma.torrent.findUnique({ where: { id } });
  if (!torrent) return reply.status(404).send({ error: 'Torrent not found' });
  const updated = await prisma.torrent.update({ where: { id }, data: { isApproved: true } });
  return reply.send({ success: true, torrent: updated });
}

export async function rejectTorrentHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user || (user.role !== 'ADMIN' && user.role !== 'OWNER')) {
    return reply.status(403).send({ error: 'Forbidden' });
  }
  const { id } = request.params as any;
  const torrent = await prisma.torrent.findUnique({ where: { id } });
  if (!torrent) return reply.status(404).send({ error: 'Torrent not found' });
  // Delete files
  try {
    await fs.unlink(torrent.filePath);
    if (torrent.nfoPath) await fs.unlink(torrent.nfoPath);
  } catch {}
  await prisma.torrent.delete({ where: { id } });
  return reply.send({ success: true });
} 