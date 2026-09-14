import crypto from 'crypto';
import compression from 'compression';
import helmet from 'helmet';
import AppError from '../utils/AppError.js';

const SAFE_METHODS = new Set(['GET', 'HEAD', 'OPTIONS']);
const DEFAULT_ALLOWED_ORIGINS = ['http://localhost:5173', 'http://127.0.0.1:5173'];
const SQL_INJECTION_PATTERN =
  /(\b(select|insert|update|delete|drop|alter|truncate|union|exec|execute)\b|--|;|\/\*|\*\/)/i;
const SCRIPT_PATTERN = /<\s*script|javascript:|onerror\s*=|onload\s*=/i;

function parseAllowedOrigins() {
  return (process.env.CLIENT_URLS || process.env.CLIENT_URL || '')
    .split(',')
    .map((origin) => origin.trim())
    .filter(Boolean);
}

function sanitizeString(value) {
  if (!SCRIPT_PATTERN.test(value)) {
    return value;
  }

  return value
    .replace(/<\s*script/gi, '&lt;script')
    .replace(/<\/\s*script\s*>/gi, '&lt;/script&gt;')
    .replace(/javascript:/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onload\s*=/gi, '');
}

function sanitizeValue(value) {
  if (typeof value === 'string') {
    return sanitizeString(value);
  }

  if (Array.isArray(value)) {
    return value.map(sanitizeValue);
  }

  if (value && typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([key, nestedValue]) => [key, sanitizeValue(nestedValue)])
    );
  }

  return value;
}

function sanitizeObjectInPlace(target) {
  if (!target || typeof target !== 'object') {
    return;
  }

  Object.keys(target).forEach((key) => {
    target[key] = sanitizeValue(target[key]);
  });
}

function hasSqlPattern(value) {
  if (typeof value === 'string') {
    return SQL_INJECTION_PATTERN.test(value);
  }

  if (Array.isArray(value)) {
    return value.some(hasSqlPattern);
  }

  if (value && typeof value === 'object') {
    return Object.values(value).some(hasSqlPattern);
  }

  return false;
}

export function securityHeaders() {
  return helmet({
    crossOriginResourcePolicy: { policy: 'cross-origin' },
    contentSecurityPolicy: {
      useDefaults: true,
      directives: {
        'default-src': ["'self'"],
        'img-src': ["'self'", 'data:', 'https://res.cloudinary.com'],
        'script-src': ["'self'"],
        'style-src': ["'self'", "'unsafe-inline'"],
        'connect-src': ["'self'", process.env.CLIENT_URL || 'http://localhost:5173']
      }
    }
  });
}

export function compressionMiddleware() {
  return compression({
    threshold: 1024
  });
}

export function corsOptions() {
  const configuredOrigins = parseAllowedOrigins();
  const allowedOrigins = configuredOrigins.length > 0 ? configuredOrigins : DEFAULT_ALLOWED_ORIGINS;

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }

      callback(new AppError('CORS policy blocked this origin.', 403));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-CSRF-Token']
  };
}

export function xssSanitizer(req, res, next) {
  sanitizeObjectInPlace(req.body);
  sanitizeObjectInPlace(req.query);
  sanitizeObjectInPlace(req.params);
  next();
}

export function sqlInjectionGuard(req, res, next) {
  if (hasSqlPattern(req.query) || hasSqlPattern(req.params)) {
    return next(new AppError('Request contains unsafe query patterns.', 400));
  }

  next();
}

export function csrfTokenHandler(req, res) {
  const token = crypto.randomBytes(32).toString('hex');

  res.cookie('csrf_token', token, {
    httpOnly: false,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 60 * 60 * 1000
  });

  res.status(200).json({
    success: true,
    csrfToken: token
  });
}

export function csrfProtection(req, res, next) {
  if (process.env.CSRF_PROTECTION !== 'true' || SAFE_METHODS.has(req.method)) {
    return next();
  }

  const cookieToken = req.cookies?.csrf_token;
  const headerToken = req.get('X-CSRF-Token');

  if (!cookieToken || !headerToken || cookieToken !== headerToken) {
    return next(new AppError('Invalid CSRF token.', 403));
  }

  next();
}
