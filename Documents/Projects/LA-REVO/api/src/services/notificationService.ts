import { PrismaClient } from '../../generated/prisma/index.js';
import nodemailer from 'nodemailer';
import { getConfig } from './configService.js';

const prisma = new PrismaClient();

// Create a notification and optionally send an email
export async function createNotification({ userId, type, message, adminId, relatedBanId, sendEmail = false, email }: {
  userId: string,
  type: string,
  message: string,
  adminId?: string,
  relatedBanId?: string,
  sendEmail?: boolean,
  email?: string
}) {
  const notification = await prisma.notification.create({
    data: {
      userId,
      type,
      message,
      adminId,
      relatedBanId
    }
  });
  if (sendEmail && email) {
    await sendEmailNotification({ to: email, subject: `Notification: ${type}`, text: message });
  }
  return notification;
}

// Stub: send an email notification (configurable SMTP)
export async function sendEmailNotification({ to, subject, text }: { to: string, subject: string, text: string }) {
  // Fetch SMTP config from DB
  const config = await getConfig();
  const host = config.smtpHost || process.env.SMTP_HOST || 'localhost';
  const port = config.smtpPort || Number(process.env.SMTP_PORT) || 1025;
  const user = config.smtpUser || process.env.SMTP_USER;
  const pass = config.smtpPass || process.env.SMTP_PASS;
  const from = config.smtpFrom || process.env.SMTP_FROM || 'noreply@tracker.local';
  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: false,
    auth: user ? { user, pass } : undefined
  });
  await transporter.sendMail({ from, to, subject, text });
}

// Fetch notifications for a user
export async function getUserNotifications(userId: string, unreadOnly = false) {
  return prisma.notification.findMany({
    where: { userId, ...(unreadOnly ? { read: false } : {}) },
    orderBy: { createdAt: 'desc' }
  });
}

// Mark a notification as read
export async function markNotificationRead(notificationId: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id: notificationId, userId },
    data: { read: true }
  });
}

// Mark all notifications as read for a user
export async function markAllNotificationsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true }
  });
} 