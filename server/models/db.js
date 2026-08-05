const pool = require("../config/database");

const MIGRATION = `
  CREATE TABLE IF NOT EXISTS reports (
    id              SERIAL PRIMARY KEY,
    screenshot_path TEXT NOT NULL,
    extracted_text  TEXT,
    category        VARCHAR(50),
    severity        VARCHAR(20),
    guidance        TEXT,
    status          VARCHAR(20) DEFAULT 'new',
    is_anonymous    BOOLEAN DEFAULT TRUE,
    created_at      TIMESTAMP DEFAULT NOW(),
    updated_at      TIMESTAMP DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS idx_reports_category   ON reports(category);
  CREATE INDEX IF NOT EXISTS idx_reports_severity   ON reports(severity);
  CREATE INDEX IF NOT EXISTS idx_reports_status     ON reports(status);
  CREATE INDEX IF NOT EXISTS idx_reports_created_at ON reports(created_at DESC);
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
