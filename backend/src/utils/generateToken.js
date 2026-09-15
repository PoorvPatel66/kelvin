import jwt from 'jsonwebtoken';

function ensureJwtSecret() {
  const secret = process.env.JWT_SECRET?.trim();

  if (!secret) {
    throw new Error('JWT_SECRET is required for authenticated admin sessions.');
  }

  return secret;
}

export function generateToken(admin) {
  return jwt.sign(
    {
      id: admin.id,
      email: admin.email,
      role: admin.role
    },
    ensureJwtSecret(),
    {
      expiresIn: process.env.JWT_EXPIRE || '7d'
    }
  );
}

export function setTokenCookie(res, token) {
  const cookieExpireDays = Number(process.env.COOKIE_EXPIRE || 7);

  res.cookie('token', token, {
    expires: new Date(Date.now() + cookieExpireDays * 24 * 60 * 60 * 1000),
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax'
  });
}
