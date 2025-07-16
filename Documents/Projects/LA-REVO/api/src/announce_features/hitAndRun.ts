import { PrismaClient } from '../../generated/prisma/index.js';
import { getConfig } from '../services/configService.js';

const prisma = new PrismaClient();

export async function updateHitAndRun(userId: string, torrentId: string, left: bigint, event: string | null) {
  const config = await getConfig();
  const REQUIRED_SEEDING_MINUTES = config.requiredSeedingMinutes;
  // Find or create HitAndRun record
  let record = await prisma.hitAndRun.findFirst({ where: { userId, torrentId } });
  const now = new Date();
  if (!record) {
    record = await prisma.hitAndRun.create({
      data: {
        userId,
        torrentId,
        downloadedAt: now,
        lastSeededAt: left === BigInt(0) ? now : null,
        totalSeedingTime: 0,
        isHitAndRun: false
      }
    });
  }
  // If seeding (left == 0), update lastSeededAt and increment seeding time
  let totalSeedingTime = record.totalSeedingTime;
  let lastSeededAt = record.lastSeededAt;
  if (left === BigInt(0)) {
    if (lastSeededAt) {
      // Increment seeding time by minutes since lastSeededAt
      const minutes = Math.floor((now.getTime() - new Date(lastSeededAt).getTime()) / 60000);
      totalSeedingTime += minutes;
    }
    lastSeededAt = now;
  }
  // If event is 'stopped', check if seeding time is sufficient
  let isHitAndRun = record.isHitAndRun;
  if (event === 'stopped' && totalSeedingTime < REQUIRED_SEEDING_MINUTES) {
    isHitAndRun = true;
  }
  await prisma.hitAndRun.update({
    where: { id: record.id },
    data: {
      lastSeededAt,
      totalSeedingTime,
      isHitAndRun
    }
  });
} 