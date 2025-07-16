import { FastifyRequest, FastifyReply } from 'fastify';
import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Returns torrents the user is currently seeding or leeching (live)
export async function getActiveTorrentsHandler(request: FastifyRequest, reply: FastifyReply) {
  const user = (request as any).user;
  if (!user) return reply.status(401).send({ error: 'Unauthorized' });

  // Get the latest announce per (torrentId, peerId) for this user
  const announces = await prisma.announce.findMany({
    where: { userId: user.id },
    orderBy: [{ lastAnnounceAt: 'desc' }],
    select: { torrentId: true, left: true, event: true, lastAnnounceAt: true, torrent: { select: { id: true, name: true, infoHash: true, size: true, categoryId: true, createdAt: true } } }
  });

  // Group by torrentId, keep the most recent announce for each
  const latestByTorrent: Record<string, typeof announces[0]> = {};
  for (const a of announces) {
    if (!latestByTorrent[a.torrentId] || a.lastAnnounceAt > latestByTorrent[a.torrentId].lastAnnounceAt) {
      latestByTorrent[a.torrentId] = a;
    }
  }

  // Separate into seeding and leeching
  const seeding = [];
  const leeching = [];
  for (const a of Object.values(latestByTorrent)) {
    if (a.left === BigInt(0)) seeding.push(a.torrent);
    else leeching.push(a.torrent);
  }

  return reply.send({ seeding, leeching });
} 