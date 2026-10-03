/**
 * Server-Side Cryptographic Telegram Authentication & Authorization
 * Compliant with Telegram WebApp Protocol (HMAC-SHA256 data-check-string)
 * Prevents header spoofing, replay attacks, timing attacks, and IDOR.
 */

import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export const ADMIN_NUMERICAL_ID = '291775184';
export const ADMIN_USERNAME = 'av_abbas';

export interface TelegramAuthUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  language_code?: string;
  is_premium?: boolean;
}

export interface AuthenticatedRequest extends Request {
  telegramUser?: TelegramAuthUser;
}

/**
 * Validates Telegram WebApp initData string using Telegram's official HMAC-SHA256 protocol.
 * - Enforces HMAC-SHA256 signature verification with timing-safe comparison.
 * - Rejects expired signatures (maxAgeSeconds, default 24h) and future timestamps (clock skew > 60s).
 * - Guards against malformed or duplicate parameter injection.
 */
export function validateTelegramInitData(
  initData: string,
  botToken: string,
  options: { maxAgeSeconds?: number } = {}
): { isValid: boolean; user?: TelegramAuthUser; error?: string } {
  if (!initData || typeof initData !== 'string') {
    return { isValid: false, error: 'Empty or invalid initData string' };
  }

  if (!botToken || typeof botToken !== 'string') {
    return { isValid: false, error: 'Bot token not provided' };
  }

  try {
    const params = new URLSearchParams(initData);
    const hash = params.get('hash');
    if (!hash || typeof hash !== 'string' || hash.length !== 64) {
      return { isValid: false, error: 'Missing or malformed hash in initData' };
    }

    // Check expiration and future clock-skew
    const authDateStr = params.get('auth_date');
    if (!authDateStr) {
      return { isValid: false, error: 'Missing auth_date in initData' };
    }

    const authDate = parseInt(authDateStr, 10);
    if (isNaN(authDate) || authDate <= 0) {
      return { isValid: false, error: 'Invalid auth_date format' };
    }

    const currentTime = Math.floor(Date.now() / 1000);
    const maxAge = options.maxAgeSeconds ?? 86400; // 24 hours

    if (currentTime - authDate > maxAge) {
      return { isValid: false, error: 'Telegram initData has expired' };
    }

    if (authDate > currentTime + 60) {
      return { isValid: false, error: 'auth_date cannot be in the future' };
    }

    params.delete('hash');

    // Sort parameters alphabetically
    const dataCheckArr: string[] = [];
    params.forEach((value, key) => {
      dataCheckArr.push(`${key}=${value}`);
    });
    dataCheckArr.sort();
    const dataCheckString = dataCheckArr.join('\n');

    // secret_key = HMAC_SHA256("WebAppData", botToken)
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(botToken).digest();

    // calculated_hash = HMAC_SHA256(secret_key, data_check_string)
    const calculatedHash = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');

    // Timing-safe comparison to prevent side-channel timing attacks
    const calculatedHashBuf = Buffer.from(calculatedHash, 'hex');
    const hashBuf = Buffer.from(hash, 'hex');

    if (calculatedHashBuf.length !== hashBuf.length || !crypto.timingSafeEqual(calculatedHashBuf, hashBuf)) {
      return { isValid: false, error: 'Hash signature mismatch' };
    }

    const userStr = params.get('user');
    if (!userStr) {
      return { isValid: false, error: 'Missing user payload in verified initData' };
    }

    const user: TelegramAuthUser = JSON.parse(userStr);
    if (!user || typeof user.id !== 'number' || isNaN(user.id)) {
      return { isValid: false, error: 'Invalid user structure in initData' };
    }

    return { isValid: true, user };
  } catch (err: any) {
    return { isValid: false, error: err?.message || 'Verification exception' };
  }
}

/**
 * Express Middleware: requireTelegramUser
 * Verifies that the incoming request originated from an authentic Telegram user session.
 * In production, strictly enforces cryptographic signature check.
 */
export function requireTelegramUser(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const botToken = process.env.TELEGRAM_BOT_TOKEN;
  const isProd = process.env.NODE_ENV === 'production';

  // Extract initData from Authorization header or custom header
  const authHeader = req.headers['authorization'];
  let initData = '';
  if (authHeader && authHeader.startsWith('Bearer ')) {
    initData = authHeader.slice(7).trim();
  } else {
    initData = String(req.headers['x-telegram-init-data'] || '').trim();
  }

  // 1. If Telegram bot token is present and initData supplied, verify cryptographically
  if (botToken && initData) {
    const verification = validateTelegramInitData(initData, botToken);
    if (verification.isValid && verification.user) {
      req.telegramUser = verification.user;
      return next();
    }
  }

  // 2. Controlled Development fallback (NEVER PERMITTED IN PRODUCTION)
  if (!isProd && (!botToken || process.env.ALLOW_DEV_AUTH_BYPASS === 'true')) {
    const devUserId = req.headers['x-dev-mock-telegram-id'];
    const devUsername = req.headers['x-dev-mock-username'];
    if (devUserId) {
      req.telegramUser = {
        id: Number(devUserId) || 100000000,
        first_name: 'Dev User',
        username: devUsername ? String(devUsername) : undefined,
      };
      return next();
    }
  }

  // 3. Reject if unverified
  res.status(401).json({
    error: 'Unauthorized: Cryptographically verified Telegram initData is required',
    code: 'TELEGRAM_AUTH_REQUIRED',
  });
}

/**
 * Checks whether the verified user is the designated system administrator.
 * Security Rule: Immutable numeric Telegram ID is the ONLY security credential.
 * Username is NEVER an independent authorization bypass.
 */
export function isVerifiedAdmin(user?: TelegramAuthUser): boolean {
  if (!user || !user.id) return false;
  return String(user.id) === ADMIN_NUMERICAL_ID;
}

/**
 * Express Middleware: requireAdmin
 * Strictly verifies that the authenticated user is the designated administrator (291775184).
 */
export function requireAdmin(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  requireTelegramUser(req, res, () => {
    const user = req.telegramUser;
    if (!user || !isVerifiedAdmin(user)) {
      res.status(403).json({
        error: 'Forbidden: Admin authorization required for this operation',
        code: 'ADMIN_PRIVILEGES_REQUIRED',
      });
      return;
    }
    next();
  });
}

/**
 * Express Middleware: requireResourceOwnerOrAdmin
 * Prevents Insecure Direct Object Reference (IDOR) attacks:
 * A user can ONLY access resources belonging to their verified Telegram ID,
 * unless they are the verified system administrator.
 */
export function requireResourceOwnerOrAdmin(paramName = 'telegramId') {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    requireTelegramUser(req, res, () => {
      const authenticatedUser = req.telegramUser;
      if (!authenticatedUser) {
        res.status(401).json({ error: 'Unauthorized: User authentication required' });
        return;
      }

      const targetId = String(req.params[paramName] || req.body[paramName] || req.query[paramName] || '').trim();

      const isOwner = targetId && String(authenticatedUser.id) === targetId;
      const isAdmin = isVerifiedAdmin(authenticatedUser);

      if (!isOwner && !isAdmin) {
        res.status(403).json({
          error: 'Forbidden: You do not have permission to access another user\'s resources',
          code: 'RESOURCE_ACCESS_DENIED',
        });
        return;
      }

      next();
    });
  };
}
