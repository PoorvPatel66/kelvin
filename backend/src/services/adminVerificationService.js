import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { sendAdminEmailVerificationOtp } from './emailService.js';
import { sendAdminLoginOtp } from './smsService.js';

const OTP_LENGTH = 6;

function getSecret() {
  const secret = process.env.OTP_HASH_SECRET?.trim();
  if (!secret || secret.length < 32) throw new AppError('Admin OTP security is not configured.', 503);
  return secret;
}

function hashOtp(id, otp) {
  return crypto.createHmac('sha256', getSecret()).update(`${id}:${String(otp)}`).digest('hex');
}

function normalizePhone(value) {
  const digits = String(value).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export { normalizePhone };

export async function createVerificationChallenge({ adminId, type, target }) {
  const now = new Date();
  const existing = await prisma.adminVerificationChallenge.findFirst({
    where: { adminId, type, consumedAt: null, resendAvailableAt: { gt: now } },
    orderBy: { createdAt: 'desc' }
  });

  if (existing) throw new AppError('Please wait before requesting another OTP.', 429);

  await prisma.adminVerificationChallenge.updateMany({
    where: { adminId, type, consumedAt: null },
    data: { consumedAt: now }
  });

  const otp = crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
  const id = crypto.randomUUID();
  const ttlMinutes = Number(process.env.ADMIN_OTP_EXPIRE_MINUTES) > 0 ? Number(process.env.ADMIN_OTP_EXPIRE_MINUTES) : 5;
  const challenge = await prisma.adminVerificationChallenge.create({
    data: {
      id,
      adminId,
      type,
      target,
      otpHash: hashOtp(id, otp),
      expiresAt: new Date(now.getTime() + ttlMinutes * 60_000),
      resendAvailableAt: new Date(now.getTime() + 60_000)
    }
  });

  let delivery;
  try {
    delivery = type === 'EMAIL'
      ? await sendAdminEmailVerificationOtp(target, otp, ttlMinutes)
      : await sendAdminLoginOtp({ mobile: target, otp, expiresInMinutes: ttlMinutes });
  } catch (error) {
    await prisma.adminVerificationChallenge.update({ where: { id }, data: { consumedAt: new Date() } });
    throw error;
  }

  return { challenge, ttlMinutes, developmentOtp: delivery.developmentOtp };
}

export async function verifyVerificationChallenge({ adminId, type, target, otp }) {
  const challenge = await prisma.adminVerificationChallenge.findFirst({
    where: { adminId, type, target, consumedAt: null },
    orderBy: { createdAt: 'desc' }
  });

  if (!challenge || challenge.expiresAt <= new Date()) throw new AppError('OTP was not requested or has expired.', 400);
  if (challenge.attempts >= challenge.maxAttempts) throw new AppError('Too many OTP attempts. Please request a new OTP.', 429);

  const expected = Buffer.from(challenge.otpHash, 'hex');
  const actual = Buffer.from(hashOtp(challenge.id, otp), 'hex');
  if (expected.length !== actual.length || !crypto.timingSafeEqual(expected, actual)) {
    await prisma.adminVerificationChallenge.update({ where: { id: challenge.id }, data: { attempts: { increment: 1 } } });
    throw new AppError('Invalid OTP.', 401);
  }

  await prisma.adminVerificationChallenge.update({ where: { id: challenge.id }, data: { consumedAt: new Date() } });
}