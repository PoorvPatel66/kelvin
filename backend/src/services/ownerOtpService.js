import crypto from 'crypto';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { comparePassword } from '../utils/passwordUtils.js';
import { sendAdminLoginOtp } from './smsService.js';

const OTP_LENGTH = 6;
const MAX_OTP_ATTEMPTS = 5;

function positiveNumber(value, fallback) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
}

function getOtpTtlMinutes() {
  return positiveNumber(process.env.ADMIN_OTP_EXPIRE_MINUTES, 5);
}

function getResendCooldownSeconds() {
  return positiveNumber(process.env.ADMIN_OTP_RESEND_SECONDS, 60);
}

function getOtpSecret() {
  const secret = process.env.OTP_HASH_SECRET?.trim();

  if (!secret || secret.length < 32) {
    throw new AppError('Admin OTP security is not configured.', 503);
  }

  return secret;
}

function hashOtp(challengeId, otp) {
  return crypto
    .createHmac('sha256', getOtpSecret())
    .update(`${challengeId}:${String(otp)}`)
    .digest('hex');
}

function safeEqualHash(left, right) {
  const leftBuffer = Buffer.from(left, 'hex');
  const rightBuffer = Buffer.from(right, 'hex');
  return leftBuffer.length === rightBuffer.length && crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

export function normalizeMobile(value = '') {
  const digits = String(value).replace(/\D/g, '');
  return digits.length > 10 ? digits.slice(-10) : digits;
}

export function normalizeOwnerName(value = '') {
  return String(value).trim().toLowerCase().replace(/\s+/g, ' ');
}

export async function validateOwnerCredentials({ ownerName, mobile, password }) {
  const normalizedMobile = normalizeMobile(mobile);
  const admin = await prisma.admin.findUnique({ where: { mobile: normalizedMobile } });

  const valid =
    admin &&
    admin.isActive &&
    admin.role === 'SUPER_ADMIN' &&
    normalizeOwnerName(admin.name) === normalizeOwnerName(ownerName) &&
    (await comparePassword(password, admin.password));

  if (!valid) {
    throw new AppError('Invalid owner name, mobile number, or admin password.', 401);
  }

  return admin;
}

export async function createOwnerOtp(admin) {
  const now = new Date();
  const activeChallenge = await prisma.adminOtpChallenge.findFirst({
    where: {
      adminId: admin.id,
      consumedAt: null,
      resendAvailableAt: { gt: now }
    },
    orderBy: { createdAt: 'desc' }
  });

  if (activeChallenge) {
    throw new AppError('Please wait before requesting another OTP.', 429);
  }

  await prisma.adminOtpChallenge.updateMany({
    where: { adminId: admin.id, consumedAt: null },
    data: { consumedAt: now }
  });

  const otp = crypto.randomInt(10 ** (OTP_LENGTH - 1), 10 ** OTP_LENGTH).toString();
  const id = crypto.randomUUID();
  const ttlMinutes = getOtpTtlMinutes();
  const expiresAt = new Date(now.getTime() + ttlMinutes * 60_000);
  const resendAvailableAt = new Date(now.getTime() + getResendCooldownSeconds() * 1000);

  const challenge = await prisma.adminOtpChallenge.create({
    data: {
      id,
      adminId: admin.id,
      mobile: admin.mobile,
      otpHash: hashOtp(id, otp),
      maxAttempts: MAX_OTP_ATTEMPTS,
      expiresAt,
      resendAvailableAt
    }
  });

  return { challenge, otp, ttlMinutes };
}

export async function invalidateOwnerOtp(challengeId) {
  await prisma.adminOtpChallenge.updateMany({
    where: { id: challengeId, consumedAt: null },
    data: { consumedAt: new Date() }
  });
}

export async function verifyOwnerOtp({ adminId, mobile, otp }) {
  const challenge = await prisma.adminOtpChallenge.findFirst({
    where: {
      adminId,
      mobile: normalizeMobile(mobile),
      consumedAt: null
    },
    orderBy: { createdAt: 'desc' }
  });

  if (!challenge || challenge.expiresAt <= new Date()) {
    throw new AppError('OTP was not requested or has expired.', 400);
  }

  if (challenge.attempts >= challenge.maxAttempts) {
    await invalidateOwnerOtp(challenge.id);
    throw new AppError('Too many OTP attempts. Please request a new OTP.', 429);
  }

  const validOtp = safeEqualHash(hashOtp(challenge.id, otp), challenge.otpHash);

  if (!validOtp) {
    await prisma.adminOtpChallenge.update({
      where: { id: challenge.id },
      data: { attempts: { increment: 1 } }
    });
    throw new AppError('Invalid OTP.', 401);
  }

  await prisma.adminOtpChallenge.update({
    where: { id: challenge.id },
    data: { consumedAt: new Date() }
  });

  return true;
}

export async function sendOwnerOtp({ mobile, otp, ttlMinutes }) {
  return sendAdminLoginOtp({ mobile, otp, expiresInMinutes: ttlMinutes });
}
