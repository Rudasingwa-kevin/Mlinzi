const pool = require("../config/database");
const fs = require("fs");
const path = require("path");
const logger = require("../config/logger");

// ── Configuration ──

const RETENTION_DAYS = parseInt(process.env.RETENTION_DAYS, 10) || 90;

// Shorter TTLs for transient data
const OTP_RETENTION_DAYS = 1;
const TOKEN_RETENTION_DAYS = 7;

// ── Purge functions ──

/**
 * Purge expired OTP codes (older than OTP_RETENTION_DAYS).
 * These are short-lived by nature — 10 min expiry, but keep 1 day for audit.
 */
async function purgeExpiredOTP() {
  const result = await pool.query(
    `DELETE FROM otp_codes WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
    [OTP_RETENTION_DAYS]
  );
  return { table: "otp_codes", deleted: result.rowCount };
}

/**
 * Purge expired password reset tokens (older than TOKEN_RETENTION_DAYS).
 */
async function purgeExpiredTokens() {
  const result = await pool.query(
    `DELETE FROM password_reset_tokens WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
    [TOKEN_RETENTION_DAYS]
  );
  return { table: "password_reset_tokens", deleted: result.rowCount };
}

/**
 * Purge old anonymous reports (older than RETENTION_DAYS).
 * ON DELETE CASCADE handles: referral_cases, counselor_notes.
 * Also deletes associated screenshot files.
 */
async function purgeOldReports() {
  // Collect screenshot paths before deleting
  const files = await pool.query(
    `SELECT screenshot_path FROM reports
     WHERE created_at < NOW() - INTERVAL '1 day' * $1
       AND screenshot_path IS NOT NULL`,
    [RETENTION_DAYS]
  );

  // Delete DB rows (CASCADE removes referral_cases + counselor_notes)
  const result = await pool.query(
    `DELETE FROM reports WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
    [RETENTION_DAYS]
  );

  // Delete screenshot files from disk
  let filesDeleted = 0;
  const uploadDir = path.join(__dirname, "..", "uploads");
  for (const row of files.rows) {
    const filePath = path.join(uploadDir, row.screenshot_path);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        filesDeleted++;
      }
    } catch { /* ignore file errors */ }
  }

  return { table: "reports", deleted: result.rowCount, filesDeleted };
}

/**
 * Purge old SMS/WhatsApp sessions (older than RETENTION_DAYS).
 */
async function purgeOldSessions() {
  const result = await pool.query(
    `DELETE FROM sms_sessions WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
    [RETENTION_DAYS]
  );
  return { table: "sms_sessions", deleted: result.rowCount };
}

/**
 * Purge old notifications (older than RETENTION_DAYS).
 */
async function purgeOldNotifications() {
  const result = await pool.query(
    `DELETE FROM notifications WHERE created_at < NOW() - INTERVAL '1 day' * $1`,
    [RETENTION_DAYS]
  );
  return { table: "notifications", deleted: result.rowCount };
}

/**
 * Delete a specific user and all their data.
 * For self-service account deletion.
 */
async function deleteUser(userId) {
  // Collect screenshot paths for this user's reports
  const files = await pool.query(
    `SELECT screenshot_path FROM reports r
     JOIN referral_cases rc ON rc.report_id = r.id
     WHERE rc.assigned_counselor_id = $1
       AND r.screenshot_path IS NOT NULL`,
    [userId]
  );

  // Delete user — CASCADE removes: referral_cases, counselor_notes,
  // password_reset_tokens. Reports stay if they have no other counselor link.
  await pool.query(`DELETE FROM users WHERE id = $1`, [userId]);

  // Delete orphaned screenshot files
  const uploadDir = path.join(__dirname, "..", "uploads");
  for (const row of files.rows) {
    const filePath = path.join(uploadDir, row.screenshot_path);
    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
      }
    } catch { /* ignore */ }
  }
}

// ── Stats ──

/**
 * Get counts of records that would be purged.
 * Useful for admin dashboard.
 */
async function getRetentionStats() {
  const [reports, referrals, notes, sessions, notifications, otp, tokens] =
    await Promise.all([
      pool.query(
        `SELECT COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day' * $1)::int AS expired
         FROM reports`, [RETENTION_DAYS]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day' * $1)::int AS expired
         FROM referral_cases`, [RETENTION_DAYS]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day' * $1)::int AS expired
         FROM counselor_notes`, [RETENTION_DAYS]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day' * $1)::int AS expired
         FROM sms_sessions`, [RETENTION_DAYS]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day' * $1)::int AS expired
         FROM notifications`, [RETENTION_DAYS]
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day' * 1)::int AS expired
         FROM otp_codes`
      ),
      pool.query(
        `SELECT COUNT(*)::int AS count,
                COUNT(*) FILTER (WHERE created_at < NOW() - INTERVAL '1 day' * 7)::int AS expired
         FROM password_reset_tokens`
      ),
    ]);

  return {
    retentionDays: RETENTION_DAYS,
    tables: {
      reports:           { total: reports.rows[0].count,           expired: reports.rows[0].expired },
      referral_cases:    { total: referrals.rows[0].count,        expired: referrals.rows[0].expired },
      counselor_notes:   { total: notes.rows[0].count,            expired: notes.rows[0].expired },
      sms_sessions:      { total: sessions.rows[0].count,         expired: sessions.rows[0].expired },
      notifications:     { total: notifications.rows[0].count,    expired: notifications.rows[0].expired },
      otp_codes:         { total: otp.rows[0].count,              expired: otp.rows[0].expired },
      password_reset_tokens: { total: tokens.rows[0].count,       expired: tokens.rows[0].expired },
    },
  };
}

// ── Full purge ──

/**
 * Run all purge operations. Returns summary.
 */
async function runFullPurge() {
  const results = await Promise.all([
    purgeExpiredOTP(),
    purgeExpiredTokens(),
    purgeOldReports(),
    purgeOldSessions(),
    purgeOldNotifications(),
  ]);

  const summary = {
    timestamp: new Date().toISOString(),
    retentionDays: RETENTION_DAYS,
    results,
    totalDeleted: results.reduce((sum, r) => sum + r.deleted, 0),
  };

  logger.info({ totalDeleted: summary.totalDeleted }, "Data retention purge complete");
  return summary;
}

module.exports = {
  purgeExpiredOTP,
  purgeExpiredTokens,
  purgeOldReports,
  purgeOldSessions,
  purgeOldNotifications,
  deleteUser,
  getRetentionStats,
  runFullPurge,
  RETENTION_DAYS,
};
