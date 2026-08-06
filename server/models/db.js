const pool = require("../config/database");

const RWANDA_DISTRICTS = [
  "Bugesera", "Gatsibo", "Kayonza", "Kirehe", "Ngoma", "Nyagatare", "Rwamagana",
  "Burera", "Gakenke", "Gicumbi", "Musanze", "Rulindo",
  "Gasabo", "Kicukiro", "Nyarugenge",
  "Gisagara", "Huye", "Kamonyi", "Muhanga", "Nyamagabe", "Nyanza", "Nyaruguru", "Ruhango",
  "Bugarama", "Kamembe", "Murundi", "Nyamashepe", "Nyungwe", "Rusizi",
  "Karongi", "Ngorester", "Nyabihu", "Nyamashepe", "Rubavu", "Rutsiro",
  "Gakenke", "Musanze", "Rulindo"
];

const MIGRATION = `
  CREATE TABLE IF NOT EXISTS users (
    id              SERIAL PRIMARY KEY,
    email           VARCHAR(255) UNIQUE NOT NULL,
    password        VARCHAR(255) NOT NULL,
    full_name       VARCHAR(255) NOT NULL,
    role            VARCHAR(20) NOT NULL CHECK (role IN ('counselor', 'national_society')),
    is_approved     BOOLEAN DEFAULT FALSE,
    created_at      TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS reports (
    id              SERIAL PRIMARY KEY,
    screenshot_path TEXT,
    extracted_text  TEXT,
    category        VARCHAR(50),
    severity        VARCHAR(20),
    guidance        TEXT,
    district        VARCHAR(100),
    escalated       BOOLEAN DEFAULT FALSE,
    is_anonymous    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS referral_cases (
    id                  SERIAL PRIMARY KEY,
    report_id           INTEGER REFERENCES reports(id) ON DELETE CASCADE,
    district            VARCHAR(100) NOT NULL,
    preferred_contact   VARCHAR(20) NOT NULL CHECK (preferred_contact IN ('phone', 'sms', 'whatsapp', 'email')),
    contact_value       TEXT NOT NULL,
    best_time           VARCHAR(100),
    is_safe             VARCHAR(10),
    status              VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'under_review', 'resolved')),
    assigned_counselor_id INTEGER REFERENCES users(id),
    first_response_at   TIMESTAMP,
    resolved_at         TIMESTAMP,
    created_at          TIMESTAMP DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS counselor_notes (
    id              SERIAL PRIMARY KEY,
    case_id         INTEGER REFERENCES referral_cases(id) ON DELETE CASCADE,
    counselor_id    INTEGER REFERENCES users(id),
    note            TEXT NOT NULL,
    created_at      TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_reports_category     ON reports(category);
  CREATE INDEX IF NOT EXISTS idx_reports_severity     ON reports(severity);
  CREATE INDEX IF NOT EXISTS idx_reports_escalated    ON reports(escalated);
  CREATE INDEX IF NOT EXISTS idx_reports_created_at   ON reports(created_at DESC);
  CREATE INDEX IF NOT EXISTS idx_referral_status      ON referral_cases(status);
  CREATE INDEX IF NOT EXISTS idx_referral_counselor   ON referral_cases(assigned_counselor_id);
  CREATE INDEX IF NOT EXISTS idx_referral_district    ON referral_cases(district);
  CREATE INDEX IF NOT EXISTS idx_referral_created     ON referral_cases(created_at DESC);
`;

async function migrate() {
  try {
    await pool.query(MIGRATION);
    console.log("Database migration complete — reports table ready");
  } catch (err) {
    console.error("Migration failed:", err.message);
    process.exit(1);
  }
}

module.exports = migrate;
