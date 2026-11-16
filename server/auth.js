import crypto from 'crypto';
import db from './database/db.js';
import { COLLECTIONS } from './database/schema.js';

// In-memory active session cache
// token -> session object
const sessionCache = new Map();

// In-memory rate limiters: key -> { attempts, lockedUntil, resetAt }
const rateLimiters = new Map();

/**
 * Hash a plain password using scrypt with random 16-byte salt
 */
export function hashPassword(password) {
  if (!password || typeof password !== 'string') {
    throw new Error('Password must be a non-empty string');
  }
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

/**
 * Securely verify password with timing-safe comparison
 */
export function verifyPassword(password, storedHash) {
  if (!password || !storedHash || typeof storedHash !== 'string' || !storedHash.includes(':')) {
    return false;
  }
  try {
    const [salt, key] = storedHash.split(':');
    const keyBuffer = Buffer.from(key, 'hex');
    const derivedKey = crypto.scryptSync(password, salt, 64);
    if (keyBuffer.length !== derivedKey.length) {
      return false;
    }
    return crypto.timingSafeEqual(keyBuffer, derivedKey);
  } catch (err) {
    return false;
  }
}

/**
 * Create a new cryptographically secure session and persist to database
 */
export function createSession(user, rememberMe = false, ip = 'unknown', userAgent = '') {
  const token = crypto.randomBytes(32).toString('hex');
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 24h
  const now = Date.now();

  const session = {
    id: token,
    userId: user.id,
    role: user.role,
    email: user.email,
    rememberMe: !!rememberMe,
    createdAt: now,
    expiresAt: now + duration,
    ip,
    userAgent
  };

  // 1. Save to in-memory cache
  sessionCache.set(token, session);

  // 2. Persist to database sessions collection
  try {
    db.collection(COLLECTIONS.SESSIONS).insert(session);
  } catch (err) {
    // Session already exists or fallback
  }

  return { token, session };
}

/**
 * Retrieve session by token if still valid
 * Checks cache first, then database
 */
export function getSession(token) {
  if (!token || typeof token !== 'string') return null;

  const now = Date.now();

  // 1. Check cache
  let session = sessionCache.get(token);

  // 2. Fallback to database
  if (!session) {
    try {
      session = db.collection(COLLECTIONS.SESSIONS).findOne({ id: token });
      if (session) {
        sessionCache.set(token, session);
      }
    } catch {
      return null;
    }
  }

  if (!session) return null;

  // Check expiration
  if (now > session.expiresAt) {
    destroySession(token);
    return null;
  }

  return session;
}

/**
 * Destroy session (logout/revocation)
 */
export function destroySession(token) {
  if (!token) return;

  // Evict from cache
  sessionCache.delete(token);

  // Remove from database
  try {
    db.collection(COLLECTIONS.SESSIONS).deleteOne({ id: token });
  } catch {
    // Ignore error
  }
}

/**
 * Extract token STRICTLY from Authorization header or HTTP-only cookie.
 * NEVER accepts session tokens from URL query parameters.
 */
export function extractToken(req) {
  // 1. Authorization: Bearer <token>
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  // 2. Cookie header: cb_session=<token>
  const cookieHeader = req.headers.cookie;
  if (cookieHeader) {
    const cookies = cookieHeader.split(';').map(c => c.trim());
    for (const cookie of cookies) {
      if (cookie.startsWith('cb_session=')) {
        return cookie.substring('cb_session='.length).trim();
      }
    }
  }

  // Tokens in query parameters are strictly rejected for security
  return null;
}

/**
 * Set HTTP-only, SameSite session cookie with optional Secure flag in production
 */
export function setSessionCookie(res, token, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? '; Secure' : '';

  res.setHeader(
    'Set-Cookie',
    `cb_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}${secureFlag}`
  );
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(res) {
  const isProd = process.env.NODE_ENV === 'production';
  const secureFlag = isProd ? '; Secure' : '';
  res.setHeader('Set-Cookie', `cb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0${secureFlag}`);
}

/**
 * Strip sensitive security fields before returning to client
 */
export function sanitizeUser(user) {
  if (!user) return null;
  const { passwordHash, ...safe } = user;
  return safe;
}

/**
 * Generalized Rate Limiter
 */
export function checkRateLimit(ip, action = 'login', maxAttempts = 10, windowMs = 15 * 60 * 1000) {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const record = rateLimiters.get(key);

  if (record) {
    if (record.lockedUntil && now < record.lockedUntil) {
      const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return {
        allowed: false,
        message: `Too many failed attempts. Please try again in ${waitMinutes} minutes.`
      };
    }
    if (record.lockedUntil && now >= record.lockedUntil) {
      rateLimiters.delete(key);
    }
  }

  return { allowed: true };
}

export function recordFailedAttempt(ip, action = 'login', maxAttempts = 10, lockDurationMs = 15 * 60 * 1000) {
  const key = `${action}:${ip}`;
  const now = Date.now();
  const record = rateLimiters.get(key) || { attempts: 0, firstAttempt: now };
  record.attempts += 1;

  if (record.attempts >= maxAttempts) {
    record.lockedUntil = now + lockDurationMs;
  }
  rateLimiters.set(key, record);
}

export function resetRateLimit(ip, action = 'login') {
  const key = `${action}:${ip}`;
  rateLimiters.delete(key);
}

// Backward compatibility alias functions
export const checkLoginRateLimit = (ip) => checkRateLimit(ip, 'login', 10, 15 * 60 * 1000);
export const recordFailedLogin = (ip) => recordFailedAttempt(ip, 'login', 10, 15 * 60 * 1000);
export const resetLoginAttempts = (ip) => resetRateLimit(ip, 'login');

/**
 * Record an audit log entry
 */
export function recordAuditLog({ userId, action, resource, resourceId, details, ip }) {
  try {
    const entry = {
      id: 'audit_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      userId: userId || 'anonymous',
      action,
      resource,
      resourceId: resourceId || '',
      details: details || {},
      ip: ip || 'unknown',
      timestamp: new Date().toISOString()
    };
    db.collection(COLLECTIONS.AUDIT_LOGS).insert(entry);
  } catch (err) {
    console.error('Audit log failed:', err.message);
  }
}
