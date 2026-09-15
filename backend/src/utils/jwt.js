import jwt from 'jsonwebtoken';
import AppError from './AppError.js';

function ensureJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new AppError('JWT_SECRET is required for authenticated sessions.', 503);
  }

  return secret;
}

export function signToken(payload) {
  return jwt.sign(payload, ensureJwtSecret(), {
    expiresIn: process.env.JWT_EXPIRE || '7d'
  });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, ensureJwtSecret());
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw new AppError('Authentication token has expired.', 401);
    }

    throw new AppError('Authentication token is invalid.', 401);
  }
}
