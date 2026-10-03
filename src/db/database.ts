import fs from 'fs';
import path from 'path';
import pg from 'pg';
import {
  UserContext,
  BeautyDna,
  ClosetItem,
  BeautyProductItem,
  SavedLook,
  UserSubscription,
  UserPreferences,
  ExtendedStyleDNA,
  ColorDNA,
} from '../types/index.js';

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

const DEFAULT_BEAUTY_DNA: BeautyDna = {
  faceShape: 'oval',
  skinType: 'balanced',
  hairTexture: 'wavy',
  hairLength: 'medium',
  undertone: 'neutral',
  dailyRoutineTime: 10,
  primaryGoal: 'آراستگی سریع و راحت متناسب با سبک زندگی من',
  styleDna: {
    minimalVsMaximal: 35,
    colorfulVsNeutral: 30,
    boldVsSubtle: 45,
    feminineVsStructured: 55,
    comfortVsFashion: 70,
    primaryArchetype: 'Classic Chic',
    secondaryArchetype: 'Minimalist Relaxed',
    preferredPalette: 'خنثی و گرم',
  },
};

const DEFAULT_STYLE_DNA: ExtendedStyleDNA = {
  minimalVsMaximal: 35,
  neutralVsColorful: 30,
  subtleVsBold: 45,
  feminineVsStructured: 55,
  comfortVsFashion: 70,
  classicVsTrendy: 40,
  naturalVsGlamorous: 30,
  primaryArchetype: 'Classic Chic',
  secondaryArchetype: 'Minimalist Relaxed',
  contextualProfiles: {
    everyday: { primaryArchetype: 'Clean Minimal', secondaryArchetype: 'Relaxed', keyRule: 'راحتی با خطوط تمیز' },
    work: { primaryArchetype: 'Structured Chic', secondaryArchetype: 'Smart Casual', keyRule: 'وقار و آراستگی' },
    date: { primaryArchetype: 'Soft Glam', secondaryArchetype: 'Feminine', keyRule: 'درخشش طبیعی و لطافت' },
    party: { primaryArchetype: 'Bold Elegance', secondaryArchetype: 'Statement', keyRule: 'اکسسوری شاخص' },
    photo: { primaryArchetype: 'High Definition', secondaryArchetype: 'Polished', keyRule: 'تمرکز بر کانتور ملایم' },
    travel: { primaryArchetype: 'Capsule Comfort', secondaryArchetype: 'Versatile', keyRule: 'چندمنظوره بودن آیتم‌ها' },
  },
};

const DEFAULT_COLOR_DNA: ColorDNA = {
  favoriteColors: ['کرم', 'شیری', 'طوسی زغالی'],
  dislikedColors: ['نئونی'],
  preferredNeutrals: ['کرم شنی', 'شکلاتی', 'مشکی کربن'],
  accentColors: ['زرشکی', 'سبز زیتونی'],
  flatteringNearFace: ['کرم', 'طوسی روشن'],
  occasionPalettePreferences: {
    everyday: ['کرم', 'سفید', 'طوسی'],
    work: ['سرمه‌ای', 'طوسی', 'کرم'],
    date: ['رز ملایم', 'شکلاتی'],
    party: ['مشکی', 'شرابی'],
    photo: ['رنگ‌های گرم و مات'],
    travel: ['پالت خنثی هماهنگ'],
  },
};

// -------------------------------------------------------------
// Database Engine
// -------------------------------------------------------------
class DatabaseService {
  private pgPool: pg.Pool | null = null;
  private isPostgres = false;
  private embeddedFilePath: string;
  private embeddedData: {
    users: Record<string, { firstName?: string; username?: string; lastActive: string; createdAt: string }>;
    dna: Record<string, any>;
    closet: Record<string, any[]>;
    shelf: Record<string, any[]>;
    savedLooks: Record<string, any[]>;
    subscriptions: Record<string, any>;
    events: Array<{ id: number; telegramId: string; eventType: string; feature?: string; context?: any; metadata?: any; createdAt: string }>;
    preferences: Record<string, { preferences: any; learnedWeights: any; updatedAt: string }>;
    payments: Record<string, any>;
  } = {
    users: {},
    dna: {},
    closet: {},
    shelf: {},
    savedLooks: {},
    subscriptions: {},
    events: [],
    preferences: {},
    payments: {},
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
    const isProd = process.env.NODE_ENV === 'production';

    // Strict Production Hardening: Fail fast if DATABASE_URL is missing in production
    if (isProd && (!dbUrl || (!dbUrl.startsWith('postgres://') && !dbUrl.startsWith('postgresql://')))) {
      console.error('❌ FATAL: Production environment requires a valid DATABASE_URL (Neon PostgreSQL). Silent fallback to embedded JSON is disabled in production.');
      throw new Error('DATABASE_URL is required in production');
    }

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
            last_active TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW()
          );

          ALTER TABLE ayna_users ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT NOW();

          CREATE TABLE IF NOT EXISTS ayna_user_data (
            telegram_id VARCHAR(64) PRIMARY KEY,
            dna JSONB DEFAULT '{}'::jsonb,
            closet JSONB DEFAULT '[]'::jsonb,
            shelf JSONB DEFAULT '[]'::jsonb,
            saved_looks JSONB DEFAULT '[]'::jsonb,
            subscription JSONB,
            updated_at TIMESTAMP DEFAULT NOW()
          );

          ALTER TABLE ayna_user_data ADD COLUMN IF NOT EXISTS subscription JSONB;

          CREATE TABLE IF NOT EXISTS ayna_subscriptions (
            telegram_id VARCHAR(64) PRIMARY KEY,
            tier VARCHAR(32) NOT NULL DEFAULT 'free',
            is_active BOOLEAN NOT NULL DEFAULT TRUE,
            plan_name TEXT,
            payment_method VARCHAR(32),
            expires_at TIMESTAMP,
            started_at TIMESTAMP DEFAULT NOW(),
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );

          ALTER TABLE ayna_subscriptions ADD COLUMN IF NOT EXISTS started_at TIMESTAMP DEFAULT NOW();

          CREATE TABLE IF NOT EXISTS ayna_user_events (
            id BIGSERIAL PRIMARY KEY,
            telegram_id VARCHAR(64) NOT NULL,
            event_type VARCHAR(64) NOT NULL,
            feature VARCHAR(64),
            context JSONB,
            metadata JSONB,
            created_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS ayna_user_preferences (
            telegram_id VARCHAR(64) PRIMARY KEY,
            preferences JSONB NOT NULL DEFAULT '{}'::jsonb,
            learned_weights JSONB NOT NULL DEFAULT '{}'::jsonb,
            updated_at TIMESTAMP DEFAULT NOW()
          );

          CREATE TABLE IF NOT EXISTS ayna_payments (
            id BIGSERIAL PRIMARY KEY,
            telegram_id VARCHAR(64) NOT NULL,
            provider VARCHAR(32) NOT NULL,
            plan_id VARCHAR(32) NOT NULL,
            amount_stars INT,
            amount_toman INT,
            invoice_payload VARCHAR(128) NOT NULL UNIQUE,
            telegram_payment_charge_id VARCHAR(128),
            status VARCHAR(32) NOT NULL DEFAULT 'pending',
            is_anonymized BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT NOW(),
            updated_at TIMESTAMP DEFAULT NOW()
          );

          ALTER TABLE ayna_payments ADD COLUMN IF NOT EXISTS is_anonymized BOOLEAN DEFAULT FALSE;

          -- Safe Foreign Key integrity checks
          DO $$
          BEGIN
            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ayna_user_data_users') THEN
              ALTER TABLE ayna_user_data
              ADD CONSTRAINT fk_ayna_user_data_users
              FOREIGN KEY (telegram_id) REFERENCES ayna_users(telegram_id) ON DELETE CASCADE;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ayna_subscriptions_users') THEN
              ALTER TABLE ayna_subscriptions
              ADD CONSTRAINT fk_ayna_subscriptions_users
              FOREIGN KEY (telegram_id) REFERENCES ayna_users(telegram_id) ON DELETE CASCADE;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ayna_user_preferences_users') THEN
              ALTER TABLE ayna_user_preferences
              ADD CONSTRAINT fk_ayna_user_preferences_users
              FOREIGN KEY (telegram_id) REFERENCES ayna_users(telegram_id) ON DELETE CASCADE;
            END IF;

            IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'fk_ayna_user_events_users') THEN
              ALTER TABLE ayna_user_events
              ADD CONSTRAINT fk_ayna_user_events_users
              FOREIGN KEY (telegram_id) REFERENCES ayna_users(telegram_id) ON DELETE CASCADE;
            END IF;
          END $$;

          CREATE INDEX IF NOT EXISTS idx_ayna_users_last_active ON ayna_users(last_active);
          CREATE INDEX IF NOT EXISTS idx_ayna_user_data_updated ON ayna_user_data(updated_at);
          CREATE INDEX IF NOT EXISTS idx_ayna_subscriptions_active ON ayna_subscriptions(is_active);
          CREATE INDEX IF NOT EXISTS idx_ayna_subscriptions_active_expires ON ayna_subscriptions(is_active, expires_at);
          CREATE INDEX IF NOT EXISTS idx_ayna_events_user_type ON ayna_user_events(telegram_id, event_type);
          CREATE INDEX IF NOT EXISTS idx_ayna_events_user_created ON ayna_user_events(telegram_id, created_at DESC);
          CREATE INDEX IF NOT EXISTS idx_ayna_events_created ON ayna_user_events(created_at);
          CREATE INDEX IF NOT EXISTS idx_ayna_payments_user ON ayna_payments(telegram_id);
          CREATE INDEX IF NOT EXISTS idx_ayna_payments_user_status ON ayna_payments(telegram_id, status);
          CREATE INDEX IF NOT EXISTS idx_ayna_payments_payload ON ayna_payments(invoice_payload);
        `);

        this.isPostgres = true;
        console.log(`✅ Connected to ${isNeon ? 'Neon Serverless PostgreSQL' : 'PostgreSQL'} database successfully with connection pooling, foreign keys and indexes!`);
        return;
      } catch (err) {
        if (isProd) {
          throw err;
        }
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
        if (!this.embeddedData.users) this.embeddedData.users = {};
        if (!this.embeddedData.dna) this.embeddedData.dna = {};
        if (!this.embeddedData.closet) this.embeddedData.closet = {};
        if (!this.embeddedData.shelf) this.embeddedData.shelf = {};
        if (!this.embeddedData.savedLooks) this.embeddedData.savedLooks = {};
        if (!this.embeddedData.subscriptions) this.embeddedData.subscriptions = {};
        if (!this.embeddedData.events) this.embeddedData.events = [];
        if (!this.embeddedData.preferences) this.embeddedData.preferences = {};
        if (!this.embeddedData.payments) this.embeddedData.payments = {};
      } else {
        this.saveEmbeddedData();
      }
    } catch (e) {
      console.warn('Failed to load embedded DB file, resetting to empty state:', e);
      this.embeddedData = {
        users: {},
        dna: {},
        closet: {},
        shelf: {},
        savedLooks: {},
        subscriptions: {},
        events: [],
        preferences: {},
        payments: {},
      };
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

  /**
   * Synchronizes user profile and assets transactionally.
   */
  async syncUserData(payload: UserSyncPayload): Promise<boolean> {
    const { telegramId, firstName, username, dna, closet, shelf, savedLooks } = payload;
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');

        await client.query(
          `INSERT INTO ayna_users (telegram_id, first_name, username, last_active, created_at)
           VALUES ($1, $2, $3, NOW(), NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             first_name = COALESCE($2, ayna_users.first_name),
             username = COALESCE($3, ayna_users.username),
             last_active = NOW()`,
          [telegramId, firstName || null, username || null]
        );

        await client.query(
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

        await client.query('COMMIT');
        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL syncUserData transaction error:', err);
        return false;
      } finally {
        client.release();
      }
    }

    // Embedded fallback
    const now = new Date().toISOString();
    if (!this.embeddedData.users[telegramId]) {
      this.embeddedData.users[telegramId] = {
        firstName,
        username,
        lastActive: now,
        createdAt: now,
      };
    } else {
      this.embeddedData.users[telegramId].firstName = firstName || this.embeddedData.users[telegramId].firstName;
      this.embeddedData.users[telegramId].username = username || this.embeddedData.users[telegramId].username;
      this.embeddedData.users[telegramId].lastActive = now;
    }

    if (dna) this.embeddedData.dna[telegramId] = dna;
    if (closet) this.embeddedData.closet[telegramId] = closet;
    if (shelf) this.embeddedData.shelf[telegramId] = shelf;
    if (savedLooks) this.embeddedData.savedLooks[telegramId] = savedLooks;

    this.saveEmbeddedData();
    return true;
  }

  /**
   * Fetches user profile, assets, and authoritative subscription.
   */
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
        const subscription = await this.getSubscription(telegramId);

        return {
          profile,
          dna: data.dna || undefined,
          closet: data.closet || undefined,
          shelf: data.shelf || undefined,
          savedLooks: data.saved_looks || undefined,
          subscription: subscription || undefined,
        };
      } catch (err) {
        console.error('PostgreSQL fetch error:', err);
        return null;
      }
    }

    // Embedded Mode
    const profile = this.embeddedData.users[telegramId];
    if (!profile) return null;
    const subscription = await this.getSubscription(telegramId);

    return {
      profile,
      dna: this.embeddedData.dna[telegramId],
      closet: this.embeddedData.closet[telegramId],
      shelf: this.embeddedData.shelf[telegramId],
      savedLooks: this.embeddedData.savedLooks[telegramId],
      subscription: subscription || null,
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

  /**
   * Resets personalization (DNA, Closet, Shelf, Saved Looks, Learned Preferences)
   * while safely preserving the user account and active paid subscription.
   */
  async resetPersonalization(telegramId: string): Promise<boolean> {
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');
        await client.query(
          `UPDATE ayna_user_data
           SET dna = $1, closet = '[]'::jsonb, shelf = '[]'::jsonb, saved_looks = '[]'::jsonb, updated_at = NOW()
           WHERE telegram_id = $2`,
          [JSON.stringify(DEFAULT_BEAUTY_DNA), telegramId]
        );
        await client.query(
          `INSERT INTO ayna_user_preferences (telegram_id, preferences, learned_weights, updated_at)
           VALUES ($1, '{}'::jsonb, '{}'::jsonb, NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             preferences = '{}'::jsonb,
             learned_weights = '{}'::jsonb,
             updated_at = NOW()`,
          [telegramId]
        );
        await client.query('COMMIT');
        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL resetPersonalization error:', err);
        return false;
      } finally {
        client.release();
      }
    }

    this.embeddedData.dna[telegramId] = DEFAULT_BEAUTY_DNA;
    this.embeddedData.closet[telegramId] = [];
    this.embeddedData.shelf[telegramId] = [];
    this.embeddedData.savedLooks[telegramId] = [];
    this.embeddedData.preferences[telegramId] = {
      preferences: {},
      learnedWeights: {},
      updatedAt: new Date().toISOString(),
    };
    this.saveEmbeddedData();
    return true;
  }

  /**
   * Deletes user-owned product data (closet, shelf, saved looks, preferences, events)
   * while keeping the user account shell and active paid subscription intact.
   */
  async deleteUserData(telegramId: string): Promise<boolean> {
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM ayna_user_events WHERE telegram_id = $1`, [telegramId]);
        await client.query(`DELETE FROM ayna_user_preferences WHERE telegram_id = $1`, [telegramId]);
        await client.query(`DELETE FROM ayna_user_data WHERE telegram_id = $1`, [telegramId]);
        await client.query('COMMIT');
        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL deleteUserData error:', err);
        return false;
      } finally {
        client.release();
      }
    }

    delete this.embeddedData.dna[telegramId];
    delete this.embeddedData.closet[telegramId];
    delete this.embeddedData.shelf[telegramId];
    delete this.embeddedData.savedLooks[telegramId];
    delete this.embeddedData.preferences[telegramId];
    this.embeddedData.events = this.embeddedData.events.filter((e) => e.telegramId !== telegramId);
    this.saveEmbeddedData();
    return true;
  }

  /**
   * Completely deletes the user account, subscription, and user data.
   * By default, financial payment records are anonymized to preserve audit integrity.
   */
  async deleteAccount(telegramId: string, options: { retainAuditPayments?: boolean } = { retainAuditPayments: true }): Promise<boolean> {
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');
        await client.query(`DELETE FROM ayna_user_events WHERE telegram_id = $1`, [telegramId]);
        await client.query(`DELETE FROM ayna_user_preferences WHERE telegram_id = $1`, [telegramId]);
        await client.query(`DELETE FROM ayna_user_data WHERE telegram_id = $1`, [telegramId]);
        await client.query(`DELETE FROM ayna_subscriptions WHERE telegram_id = $1`, [telegramId]);
        await client.query(`DELETE FROM ayna_users WHERE telegram_id = $1`, [telegramId]);

        if (options.retainAuditPayments) {
          await client.query(
            `UPDATE ayna_payments
             SET telegram_id = 'anonymized_' || id, is_anonymized = TRUE, updated_at = NOW()
             WHERE telegram_id = $1`,
            [telegramId]
          );
        } else {
          await client.query(`DELETE FROM ayna_payments WHERE telegram_id = $1`, [telegramId]);
        }

        await client.query('COMMIT');
        return true;
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL deleteAccount error:', err);
        return false;
      } finally {
        client.release();
      }
    }

    delete this.embeddedData.users[telegramId];
    delete this.embeddedData.dna[telegramId];
    delete this.embeddedData.closet[telegramId];
    delete this.embeddedData.shelf[telegramId];
    delete this.embeddedData.savedLooks[telegramId];
    delete this.embeddedData.subscriptions[telegramId];
    delete this.embeddedData.preferences[telegramId];
    this.embeddedData.events = this.embeddedData.events.filter((e) => e.telegramId !== telegramId);

    if (options.retainAuditPayments) {
      for (const [key, payment] of Object.entries(this.embeddedData.payments)) {
        if (payment.telegramId === telegramId) {
          payment.telegramId = `anonymized_${payment.id || key}`;
          payment.isAnonymized = true;
          payment.updatedAt = new Date().toISOString();
        }
      }
    } else {
      for (const [key, payment] of Object.entries(this.embeddedData.payments)) {
        if (payment.telegramId === telegramId) {
          delete this.embeddedData.payments[key];
        }
      }
    }

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
        const subRes = await this.pgPool.query(`SELECT * FROM ayna_subscriptions LIMIT 500`);
        return {
          timestamp: new Date().toISOString(),
          engine: 'postgresql',
          users: usersRes.rows,
          userData: dataRes.rows,
          subscriptions: subRes.rows,
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

  /**
   * Sets user subscription in the authoritative ayna_subscriptions table.
   */
  async setSubscription(telegramId: string, subscription: any): Promise<boolean> {
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        const expiresAt = subscription.expiresAt ? new Date(subscription.expiresAt) : null;
        await this.pgPool.query(
          `INSERT INTO ayna_subscriptions (telegram_id, tier, is_active, plan_name, payment_method, expires_at, started_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, NOW(), NOW())
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
            expiresAt,
          ]
        );
        return true;
      } catch (err) {
        console.error('PostgreSQL setSubscription error:', err);
        return false;
      }
    }

    this.embeddedData.subscriptions[telegramId] = {
      ...subscription,
      startedAt: subscription.startedAt || new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.saveEmbeddedData();
    return true;
  }

  /**
   * Canonical, server-authoritative subscription retrieval.
   * Enforces automatic expiration calculation against current server timestamp.
   */
  async getSubscription(telegramId: string): Promise<any | null> {
    if (!isSafeId(telegramId)) return null;

    if (this.isPostgres && this.pgPool) {
      try {
        // Query authoritative relational table first
        const subRes = await this.pgPool.query(
          `SELECT * FROM ayna_subscriptions WHERE telegram_id = $1`,
          [telegramId]
        );
        if (subRes.rows[0]) {
          const row = subRes.rows[0];
          const isExpired = row.expires_at ? new Date(row.expires_at).getTime() < Date.now() : false;
          return {
            tier: row.tier,
            isActive: Boolean(row.is_active) && !isExpired,
            expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
            planName: row.plan_name,
            paymentMethod: row.payment_method,
            startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
          };
        }

        // Backward compatibility fallback to ayna_user_data.subscription if no relational row
        const res = await this.pgPool.query(
          `SELECT subscription FROM ayna_user_data WHERE telegram_id = $1`,
          [telegramId]
        );
        if (res.rows[0]?.subscription) {
          const legacySub = res.rows[0].subscription;
          const isExpired = legacySub.expiresAt ? new Date(legacySub.expiresAt).getTime() < Date.now() : false;
          return {
            ...legacySub,
            isActive: Boolean(legacySub.isActive) && !isExpired,
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getSubscription error:', err);
        return null;
      }
    }

    const sub = this.embeddedData.subscriptions[telegramId];
    if (!sub) return null;
    const isExpired = sub.expiresAt ? new Date(sub.expiresAt).getTime() < Date.now() : false;
    return {
      ...sub,
      isActive: Boolean(sub.isActive) && !isExpired,
    };
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
        return res.rows.map((row: any) => {
          const isExpired = row.expires_at ? new Date(row.expires_at).getTime() < Date.now() : false;
          return {
            telegramId: row.telegram_id,
            subscription: {
              tier: row.tier,
              isActive: Boolean(row.is_active) && !isExpired,
              expiresAt: row.expires_at ? new Date(row.expires_at).toISOString() : undefined,
              planName: row.plan_name,
              paymentMethod: row.payment_method,
              startedAt: row.started_at ? new Date(row.started_at).toISOString() : undefined,
            },
            user: {
              firstName: row.first_name,
              username: row.username,
            },
          };
        });
      } catch (err) {
        console.error('PostgreSQL getAllSubscriptions error:', err);
        return [];
      }
    }

    return Object.entries(this.embeddedData.subscriptions).map(([id, sub]) => {
      const isExpired = sub.expiresAt ? new Date(sub.expiresAt).getTime() < Date.now() : false;
      return {
        telegramId: id,
        subscription: {
          ...sub,
          isActive: Boolean(sub.isActive) && !isExpired,
        },
        user: this.embeddedData.users[id] || null,
      };
    });
  }

  // -------------------------------------------------------------
  // User Feedback Events & Behavioral Learning Persistence
  // -------------------------------------------------------------
  async recordEvent(event: {
    telegramId: string;
    eventType: string;
    feature?: string;
    context?: any;
    metadata?: any;
  }): Promise<boolean> {
    const { telegramId, eventType, feature, context, metadata } = event;
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ayna_user_events (telegram_id, event_type, feature, context, metadata, created_at)
           VALUES ($1, $2, $3, $4, $5, NOW())`,
          [
            telegramId,
            eventType,
            feature || null,
            context ? JSON.stringify(context) : null,
            metadata ? JSON.stringify(metadata) : null,
          ]
        );
        return true;
      } catch (err) {
        console.error('PostgreSQL recordEvent error:', err);
        return false;
      }
    }

    // Embedded fallback
    const id = this.embeddedData.events.length + 1;
    this.embeddedData.events.push({
      id,
      telegramId,
      eventType,
      feature,
      context,
      metadata,
      createdAt: new Date().toISOString(),
    });
    this.saveEmbeddedData();
    return true;
  }

  async getUserEvents(telegramId: string, limit = 50): Promise<any[]> {
    if (!isSafeId(telegramId)) return [];

    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT id, telegram_id, event_type, feature, context, metadata, created_at
           FROM ayna_user_events
           WHERE telegram_id = $1
           ORDER BY created_at DESC
           LIMIT $2`,
          [telegramId, limit]
        );
        return res.rows.map((row: any) => ({
          id: row.id,
          telegramId: row.telegram_id,
          eventType: row.event_type,
          feature: row.feature,
          context: row.context,
          metadata: row.metadata,
          createdAt: row.created_at,
        }));
      } catch (err) {
        console.error('PostgreSQL getUserEvents error:', err);
        return [];
      }
    }

    return this.embeddedData.events
      .filter((e) => e.telegramId === telegramId)
      .slice(-limit)
      .reverse();
  }

  /**
   * Prunes interaction events older than retentionDays (Data Minimization / Privacy Policy).
   */
  async pruneOldEvents(retentionDays = 90): Promise<number> {
    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `DELETE FROM ayna_user_events WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
          [retentionDays]
        );
        return res.rowCount ?? 0;
      } catch (err) {
        console.error('PostgreSQL pruneOldEvents error:', err);
        return 0;
      }
    }

    const cutoffTime = Date.now() - retentionDays * 86400000;
    const initialCount = this.embeddedData.events.length;
    this.embeddedData.events = this.embeddedData.events.filter(
      (e) => new Date(e.createdAt).getTime() >= cutoffTime
    );
    const prunedCount = initialCount - this.embeddedData.events.length;
    if (prunedCount > 0) this.saveEmbeddedData();
    return prunedCount;
  }

  async getLearnedPreferences(telegramId: string): Promise<any | null> {
    if (!isSafeId(telegramId)) return null;

    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT preferences, learned_weights, updated_at
           FROM ayna_user_preferences
           WHERE telegram_id = $1`,
          [telegramId]
        );
        if (res.rows[0]) {
          return {
            preferences: res.rows[0].preferences,
            learnedWeights: res.rows[0].learned_weights,
            updatedAt: res.rows[0].updated_at,
          };
        }
        return null;
      } catch (err) {
        console.error('PostgreSQL getLearnedPreferences error:', err);
        return null;
      }
    }

    return this.embeddedData.preferences[telegramId] || null;
  }

  async saveLearnedPreferences(telegramId: string, preferences: any, learnedWeights: any): Promise<boolean> {
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ayna_user_preferences (telegram_id, preferences, learned_weights, updated_at)
           VALUES ($1, $2, $3, NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             preferences = COALESCE($2, ayna_user_preferences.preferences),
             learned_weights = COALESCE($3, ayna_user_preferences.learned_weights),
             updated_at = NOW()`,
          [telegramId, JSON.stringify(preferences || {}), JSON.stringify(learnedWeights || {})]
        );
        return true;
      } catch (err) {
        console.error('PostgreSQL saveLearnedPreferences error:', err);
        return false;
      }
    }

    this.embeddedData.preferences[telegramId] = {
      preferences: preferences || {},
      learnedWeights: learnedWeights || {},
      updatedAt: new Date().toISOString(),
    };
    this.saveEmbeddedData();
    return true;
  }

  // -------------------------------------------------------------
  // Telegram Stars & Payment Record Persistence
  // -------------------------------------------------------------
  async createPaymentRecord(record: {
    telegramId: string;
    provider: string;
    planId: string;
    amountStars?: number;
    amountToman?: number;
    invoicePayload: string;
  }): Promise<boolean> {
    const { telegramId, provider, planId, amountStars, amountToman, invoicePayload } = record;
    if (!isSafeId(telegramId)) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `INSERT INTO ayna_payments (telegram_id, provider, plan_id, amount_stars, amount_toman, invoice_payload, status, created_at, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6, 'pending', NOW(), NOW())
           ON CONFLICT (invoice_payload) DO NOTHING`,
          [telegramId, provider, planId, amountStars || null, amountToman || null, invoicePayload]
        );
        return true;
      } catch (err) {
        console.error('PostgreSQL createPaymentRecord error:', err);
        return false;
      }
    }

    if (!this.embeddedData.payments[invoicePayload]) {
      this.embeddedData.payments[invoicePayload] = {
        ...record,
        status: 'pending',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.saveEmbeddedData();
    }
    return true;
  }

  async updatePaymentStatus(invoicePayload: string, status: string, chargeId?: string): Promise<boolean> {
    if (!invoicePayload) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        await this.pgPool.query(
          `UPDATE ayna_payments
           SET status = $1, telegram_payment_charge_id = COALESCE($2, telegram_payment_charge_id), updated_at = NOW()
           WHERE invoice_payload = $3`,
          [status, chargeId || null, invoicePayload]
        );
        return true;
      } catch (err) {
        console.error('PostgreSQL updatePaymentStatus error:', err);
        return false;
      }
    }

    if (this.embeddedData.payments[invoicePayload]) {
      this.embeddedData.payments[invoicePayload].status = status;
      if (chargeId) this.embeddedData.payments[invoicePayload].telegramPaymentChargeId = chargeId;
      this.embeddedData.payments[invoicePayload].updatedAt = new Date().toISOString();
      this.saveEmbeddedData();
      return true;
    }
    return false;
  }

  /**
   * Atomically transitions a pending payment to completed.
   * Enforces idempotency: Returns true only if status changed from 'pending' to 'completed'.
   */
  async transitionPaymentToCompleted(invoicePayload: string, chargeId?: string): Promise<boolean> {
    if (!invoicePayload) return false;

    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `UPDATE ayna_payments
           SET status = 'completed',
               telegram_payment_charge_id = COALESCE($1, telegram_payment_charge_id),
               updated_at = NOW()
           WHERE invoice_payload = $2 AND status = 'pending'`,
          [chargeId || null, invoicePayload]
        );
        return (res.rowCount ?? 0) > 0;
      } catch (err) {
        console.error('PostgreSQL transitionPaymentToCompleted error:', err);
        return false;
      }
    }

    if (this.embeddedData.payments[invoicePayload]) {
      const rec = this.embeddedData.payments[invoicePayload];
      if (rec.status === 'pending') {
        rec.status = 'completed';
        if (chargeId) rec.telegramPaymentChargeId = chargeId;
        rec.updatedAt = new Date().toISOString();
        this.saveEmbeddedData();
        return true;
      }
    }
    return false;
  }

  /**
   * Atomically settles a payment, grants subscription, and records event in a single transaction.
   * Guaranteed against race conditions and partial failures.
   */
  async settlePaymentAndGrantSubscription(params: {
    invoicePayload: string;
    chargeId?: string;
    subscription: {
      tier: string;
      planName?: string;
      durationMonths: number;
      paymentMethod?: string;
    };
    eventMetadata?: any;
  }): Promise<{ success: boolean; duplicate?: boolean; notFound?: boolean; subscription?: any }> {
    const { invoicePayload, chargeId, subscription, eventMetadata } = params;

    if (this.isPostgres && this.pgPool) {
      const client = await this.pgPool.connect();
      try {
        await client.query('BEGIN');

        // 1. Check and atomically transition payment record
        const paymentRes = await client.query(
          `UPDATE ayna_payments
           SET status = 'completed',
               telegram_payment_charge_id = COALESCE($1, telegram_payment_charge_id),
               updated_at = NOW()
           WHERE invoice_payload = $2 AND status = 'pending'
           RETURNING telegram_id, plan_id, amount_stars`,
          [chargeId || null, invoicePayload]
        );

        if ((paymentRes.rowCount ?? 0) === 0) {
          // Check if already completed
          const existingRes = await client.query(
            `SELECT status FROM ayna_payments WHERE invoice_payload = $1`,
            [invoicePayload]
          );
          await client.query('ROLLBACK');
          if (existingRes.rows[0]?.status === 'completed') {
            return { success: false, duplicate: true };
          }
          return { success: false, notFound: true };
        }

        const telegramId = paymentRes.rows[0].telegram_id;
        const expiryDate = new Date();
        expiryDate.setMonth(expiryDate.getMonth() + subscription.durationMonths);

        // 2. Grant authoritative subscription
        await client.query(
          `INSERT INTO ayna_subscriptions (telegram_id, tier, is_active, plan_name, payment_method, expires_at, started_at, updated_at)
           VALUES ($1, $2, TRUE, $3, $4, $5, NOW(), NOW())
           ON CONFLICT (telegram_id) DO UPDATE SET
             tier = $2,
             is_active = TRUE,
             plan_name = $3,
             payment_method = $4,
             expires_at = $5,
             updated_at = NOW()`,
          [
            telegramId,
            subscription.tier,
            subscription.planName || null,
            subscription.paymentMethod || 'stars',
            expiryDate,
          ]
        );

        // 3. Record audit event
        await client.query(
          `INSERT INTO ayna_user_events (telegram_id, event_type, feature, metadata, created_at)
           VALUES ($1, 'look_tried', 'subscription_stars', $2, NOW())`,
          [telegramId, JSON.stringify(eventMetadata || { planId: subscription.tier })]
        );

        await client.query('COMMIT');

        const activeSub = {
          tier: subscription.tier,
          isActive: true,
          expiresAt: expiryDate.toISOString(),
          startedAt: new Date().toISOString(),
          planName: subscription.planName,
          paymentMethod: subscription.paymentMethod || 'stars',
        };

        return { success: true, subscription: activeSub };
      } catch (err) {
        await client.query('ROLLBACK');
        console.error('PostgreSQL settlePaymentAndGrantSubscription transaction error:', err);
        return { success: false };
      } finally {
        client.release();
      }
    }

    // Embedded Mode
    const rec = this.embeddedData.payments[invoicePayload];
    if (!rec) return { success: false, notFound: true };
    if (rec.status === 'completed') return { success: false, duplicate: true };

    rec.status = 'completed';
    if (chargeId) rec.telegramPaymentChargeId = chargeId;
    rec.updatedAt = new Date().toISOString();

    const expiryDate = new Date();
    expiryDate.setMonth(expiryDate.getMonth() + subscription.durationMonths);

    const activeSub = {
      tier: subscription.tier,
      isActive: true,
      expiresAt: expiryDate.toISOString(),
      startedAt: new Date().toISOString(),
      planName: subscription.planName,
      paymentMethod: subscription.paymentMethod || 'stars',
    };

    this.embeddedData.subscriptions[rec.telegramId] = activeSub;

    this.embeddedData.events.push({
      id: this.embeddedData.events.length + 1,
      telegramId: rec.telegramId,
      eventType: 'look_tried',
      feature: 'subscription_stars',
      metadata: eventMetadata || { planId: subscription.tier },
      createdAt: new Date().toISOString(),
    });

    this.saveEmbeddedData();
    return { success: true, subscription: activeSub };
  }

  async getPaymentRecord(invoicePayload: string): Promise<any | null> {
    if (!invoicePayload) return null;

    if (this.isPostgres && this.pgPool) {
      try {
        const res = await this.pgPool.query(
          `SELECT * FROM ayna_payments WHERE invoice_payload = $1`,
          [invoicePayload]
        );
        return res.rows[0] || null;
      } catch (err) {
        console.error('PostgreSQL getPaymentRecord error:', err);
        return null;
      }
    }

    return this.embeddedData.payments[invoicePayload] || null;
  }

  /**
   * Assembles a complete, consistent UserContext for the Beauty Intelligence Engine.
   * Ready for Phase 3 without implementing prompt mechanics early.
   */
  async getUserContext(telegramId: string): Promise<UserContext> {
    const rawData = await this.getUserData(telegramId);
    const userPrefs = await this.getLearnedPreferences(telegramId);
    const recentEvents = await this.getUserEvents(telegramId, 100);

    const beautyDNA: BeautyDna = rawData?.dna || DEFAULT_BEAUTY_DNA;
    const styleDNA: ExtendedStyleDNA = {
      ...DEFAULT_STYLE_DNA,
      ...(beautyDNA.styleDna ? {
        minimalVsMaximal: beautyDNA.styleDna.minimalVsMaximal ?? 35,
        neutralVsColorful: beautyDNA.styleDna.colorfulVsNeutral ?? 30,
        subtleVsBold: beautyDNA.styleDna.boldVsSubtle ?? 45,
        feminineVsStructured: beautyDNA.styleDna.feminineVsStructured ?? 55,
        comfortVsFashion: beautyDNA.styleDna.comfortVsFashion ?? 70,
        primaryArchetype: beautyDNA.styleDna.primaryArchetype || DEFAULT_STYLE_DNA.primaryArchetype,
        secondaryArchetype: beautyDNA.styleDna.secondaryArchetype || DEFAULT_STYLE_DNA.secondaryArchetype,
      } : {}),
    };

    const colorDNA: ColorDNA = DEFAULT_COLOR_DNA;

    const totalLooksTried = recentEvents.filter((e) => e.eventType === 'look_tried').length;
    const totalLooksSaved = Array.isArray(rawData?.savedLooks) ? rawData.savedLooks.length : 0;
    const lastEvent = recentEvents[0];

    const preferences: UserPreferences = {
      preferredRoutineTimeMinutes: beautyDNA.dailyRoutineTime || 10,
      avoidHeavyTextures: userPrefs?.preferences?.avoidHeavyTextures ?? true,
      prefersQuickFixes: userPrefs?.preferences?.prefersQuickFixes ?? true,
      bodyComfortFirst: userPrefs?.preferences?.bodyComfortFirst ?? true,
    };

    return {
      identity: {
        telegramId,
        firstName: rawData?.profile?.first_name || rawData?.profile?.firstName,
        username: rawData?.profile?.username,
      },
      beautyDNA,
      styleDNA,
      colorDNA,
      closet: (rawData?.closet as ClosetItem[]) || [],
      shelf: (rawData?.shelf as BeautyProductItem[]) || [],
      savedLooks: (rawData?.savedLooks as SavedLook[]) || [],
      subscription: rawData?.subscription as UserSubscription | undefined,
      preferences,
      currentContext: {},
      concerns: [],
      history: {
        totalLooksTried,
        totalLooksSaved,
        lastActiveSession: lastEvent?.createdAt || rawData?.profile?.last_active,
      },
    };
  }
}

export const db = new DatabaseService();
