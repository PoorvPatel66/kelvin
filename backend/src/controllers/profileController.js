import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { generateToken, setTokenCookie } from '../utils/generateToken.js';
import { createVerificationChallenge, normalizePhone, verifyVerificationChallenge } from '../services/adminVerificationService.js';

const profileSelect = {
  id: true, name: true, email: true, mobile: true, role: true, isActive: true,
  emailVerified: true, phoneVerified: true, createdAt: true, updatedAt: true
};

function sendDevelopmentOtp(res, result, message) {
  res.status(200).json({
    success: true,
    message,
    expiresAt: result.challenge.expiresAt,
    ...(result.developmentOtp && process.env.NODE_ENV !== 'production' ? { developmentOtp: result.developmentOtp } : {})
  });
}

export const getProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.admin.findUnique({ where: { id: req.user.id }, select: profileSelect });
  res.json({ success: true, profile });
});

export const updateProfile = asyncHandler(async (req, res) => {
  const profile = await prisma.admin.update({
    where: { id: req.user.id },
    data: { name: req.body.name.trim() },
    select: profileSelect
  });
  res.json({ success: true, profile, message: 'Profile updated successfully.' });
});

export const requestEmailChange = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  if (email === req.user.email.toLowerCase()) throw new AppError('Enter a different email address.', 400);
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing) throw new AppError('That email address is already in use.', 409);
  const result = await createVerificationChallenge({ adminId: req.user.id, type: 'EMAIL', target: email });
  sendDevelopmentOtp(res, result, 'A verification code was sent to the new email address.');
});

export const verifyEmailChange = asyncHandler(async (req, res) => {
  const email = req.body.email.toLowerCase();
  const existing = await prisma.admin.findUnique({ where: { email } });
  if (existing && existing.id !== req.user.id) throw new AppError('That email address is already in use.', 409);
  await verifyVerificationChallenge({ adminId: req.user.id, type: 'EMAIL', target: email, otp: req.body.otp });
  const profile = await prisma.admin.update({
    where: { id: req.user.id },
    data: { email, emailVerified: true },
    select: profileSelect
  });
  res.json({ success: true, profile, message: 'Email updated and verified.' });
});

export const requestPhoneChange = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  if (phone === normalizePhone(req.user.mobile)) throw new AppError('Enter a different phone number.', 400);
  const existing = await prisma.admin.findUnique({ where: { mobile: phone } });
  if (existing) throw new AppError('That phone number is already in use.', 409);
  const result = await createVerificationChallenge({ adminId: req.user.id, type: 'PHONE', target: phone });
  sendDevelopmentOtp(res, result, 'A verification code was sent to the new phone number.');
});

export const verifyPhoneChange = asyncHandler(async (req, res) => {
  const phone = normalizePhone(req.body.phone);
  const existing = await prisma.admin.findUnique({ where: { mobile: phone } });
  if (existing && existing.id !== req.user.id) throw new AppError('That phone number is already in use.', 409);
  await verifyVerificationChallenge({ adminId: req.user.id, type: 'PHONE', target: phone, otp: req.body.otp });
  const profile = await prisma.admin.update({
    where: { id: req.user.id },
    data: { mobile: phone, phoneVerified: true },
    select: profileSelect
  });
  res.json({ success: true, profile, message: 'Phone number updated and verified.' });
});

export const changePassword = asyncHandler(async (req, res) => {
  const admin = await prisma.admin.findUnique({ where: { id: req.user.id } });
  if (!admin || !(await comparePassword(req.body.currentPassword, admin.password))) {
    throw new AppError('Current password is incorrect.', 401);
  }
  const updated = await prisma.admin.update({
    where: { id: admin.id },
    data: { password: await hashPassword(req.body.newPassword), tokenVersion: { increment: 1 } },
    select: { ...profileSelect, tokenVersion: true }
  });
  const token = generateToken(updated);
  setTokenCookie(res, token);
  const { tokenVersion, ...safeProfile } = updated;
  res.json({ success: true, token, profile: safeProfile, message: 'Password changed successfully.' });
});