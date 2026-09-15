import rateLimit from 'express-rate-limit';

const loginWindowMs = Number(process.env.LOGIN_RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000;
const loginLimit = Number(process.env.LOGIN_RATE_LIMIT_MAX) || 5;

export const loginRateLimiter = rateLimit({
  windowMs: loginWindowMs,
  limit: loginLimit,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many login attempts. Please try again after 15 minutes.'
  }
});

export const inquiryRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many inquiry submissions. Please try again later.'
  }
});
