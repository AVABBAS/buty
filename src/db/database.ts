import fs from 'fs';
import path from 'path';
import pg from 'pg';

const { Pool } = pg;

export interface UserSyncPayload {
  telegramId: string;
  firstName?: string;
  username?: string;
  dna?: any;
  closet?: any[];
  shelf?: any[];
  savedLooks?: any[];
  subscription?: any;
}

export function isSafeId(id: unknown): id is string {
  if (typeof id !== 'string' && typeof id !== 'number') return false;
  const str = String(id).trim();
  if (!str || str.length > 64) return false;
  if (str === '__proto__' || str === 'constructor' || str === 'prototype') return false;
  return /^[a-zA-Z0-9_\-]{1,64}$/.test(str);
}

export interface DbStatus {
  type: 'postgresql' | 'embedded';
  connected: boolean;
  totalUsers: number;
  totalLooks: number;
  isNeon?: boolean;
}

// -------------------------------------------------------------
// Database Engine
// -------------------------------------------------------------
class DatabaseService {
  private pgPool: pg.Pool | null = null;
  private isPostgres = false;
  private embeddedFilePath: string;
  private embeddedData: {
    users: Record<string, { firstName?: string; username?: string; lastActive: string }>;
    dna: Record<string, any>;
    closet: Record<string, any[]>;
    shelf: Record<string, any[]>;
    savedLooks: Record<string, any[]>;
    subscriptions: Record<string, any>;
  } = {
    users: {},
    dna: {},
    closet: {},
    shelf: {},
    savedLooks: {},
    subscriptions: {},
  };

  constructor() {
    const dataDir = path.resolve(process.cwd(), 'data');
    if (!fs.existsSync(dataDir)) {
      try {
        fs.mkdirSync(dataDir, { recursive: true });
      } catch {
        // Ignore
      }
    }
    this.embeddedFilePath = path.resolve(dataDir, 'ayna_database.json');
  }

  private saveTimeout: NodeJS.Timeout | null = null;

  async init(): Promise<void> {
    const dbUrl = process.env.DATABASE_URL;

    if (dbUrl && (dbUrl.startsWith('postgres://') || dbUrl.startsWith('postgresql://'))) {
      try {
        const isNeon = dbUrl.includes('neon.tech');
        const isRemote = !dbUrl.includes('localhost') && !dbUrl.includes('127.0.0.1');
        const requiresSsl = isNeon || dbUrl.includes('sslmode=require') || isRemote;

        this.pgPool = new Pool({
          connectionString: dbUrl,
          ssl: requiresSsl ? { rejectUnauthorized: false } : undefined,
          max: Number(process.env.PG_MAX_POOL) || 20, // Neon recommended pooling for serverless
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000, // 10s gives Neon time to wake up compute from sleep
        });

        // Prevent idle client errors from crashing the process
        this.pgPool.on('error', (err: any) => {
          console.warn('⚠️ Unexpected PostgreSQL pool client error (Neon auto-recovery):', err?.message || err);
        });

        // Test connection with retry (useful if Neon is waking up from scale-to-zero)
        let connected = false;
        let attempts = 0;
        const maxAttempts = 3;

        while (!connected && attempts < maxAttempts) {
          try {
            attempts++;
            await this.pgPool.query('SELECT 1');
            connected = true;
          } catch (connErr) {
            console.warn(`⏳ Waiting for PostgreSQL/Neon database to respond (attempt ${attempts}/${maxAttempts})...`);
            if (attempts >= maxAttempts) throw connErr;
            await new Promise((res) => setTimeout(res, 2000));
          }
        }

        // Test connection, create tables and high-speed indexes
        await this.pgPool.query(`
          CREATE TABLE IF NOT EXISTS ayna_users (
            telegram_id VARCHAR(64) PRIMARY KEY,
            first_name TEXT,
            username TEXT,
            last_active TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS ayna_user_data (
            telegram_id VARCHAR(64) PRIMARY KEY,
            dna JSONB,
            closet JSONB,
            shelf JSONB,
            saved_looks JSONB,
            subscription JSONB,
            updated_at TIMESTAMP DEFAULT NOW()
          );

          ALTER TABLE ayna_user_data ADD COLUMN IF NOT EXISTS subscription JSONB;

          CREATE TABLE IF NOT EXISTS ayna_subscriptions (
            telegram_id VARCHAR(64) PRIMARY KEY,
            tier VARCHAR(32) NOT NULL,
            is_active BOOLEAN DEFAULT TRUE,
            plan_name TEXT,
            payment_method VARCHAR(32),
            expires_at TIMESTAMP,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );

          CREATE INDEX IF NOT EXISTS idx_ayna_users_last_active ON ayna_users(last_active);
          CREATE INDEX IF NOT EXISTS idx_ayna_user_data_updated ON ayna_user_data(updated_at);
          CREATE INDEX IF NOT EXISTS idx_ayna_subscriptions_active ON ayna_subscriptions(is_active);
        `);

        this.isPostgres = true;
        console.log(`✅ Connected to ${isNeon ? 'Neon Serverless PostgreSQL' : 'PostgreSQL'} database successfully with connection pooling and indexes!`);
        return;
      } catch (err) {
        console.warn('⚠️ PostgreSQL connection failed, falling back to embedded persistent database:', err);
        this.pgPool = null;
        this.isPostgres = false;
      }
    }

    // Embedded Persistent Database Mode
    this.loadEmbeddedData();
    console.log(`📦 Embedded persistent database initialized at ${this.embeddedFilePath}`);
  }

  private loadEmbeddedData() {
    try {
      if (fs.existsSync(this.embeddedFilePath)) {
        const raw = fs.readFileSync(this.embeddedFilePath, 'utf-8');
        this.embeddedData = JSON.parse(raw);
        if (!this.embeddedData.subscriptions) {
          this.embeddedData.subscriptions = {};
        }
      } else {
        this.saveEmbeddedData();
      }
    } catch (e) {
      console.warn('Failed to load embedded DB file, resetting to empty state:', e);
      this.embeddedData = { users: {}, dna: {}, closet: {}, shelf: {}, savedLooks: {}, subscriptions: {} };
    }
  }

  // Non-blocking, debounced disk flush to keep the Node.js event loop free
  private saveEmbeddedData() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(async () => {
      try {
        const tempPath = `${this.embeddedFilePath}.tmp`;
        await fs.promises.writeFile(tempPath, JSON.stringify(this.embeddedData), 'utf-8');
        await fs.promises.rename(tempPath, this.embeddedFilePath);
      } catch (e) {
        console.error('Failed to write embedded database to disk asynchronously:', e);
      }
    }, 120);
  }

  async syncUserData(payload: UserSyncPayload): Promise<boolean> {
    const { telegramId, firstName, username, dna, closet, shelf, savedLooks } = payload;
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ayna_users (telegram_id, first_name, username, last_active)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             first_name = COALESCE($2, ayna_users.first_name),
             username = COALESCE($3, ayna_users.username),
             last_active = NOW()`,
          [telegramId, firstName || null, username || null]
        );

        await this.pgPool.query(
          `INSERT INTO ayna_user_data (telegram_id, dna, closet, shelf, saved_looks, updated_at)
           VALUES ($1, $2, $3, $4, $5, NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             dna = COALESCE($2, ayna_user_data.dna),
             closet = COALESCE($3, ayna_user_data.closet),
             shelf = COALESCE($4, ayna_user_data.shelf),
             saved_looks = COALESCE($5, ayna_user_data.saved_looks),
             updated_at = NOW()`,
          [
            telegramId,
            dna ? JSON.stringify(dna) : null,
            closet ? JSON.stringify(closet) : null,
            shelf ? JSON.stringify(shelf) : null,
            savedLooks ? JSON.stringify(savedLooks) : null,
          ]
        );
        return true;
      } catch (err) {
        console.error('PostgreSQL sync error:', err);
        return false;
      }
    }

    // Embedded fallback
    const now = new Date().toISOString();
    this.embeddedData.users[telegramId] = {
      firstName: firstName || this.embeddedData.users[telegramId]?.firstName,
      username: username || this.embeddedData.users[telegramId]?.username,
      lastActive: now,
    };

    if (dna) this.embeddedData.dna[telegramId] = dna;
    if (closet) this.embeddedData.closet[telegramId] = closet;
    if (shelf) this.embeddedData.shelf[telegramId] = shelf;
    if (savedLooks) this.embeddedData.savedLooks[telegramId] = savedLooks;
    if (payload.subscription) this.embeddedData.subscriptions[telegramId] = payload.subscription;

    this.saveEmbeddedData();
    return true;
  }

  async getUserData(telegramId: string): Promise<{
    dna?: any;
    closet?: any[];
    shelf?: any[];
    savedLooks?: any[];
    subscription?: any;
    profile?: any;
  } | null> {
    if (!isSafeId(telegramId)) return null;

    if (this.isPostgres && this.pgPool) {
      try {
        const userRes = await this.pgPool.query(`SELECT * FROM ayna_users WHERE telegram_id = $1`, [telegramId]);
        const dataRes = await this.pgPool.query(`SELECT * FROM ayna_user_data WHERE telegram_id = $1`, [telegramId]);

        const profile = userRes.rows[0] || null;
        const data = dataRes.rows[0] || {};

        return {
          profile,
          dna: data.dna || undefined,
          closet: data.closet || undefined,
          shelf: data.shelf || undefined,
          savedLooks: data.saved_looks || undefined,
          subscription: data.subscription || undefined,
        };
      } catch (err) {
        console.error('PostgreSQL fetch error:', err);
        return null;
      }
    }

    // Embedded Mode
    const profile = this.embeddedData.users[telegramId];
    if (!profile) return null;

    return {
      profile,
      dna: this.embeddedData.dna[telegramId],
      closet: this.embeddedData.closet[telegramId],
      shelf: this.embeddedData.shelf[telegramId],
      savedLooks: this.embeddedData.savedLooks[telegramId],
      subscription: this.embeddedData.subscriptions[telegramId] || null,
    };
  }

  async getStatus(): Promise<DbStatus> {
    if (this.isPostgres && this.pgPool) {
      try {
        const usersCountRes = await this.pgPool.query(`SELECT COUNT(*) FROM ayna_users`);
        const looksCountRes = await this.pgPool.query(
          `SELECT SUM(jsonb_array_length(saved_looks)) as total FROM ayna_user_data WHERE saved_looks IS NOT NULL`
        );
        return {
          type: 'postgresql',
          connected: true,
          totalUsers: parseInt(usersCountRes.rows[0]?.count || '0', 10),
          totalLooks: parseInt(looksCountRes.rows[0]?.total || '0', 10),
          isNeon: Boolean(process.env.DATABASE_URL?.includes('neon.tech')),
        };
      } catch {
        return {
          type: 'postgresql',
          connected: false,
          totalUsers: 0,
          totalLooks: 0,
          isNeon: Boolean(process.env.DATABASE_URL?.includes('neon.tech')),
        };
      }
    }

    const totalUsers = Object.keys(this.embeddedData.users).length;
    let totalLooks = 0;
    Object.values(this.embeddedData.savedLooks).forEach((looks) => {
      if (Array.isArray(looks)) totalLooks += looks.length;
    });

    return {
      type: 'embedded',
      connected: true,
      totalUsers,
      totalLooks,
    };
  }

  async deleteUserData(telegramId: string): Promise<boolean> {
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(`DELETE FROM ayna_subscriptions WHERE telegram_id = $1`, [telegramId]);
        await this.pgPool.query(`DELETE FROM ayna_user_data WHERE telegram_id = $1`, [telegramId]);
        await this.pgPool.query(`DELETE FROM ayna_users WHERE telegram_id = $1`, [telegramId]);
        return true;
      } catch (err) {
        console.error('PostgreSQL delete error:', err);
        return false;
      }
    }

    delete this.embeddedData.users[telegramId];
    delete this.embeddedData.dna[telegramId];
    delete this.embeddedData.closet[telegramId];
    delete this.embeddedData.shelf[telegramId];
    delete this.embeddedData.savedLooks[telegramId];
    delete this.embeddedData.subscriptions[telegramId];
    this.saveEmbeddedData();
    return true;
  }

  async getAllUsers(limit = 100): Promise<Array<{
    telegramId: string;
    firstName?: string;
    username?: string;
    lastActive: string;
    looksCount?: number;
    closetCount?: number;
  }>> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT u.telegram_id, u.first_name, u.username, u.last_active,
                  COALESCE(jsonb_array_length(d.saved_looks), 0) as looks_count,
                  COALESCE(jsonb_array_length(d.closet), 0) as closet_count
           FROM ayna_users u
           LEFT JOIN ayna_user_data d ON u.telegram_id = d.telegram_id
           ORDER BY u.last_active DESC
           LIMIT $1`,
          [limit]
        );
        return res.rows.map((r) => ({
          telegramId: r.telegram_id,
          firstName: r.first_name,
          username: r.username,
          lastActive: r.last_active,
          looksCount: parseInt(r.looks_count || '0', 10),
          closetCount: parseInt(r.closet_count || '0', 10),
        }));
      } catch (e) {
        console.error('Failed to get users from Postgres:', e);
        return [];
      }
    }

    // Embedded mode
    const list = Object.entries(this.embeddedData.users).map(([id, u]) => ({
      telegramId: id,
      firstName: u.firstName,
      username: u.username,
      lastActive: u.lastActive,
      looksCount: Array.isArray(this.embeddedData.savedLooks[id]) ? this.embeddedData.savedLooks[id].length : 0,
      closetCount: Array.isArray(this.embeddedData.closet[id]) ? this.embeddedData.closet[id].length : 0,
    }));

    return list.slice(0, limit);
  }

  async getDatabaseSnapshot(): Promise<any> {
    if (this.isPostgres && this.pgPool) {
      try {
        const usersRes = await this.pgPool.query(`SELECT * FROM ayna_users LIMIT 500`);
        const dataRes = await this.pgPool.query(`SELECT * FROM ayna_user_data LIMIT 500`);
        return {
          timestamp: new Date().toISOString(),
          engine: 'postgresql',
          users: usersRes.rows,
          userData: dataRes.rows,
        };
      } catch (e) {
        return { error: 'Failed to snapshot postgres' };
      }
    }
    return {
      timestamp: new Date().toISOString(),
      engine: 'embedded',
      data: this.embeddedData,
    };
  }

  async setSubscription(telegramId: string, subscription: any): Promise<boolean> {
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ayna_subscriptions (telegram_id, tier, is_active, plan_name, payment_method, expires_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             tier = $2,
             is_active = $3,
             plan_name = $4,
             payment_method = $5,
             expires_at = $6,
             updated_at = NOW()`,
          [
            telegramId,
            subscription.tier || 'vip',
            subscription.isActive !== false,
            subscription.planName || null,
            subscription.paymentMethod || null,
            subscription.expiresAt ? new Date(subscription.expiresAt) : null,
          ]
        );

        await this.pgPool.query(
          `INSERT INTO ayna_user_data (telegram_id, subscription, updated_at)
           VALUES ($1, $2, NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             subscription = $2,
             updated_at = NOW()`,
          [telegramId, JSON.stringify(subscription)]
        );
        return true;
      } catch (err) {
        console.error('PostgreSQL setSubscription error:', err);
        return false;
      }
    }

    this.embeddedData.subscriptions[telegramId] = subscription;
    this.saveEmbeddedData();
    return true;
  }

  async getSubscription(telegramId: string): Promise<any | null> {
    if (!isSafeId(telegramId)) return null;

    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT subscription FROM ayna_user_data WHERE telegram_id = $1`,
          [telegramId]
        );
        if (res.rows[0]?.subscription) {
          return res.rows[0].subscription;
        }
        const subRes = await this.pgPool.query(
          `SELECT * FROM ayna_subscriptions WHERE telegram_id = $1`,
          [telegramId]
        );
        if (subRes.rows[0]) {
          const row = subRes.rows[0];
          return {
            tier: row.tier,
            isActive: row.is_active,
            expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
            planName: row.plan_name,
            paymentMethod: row.payment_method,
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getSubscription error:', err);
        return null;
      }
    }

    return this.embeddedData.subscriptions[telegramId] || null;
  }

  async getAllSubscriptions(): Promise<Array<{ telegramId: string; subscription: any; user?: any }>> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT s.*, u.first_name, u.username
           FROM ayna_subscriptions s
           LEFT JOIN ayna_users u ON s.telegram_id = u.telegram_id
           ORDER BY s.updated_at DESC`
        );
        return res.rows.map((row: any) => ({
          telegramId: row.telegram_id,
          subscription: {
            tier: row.tier,
            isActive: row.is_active,
            expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
            planName: row.plan_name,
            paymentMethod: row.payment_method,
          },
          user: {
            firstName: row.first_name,
            username: row.username,
          },
        }));
      } catch (err) {
        console.error('PostgreSQL getAllSubscriptions error:', err);
        return [];
      }
    }

    return Object.entries(this.embeddedData.subscriptions).map(([id, sub]) => ({
      telegramId: id,
      subscription: sub,
      user: this.embeddedData.users[id] || null,
    }));
  }
}

export const db = new DatabaseService();
