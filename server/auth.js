import crypto from 'crypto';

// In-memory active sessions map with expiry
// token -> { id, userId, role, email, expiresAt, rememberMe, createdAt }
const sessions = new Map();

// In-memory login rate limiter: IP -> { attempts, lockedUntil }
const loginAttempts = new Map();

/**
 * Hash a plain password using PBKDF2/scrypt with random 16-byte salt
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
 * Create a new cryptographically secure session
 */
export function createSession(user, rememberMe = false) {
  const token = crypto.randomBytes(32).toString('hex');
  const duration = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000; // 30 days vs 24h
  const session = {
    id: token,
    userId: user.id,
    role: user.role,
    email: user.email,
    rememberMe,
    createdAt: Date.now(),
    expiresAt: Date.now() + duration
  };

  sessions.set(token, session);
  return { token, session };
}

/**
 * Retrieve session by token if still valid
 */
export function getSession(token) {
  if (!token) return null;
  const session = sessions.get(token);
  if (!session) return null;

  if (Date.now() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  return session;
}

/**
 * Destroy session (logout)
 */
export function destroySession(token) {
  if (token) {
    sessions.delete(token);
  }
}

/**
 * Extract token from Authorization header or cookie
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

  // 3. Query param token (e.g. for websockets / download links)
  if (req.query && req.query.token) {
    return req.query.token;
  }

  return null;
}

/**
 * Set HTTP-only session cookie
 */
export function setSessionCookie(res, token, rememberMe = false) {
  const maxAge = rememberMe ? 30 * 24 * 60 * 60 : 24 * 60 * 60;
  // Cookie flags: HttpOnly, Path=/, SameSite=Lax, Max-Age
  res.setHeader(
    'Set-Cookie',
    `cb_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${maxAge}`
  );
}

/**
 * Clear session cookie
 */
export function clearSessionCookie(res) {
  res.setHeader('Set-Cookie', 'cb_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0');
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
 * Rate limiter for login attempts (10 failed attempts / 15 mins)
 */
export function checkLoginRateLimit(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip);

  if (record) {
    if (record.lockedUntil && now < record.lockedUntil) {
      const waitMinutes = Math.ceil((record.lockedUntil - now) / 60000);
      return { allowed: false, message: `Too many failed login attempts. Please try again in ${waitMinutes} minutes.` };
    }
    // Expired lock
    if (record.lockedUntil && now >= record.lockedUntil) {
      loginAttempts.delete(ip);
    }
  }
  return { allowed: true };
}

export function recordFailedLogin(ip) {
  const now = Date.now();
  const record = loginAttempts.get(ip) || { attempts: 0, firstAttempt: now };
  record.attempts += 1;

  if (record.attempts >= 10) {
    record.lockedUntil = now + 15 * 60 * 1000; // 15 mins lock
  }
  loginAttempts.set(ip, record);
}

export function resetLoginAttempts(ip) {
  loginAttempts.delete(ip);
}
