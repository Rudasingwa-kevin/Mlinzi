const pool = require("../config/database");
const logger = require("../config/logger");

async function migrate() {
  const MAX_RETRIES = 5;
  const RETRY_DELAY = 5000;

  for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
    try {
      // Test connection first
      await pool.query("SELECT 1");

      // Users table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS users (
          id              SERIAL PRIMARY KEY,
          email           VARCHAR(255) UNIQUE NOT NULL,
          password        VARCHAR(255) NOT NULL,
          full_name       VARCHAR(255) NOT NULL,
          role            VARCHAR(20) NOT NULL CHECK (role IN ('counselor', 'national_society')),
          is_approved     BOOLEAN DEFAULT FALSE,
          phone           VARCHAR(30),
          district        VARCHAR(100),
          created_at      TIMESTAMP DEFAULT NOW()
        )
      `);

      // Add new columns to existing users table
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS phone VARCHAR(30)`);
      await pool.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS district VARCHAR(100)`);

      // Reports table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS reports (
          id                  SERIAL PRIMARY KEY,
          screenshot_path     TEXT,
          extracted_text      TEXT,
          category            VARCHAR(50),
          severity            VARCHAR(20),
          confidence          DECIMAL(5,2),
          recommended_action  VARCHAR(30) DEFAULT 'guidance_only',
          guidance            TEXT,
          channel             VARCHAR(20) DEFAULT 'web',
          district            VARCHAR(100),
          escalated           BOOLEAN DEFAULT FALSE,
          is_anonymous        BOOLEAN DEFAULT TRUE,
          created_at          TIMESTAMP DEFAULT NOW(),
          updated_at          TIMESTAMP DEFAULT NOW()
        )
      `);

      // Add new columns to existing reports table
      await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS district VARCHAR(100)`);
      await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS escalated BOOLEAN DEFAULT FALSE`);
      await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS channel VARCHAR(20) DEFAULT 'web'`);
      await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS confidence DECIMAL(5,2)`);
      await pool.query(`ALTER TABLE reports ADD COLUMN IF NOT EXISTS recommended_action VARCHAR(30) DEFAULT 'guidance_only'`);
      await pool.query(`ALTER TABLE reports ALTER COLUMN screenshot_path DROP NOT NULL`);

      // Referral cases table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS referral_cases (
          id                    SERIAL PRIMARY KEY,
          report_id             INTEGER REFERENCES reports(id) ON DELETE CASCADE,
          district              VARCHAR(100) NOT NULL,
          preferred_contact     VARCHAR(20) NOT NULL CHECK (preferred_contact IN ('phone', 'sms', 'whatsapp', 'email')),
          contact_value         TEXT NOT NULL,
          best_time             VARCHAR(100),
          is_safe               VARCHAR(10),
          status                VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'resolved')),
          assigned_counselor_id INTEGER REFERENCES users(id),
          first_response_at     TIMESTAMP,
          resolved_at           TIMESTAMP,
          created_at            TIMESTAMP DEFAULT NOW()
        )
      `);

      // Counselor notes table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS counselor_notes (
          id              SERIAL PRIMARY KEY,
          case_id         INTEGER REFERENCES referral_cases(id) ON DELETE CASCADE,
          counselor_id    INTEGER REFERENCES users(id),
          note            TEXT NOT NULL,
          created_at      TIMESTAMP DEFAULT NOW()
        )
      `);

      // SMS/WhatsApp sessions
      await pool.query(`
        CREATE TABLE IF NOT EXISTS sms_sessions (
          id              SERIAL PRIMARY KEY,
          phone_number    VARCHAR(30) NOT NULL,
          channel         VARCHAR(20) NOT NULL DEFAULT 'sms',
          state           VARCHAR(30) DEFAULT 'idle',
          report_id       INTEGER REFERENCES reports(id) ON DELETE SET NULL,
          district        VARCHAR(100),
          last_message    TEXT,
          created_at      TIMESTAMP DEFAULT NOW(),
          updated_at      TIMESTAMP DEFAULT NOW()
        )
      `);

      // Notifications table
      await pool.query(`
        CREATE TABLE IF NOT EXISTS notifications (
          id              SERIAL PRIMARY KEY,
          recipient_type  VARCHAR(20) NOT NULL CHECK (recipient_type IN ('counselor', 'child')),
          recipient_id    INTEGER,
          channel         VARCHAR(20) NOT NULL CHECK (channel IN ('sms', 'whatsapp', 'email', 'in_app')),
          title           VARCHAR(255),
          message         TEXT NOT NULL,
          read            BOOLEAN DEFAULT FALSE,
          sent            BOOLEAN DEFAULT FALSE,
          error           TEXT,
          created_at      TIMESTAMP DEFAULT NOW()
        )
      `);

      // Password reset tokens
      await pool.query(`
        CREATE TABLE IF NOT EXISTS password_reset_tokens (
          id              SERIAL PRIMARY KEY,
          user_id         INTEGER REFERENCES users(id) ON DELETE CASCADE,
          token           VARCHAR(255) UNIQUE NOT NULL,
          expires_at      TIMESTAMP NOT NULL,
          used            BOOLEAN DEFAULT FALSE,
          created_at      TIMESTAMP DEFAULT NOW()
        )
      `);

      // OTP codes
      await pool.query(`
        CREATE TABLE IF NOT EXISTS otp_codes (
          id              SERIAL PRIMARY KEY,
          destination     VARCHAR(255) NOT NULL,
          code            VARCHAR(6) NOT NULL,
          purpose         VARCHAR(20) NOT NULL CHECK (purpose IN ('signup', 'reset')),
          expires_at      TIMESTAMP NOT NULL,
          attempts        INTEGER DEFAULT 0,
          verified        BOOLEAN DEFAULT FALSE,
          created_at      TIMESTAMP DEFAULT NOW()
        )
      `);
      await pool.query(`DO $$ BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'otp_codes' AND column_name = 'phone') THEN
          ALTER TABLE otp_codes RENAME COLUMN phone TO destination;
        END IF;
      END $$;`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_otp_dest_purpose ON otp_codes(destination, purpose)`);
      await pool.query(`DROP INDEX IF EXISTS idx_otp_phone_purpose`);

      // Indexes
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_category     ON reports(category)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_severity     ON reports(severity)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_escalated    ON reports(escalated)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_channel      ON reports(channel)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_reports_created_at   ON reports(created_at DESC)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_status      ON referral_cases(status)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_counselor   ON referral_cases(assigned_counselor_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_district    ON referral_cases(district)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_referral_created     ON referral_cases(created_at DESC)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_sms_sessions_phone   ON sms_sessions(phone_number)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_recip  ON notifications(recipient_type, recipient_id)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_otp_created_at         ON otp_codes(created_at)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_prt_created_at         ON password_reset_tokens(created_at)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_sms_sessions_created   ON sms_sessions(created_at)`);
      await pool.query(`CREATE INDEX IF NOT EXISTS idx_notifications_created   ON notifications(created_at)`);

      logger.info("Database migration complete");
      return;
    } catch (err) {
      logger.warn({ err, attempt, maxRetries: MAX_RETRIES }, "Migration attempt failed");
      if (attempt < MAX_RETRIES) {
        logger.info(`Retrying migration in ${RETRY_DELAY / 1000}s...`);
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      } else {
        logger.error({ err }, "Migration failed after all retries");
        process.exit(1);
      }
    }
  }
}

module.exports = migrate;
