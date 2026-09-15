import crypto from 'crypto';
import { Role } from '@prisma/client';
import { prisma } from '../config/prisma.js';
import AppError from '../utils/AppError.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { comparePassword, hashPassword } from '../utils/passwordUtils.js';
import { generateToken, setTokenCookie } from '../utils/generateToken.js';
import { sendPasswordResetOtp } from '../services/emailService.js';
import {
  createOwnerOtp,
  invalidateOwnerOtp,
  sendOwnerOtp,
  validateOwnerCredentials,
  verifyOwnerOtp
} from '../services/ownerOtpService.js';

function sanitizeAdmin(admin) {
  const {
    password,
    resetPasswordToken,
    resetPasswordOtp,
    resetPasswordExpire,
    tokenVersion,
    ...safeAdmin
  } = admin;
  return safeAdmin;
}

function createResetToken() {
  const otp = crypto.randomInt(100000, 999999).toString();
  const resetPasswordToken = crypto.randomBytes(32).toString('hex');
  const resetPasswordOtp = crypto.createHash('sha256').update(otp).digest('hex');
  const resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

  return {
    otp,
    resetPasswordToken,
    resetPasswordOtp,
    resetPasswordExpire
  };
}

function sendAuthResponse(res, statusCode, admin) {
  const token = generateToken(admin);
  setTokenCookie(res, token);

  res.status(statusCode).json({
    success: true,
    token,
    user: sanitizeAdmin(admin)
  });
}

export const registerAdmin = asyncHandler(async (req, res) => {
  const existingAdmin = await prisma.admin.findUnique({
    where: { email: req.body.email.toLowerCase() }
  });

  if (existingAdmin) {
    throw new AppError('Admin with this email already exists.', 409);
  }

  const admin = await prisma.admin.create({
    data: {
      name: req.body.name,
      email: req.body.email.toLowerCase(),
      password: await hashPassword(req.body.password),
      role: req.body.role || Role.ADMIN
    }
  });

  sendAuthResponse(res, 201, admin);
});

export const login = asyncHandler(async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { email: req.body.email.toLowerCase() }
  });

  if (!admin || !admin.isActive || !(await comparePassword(req.body.password, admin.password))) {
    throw new AppError('Invalid email or password.', 401);
  }

  const authenticatedAdmin = await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  });

  sendAuthResponse(res, 200, authenticatedAdmin);
});

export const requestOwnerOtp = asyncHandler(async (req, res) => {
  const admin = await validateOwnerCredentials(req.body);
  const otpData = await createOwnerOtp(admin);

  try {
    const delivery = await sendOwnerOtp({
      mobile: admin.mobile,
      otp: otpData.otp,
      ttlMinutes: otpData.ttlMinutes
    });

    res.status(200).json({
      success: true,
      message:
        delivery.developmentOtp && process.env.NODE_ENV !== 'production'
          ? 'Development verification code generated.'
          : 'A verification code was sent to the registered mobile number.',
      expiresAt: otpData.challenge.expiresAt,
      ...(delivery.developmentOtp && process.env.NODE_ENV !== 'production'
        ? { developmentOtp: delivery.developmentOtp }
        : {})
    });
  } catch (error) {
    await invalidateOwnerOtp(otpData.challenge.id);
    throw error;
  }
});

export const verifyOwnerLogin = asyncHandler(async (req, res) => {
  const admin = await validateOwnerCredentials(req.body);
  await verifyOwnerOtp({
    adminId: admin.id,
    mobile: req.body.mobile,
    otp: req.body.otp
  });

  const authenticatedAdmin = await prisma.admin.update({
    where: { id: admin.id },
    data: { lastLoginAt: new Date() }
  });

  sendAuthResponse(res, 200, authenticatedAdmin);
});

export const logout = asyncHandler(async (req, res) => {
  res.cookie('token', '', {
    expires: new Date(0),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully.'
  });
});

export const me = asyncHandler(async (req, res) => {
  res.status(200).json({
    success: true,
    user: req.user
  });
});

export const forgotPassword = asyncHandler(async (req, res) => {
  const admin = await prisma.admin.findUnique({
    where: { email: req.body.email.toLowerCase() }
  });

  if (!admin) {
    return res.status(200).json({
      success: true,
      message: 'If the email exists, a password reset OTP has been sent.'
    });
  }

  const resetData = createResetToken();

  await prisma.admin.update({
    where: { id: admin.id },
    data: {
      resetPasswordToken: resetData.resetPasswordToken,
      resetPasswordOtp: resetData.resetPasswordOtp,
      resetPasswordExpire: resetData.resetPasswordExpire
    }
  });

  await sendPasswordResetOtp(admin.email, resetData.otp);

  res.status(200).json({
    success: true,
    message: 'If the email exists, a password reset OTP has been sent.'
  });
});

export const resetPassword = asyncHandler(async (req, res) => {
  const hashedOtp = crypto.createHash('sha256').update(req.body.otp).digest('hex');

  const admin = await prisma.admin.findFirst({
    where: {
      email: req.body.email.toLowerCase(),
      resetPasswordOtp: hashedOtp,
      resetPasswordExpire: {
        gt: new Date()
      }
    }
  });

  if (!admin) {
    throw new AppError('Invalid or expired OTP.', 400);
  }

  const updatedAdmin = await prisma.admin.update({
    where: { id: admin.id },
    data: {
      password: await hashPassword(req.body.password),
      resetPasswordToken: null,
      resetPasswordOtp: null,
      resetPasswordExpire: null
    }
  });

  sendAuthResponse(res, 200, updatedAdmin);
});

export const createAdmin = registerAdmin;
